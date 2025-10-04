use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;
use std::collections::HashMap;

use crate::models::{Proposal, Submission, Tally};

// Handlers
pub async fn tally_proposal(pool: web::Data<PgPool>, proposal_id: web::Path<Uuid>) -> impl Responder {
    let mut transaction = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let prop_id = proposal_id.into_inner(); // Call into_inner() once

    // Fetch the proposal to get quorum and state
    let proposal = match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals WHERE id = $1")
        .bind(prop_id)
        .fetch_optional(&mut *transaction)
        .await
    {
        Ok(Some(p)) => p,
        Ok(None) => {
            let _ = transaction.rollback().await;
            return HttpResponse::NotFound().body("Proposal not found");
        }
        Err(e) => {
            let _ = transaction.rollback().await;
            return HttpResponse::InternalServerError().body(e.to_string());
        }
    };

    // Check if proposal is already tallied or not in a state to be tallied
    if proposal.state == "closed" || proposal.state == "tallied" {
        let _ = transaction.rollback().await;
        return HttpResponse::BadRequest().body("Proposal is already closed or tallied.");
    }

    // Fetch all verified submissions for the proposal
    let submissions = match sqlx::query_as::<_, Submission>(
        "SELECT * FROM submissions WHERE proposal_id = $1 AND verified_bool = TRUE"
    )
    .bind(prop_id)
    .fetch_all(&mut *transaction)
    .await
    {
        Ok(s) => s,
        Err(e) => {
            let _ = transaction.rollback().await;
            return HttpResponse::InternalServerError().body(e.to_string());
        }
    };

    // Enforce quorum
    // For simplicity, let's assume total eligible votes is a fixed number or fetched from somewhere
    // Here, we'll just use the number of verified submissions as the total votes for quorum calculation
    let total_eligible_votes = 100.0; // Placeholder: Replace with actual total eligible votes
    let actual_votes = submissions.len() as f64;
    let quorum_reached = (actual_votes / total_eligible_votes) * 100.0 >= proposal.quorum;

    if !quorum_reached {
        let _ = transaction.rollback().await;
        return HttpResponse::BadRequest().body("Quorum not reached.");
    }

    // Simple tallying logic (e.g., count occurrences of choices from note_commitment or proof_hash)
    let mut results: HashMap<String, u32> = HashMap::new();
    for submission in &submissions {
        // This is a placeholder; actual tallying would depend on the voting model (single-choice, ranked-choice)
        // For now, let's assume note_commitment can be mapped to a choice or just count them.
        *results.entry(submission.note_commitment.clone()).or_insert(0) += 1;
    }

    let new_tally = Tally {
        id: Uuid::new_v4(),
        proposal_id: prop_id,
        aggregate_proof_hash: "dummy_aggregate_proof_hash".to_string(), // Placeholder
        results_json: serde_json::to_value(results).unwrap_or_default(),
        verified_at: Utc::now().naive_utc(),
    };

    match sqlx::query_as::<_, Tally>(
        "INSERT INTO tallies (id, proposal_id, aggregate_proof_hash, results_json, verified_at) VALUES ($1, $2, $3, $4, $5) RETURNING *"
    )
    .bind(new_tally.id)
    .bind(new_tally.proposal_id)
    .bind(new_tally.aggregate_proof_hash)
    .bind(new_tally.results_json)
    .bind(new_tally.verified_at)
    .fetch_one(&mut *transaction)
    .await
    {
        Ok(tally) => {
            // Update proposal state to 'tallied'
            let _ = sqlx::query("UPDATE proposals SET state = $1 WHERE id = $2")
                .bind("tallied")
                .bind(prop_id)
                .execute(&mut *transaction)
                .await;

            let _ = transaction.commit().await;
            HttpResponse::Created().json(tally)
        }
        Err(e) => {
            let _ = transaction.rollback().await;
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}