use actix_web::{web, HttpResponse, Responder};
use jsonwebtoken::{encode, Header, EncodingKey, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Utc, Duration};

use crate::main::Claims;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub user_id: Uuid,
    pub role: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
}

pub async fn login(req: web::Json<LoginRequest>) -> impl Responder {
    let user_id = req.user_id;
    let role = req.role.clone();

    let expiration = Utc::now() + Duration::hours(24);
    let claims = Claims {
        user_id,
        role,
        exp: expiration.timestamp() as usize,
    };

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let token = match encode(&Header::new(Algorithm::Hs256), &claims, &EncodingKey::from_secret(secret.as_ref())) {
        Ok(t) => t,
        Err(_) => return HttpResponse::InternalServerError().body("Could not create JWT"),
    };

    HttpResponse::Ok().json(AuthResponse { token })
}
