use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;


use crate::models::Proposal;

// DTOs for request bodies
#[derive(serde::Deserialize)]
pub struct CreateProposalRequest {
    pub title: String,
    pub choices_json: serde_json::Value,
    pub model_enum: String,
    pub quorum: f64,
    pub start_ts: chrono::NaiveDateTime,
    pub end_ts: chrono::NaiveDateTime,
    pub state: String,
}

// Handlers
pub async fn create_proposal(
    pool: web::Data<PgPool>,
    project_id: web::Path<Uuid>,
    req: web::Json<CreateProposalRequest>,
) -> impl Responder {
    let new_proposal = Proposal {
        id: Uuid::new_v4(),
        project_id: project_id.into_inner(),
        title: req.title.clone(),
        choices_json: req.choices_json.clone(),
        model_enum: req.model_enum.clone(),
        quorum: req.quorum,
        start_ts: req.start_ts,
        end_ts: req.end_ts,
        state: req.state.clone(),
        revoked: false,
        finalized: false,
    };

    match sqlx::query_as::<_, Proposal>(
        "INSERT INTO proposals (id, project_id, title, choices_json, model_enum, quorum, start_ts, end_ts, state, revoked, finalized) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *"
    )
    .bind(new_proposal.id)
    .bind(new_proposal.project_id)
    .bind(new_proposal.title)
    .bind(new_proposal.choices_json)
    .bind(new_proposal.model_enum)
    .bind(new_proposal.quorum)
    .bind(new_proposal.start_ts)
    .bind(new_proposal.end_ts)
    .bind(new_proposal.state)
    .bind(new_proposal.revoked)
    .bind(new_proposal.finalized)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(proposal) => HttpResponse::Created().json(proposal),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_proposal(pool: web::Data<PgPool>, proposal_id: web::Path<Uuid>) -> impl Responder {
    match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals WHERE id = $1")
        .bind(proposal_id.into_inner())
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(proposal)) => HttpResponse::Ok().json(proposal),
        Ok(None) => HttpResponse::NotFound().body("Proposal not found"),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn revoke_proposal(pool: web::Data<PgPool>, proposal_id: web::Path<Uuid>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" {
        return HttpResponse::Unauthorized().body("Only platform owners can revoke proposals");
    }

    match sqlx::query_as::<_, Proposal>("UPDATE proposals SET revoked = TRUE WHERE id = $1 RETURNING *")
        .bind(proposal_id.into_inner())
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(proposal) => HttpResponse::Ok().json(proposal),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn finalize_tally(pool: web::Data<PgPool>, proposal_id: web::Path<Uuid>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" {
        return HttpResponse::Unauthorized().body("Only platform owners can finalize tallies");
    }

    match sqlx::query_as::<_, Proposal>("UPDATE proposals SET finalized = TRUE WHERE id = $1 RETURNING *")
        .bind(proposal_id.into_inner())
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(proposal) => HttpResponse::Ok().json(proposal),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_all_proposals(pool: web::Data<PgPool>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" && auth.role != "project_admin" {
        return HttpResponse::Unauthorized().body("Only platform owners and project admins can view all proposals");
    }

    match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(proposals) => HttpResponse::Ok().json(proposals),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

