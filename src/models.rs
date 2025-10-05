use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub wallet_address: String,
    pub role: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: Uuid,
    pub owner: String,
    pub token_address: String,
    pub merkle_root: String,
    pub config: serde_json::Value,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Proposal {
    pub id: Uuid,
    pub project_id: Uuid,
    pub title: String,
    pub choices_json: serde_json::Value,
    pub model_enum: String,
    pub quorum: f64,
    pub start_ts: NaiveDateTime,
    pub end_ts: NaiveDateTime,
    pub state: String,
    pub revoked: bool,
    pub finalized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Submission {
    pub id: Uuid,
    pub proposal_id: Uuid,
    pub proof_hash: String,
    pub note_commitment: String,
    pub nullifier_hash: String,
    pub verified_bool: bool,
    pub verified_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tally {
    pub id: Uuid,
    pub proposal_id: Uuid,
    pub aggregate_proof_hash: String,
    pub results_json: serde_json::Value,
    pub verified_at: NaiveDateTime,
}
