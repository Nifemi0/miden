use actix_web::{web, HttpResponse, Responder};
use jsonwebtoken::{encode, Header, EncodingKey, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Utc, Duration};
use sqlx::PgPool;

use crate::main::Claims;
use crate::models::User;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub wallet_address: String,
    pub signed_message: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
}

pub async fn login(req: web::Json<LoginRequest>, pool: web::Data<PgPool>) -> impl Responder {
    let wallet_address = req.wallet_address.clone();
    let _signed_message = req.signed_message.clone(); // Placeholder for actual signature verification

    // TODO: Implement actual Miden signature verification here
    // For now, we'll assume the signature is valid if present.
    // if !verify_miden_signature(&wallet_address, &signed_message) {
    //     return HttpResponse::Unauthorized().body("Invalid signature");
    // }

    // Look up user by wallet_address, or create if not exists
    let user = match sqlx::query_as::<_, User>("SELECT * FROM users WHERE wallet_address = $1")
        .bind(&wallet_address)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(u)) => u,
        Ok(None) => {
            // Create new user with default role if not found
            let new_user = User {
                wallet_address: wallet_address.clone(),
                role: "user".to_string(),
                created_at: Utc::now().naive_utc(),
            };
            match sqlx::query_as::<_, User>("INSERT INTO users (wallet_address, role, created_at) VALUES ($1, $2, $3) RETURNING *")
                .bind(&new_user.wallet_address)
                .bind(&new_user.role)
                .bind(new_user.created_at)
                .fetch_one(pool.get_ref())
                .await
            {
                Ok(u) => u,
                Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
            }
        }
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let expiration = Utc::now() + Duration::hours(24);
    let claims = Claims {
        user_id: Uuid::parse_str(&user.wallet_address).unwrap_or_else(|_| Uuid::new_v4()), // Convert wallet_address to Uuid
        role: user.role,
        exp: expiration.timestamp() as usize,
    };

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let token = match encode(&Header::new(Algorithm::Hs256), &claims, &EncodingKey::from_secret(secret.as_ref())) {
        Ok(t) => t,
        Err(_) => return HttpResponse::InternalServerError().body("Could not create JWT"),
    };

    HttpResponse::Ok().json(AuthResponse { token })
}
