use actix_web::{web, HttpResponse, Responder};
use sqlx::{PgPool};
use uuid::Uuid;


use crate::models::Submission;

// DTOs for request bodies
#[derive(serde::Deserialize)]
pub struct SubmitVoteRequest {
    pub proof_hash: String,
    pub note_commitment: String,
    pub nullifier_hash: String,
}

// Handlers
pub async fn submit_vote(
    pool: web::Data<PgPool>,
    proposal_id: web::Path<Uuid>,
    req: web::Json<SubmitVoteRequest>,
) -> impl Responder {
    let mut transaction = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Check for unique nullifier_hash (prevent double voting)
    match sqlx::query_as::<_, Submission>("SELECT * FROM submissions WHERE nullifier_hash = $1")
        .bind(&req.nullifier_hash)
        .fetch_optional(&mut *transaction)
        .await
    {
        Ok(Some(_)) => {
            let _ = transaction.rollback().await;
            return HttpResponse::BadRequest().body("Nullifier hash already used (double voting detected)");
        }
        Err(e) => {
            let _ = transaction.rollback().await;
            return HttpResponse::InternalServerError().body(e.to_string());
        }
        _ => {}
    }

    let new_submission = Submission {
        id: Uuid::new_v4(),
        proposal_id: proposal_id.into_inner(),
        proof_hash: req.proof_hash.clone(),
        note_commitment: req.note_commitment.clone(),
        nullifier_hash: req.nullifier_hash.clone(),
        verified_bool: crate::verifier::verify_proof(&req.proof_hash), // Call verifier stub
        verified_at: None,
    };

    match sqlx::query_as::<_, Submission>(
        "INSERT INTO submissions (id, proposal_id, proof_hash, note_commitment, nullifier_hash, verified_bool, verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    )
    .bind(new_submission.id)
    .bind(new_submission.proposal_id)
    .bind(new_submission.proof_hash)
    .bind(new_submission.note_commitment)
    .bind(new_submission.nullifier_hash)
    .bind(new_submission.verified_bool)
    .bind(new_submission.verified_at)
    .fetch_one(&mut *transaction)
    .await
    {
        Ok(submission) => {
            let _ = transaction.commit().await;
            HttpResponse::Created().json(submission)
        }
        Err(e) => {
            let _ = transaction.rollback().await;
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

pub async fn list_submissions(pool: web::Data<PgPool>, proposal_id: web::Path<Uuid>) -> impl Responder {
    match sqlx::query_as::<_, Submission>("SELECT * FROM submissions WHERE proposal_id = $1")
        .bind(proposal_id.into_inner())
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(submissions) => HttpResponse::Ok().json(submissions),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}