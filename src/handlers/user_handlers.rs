use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::User;
use crate::main::AuthExtractor;

#[derive(serde::Deserialize)]
pub struct UpdateUserRoleRequest {
    pub role: String,
}

#[derive(serde::Deserialize)]
pub struct RegisterUserRequest {
    pub wallet_address: String,
    pub role: Option<String>,
}

pub async fn get_all_users(pool: web::Data<PgPool>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" {
        return HttpResponse::Unauthorized().body("Only platform owners can view all users");
    }

    match sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn update_user_role(path: web::Path<String>, req: web::Json<UpdateUserRoleRequest>, pool: web::Data<PgPool>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" {
        return HttpResponse::Unauthorized().body("Only platform owners can update user roles");
    }

    let wallet_address = path.into_inner();
    let new_role = req.role.clone();

    // Basic role validation
    if !["user", "project_admin", "platform_owner"].contains(&new_role.as_str()) {
        return HttpResponse::BadRequest().body("Invalid role specified");
    }

    match sqlx::query_as::<_, User>("UPDATE users SET role = $1 WHERE wallet_address = $2 RETURNING *")
        .bind(&new_role)
        .bind(&wallet_address)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::NotFound().body("User not found"),
    }
}

pub async fn register_user(req: web::Json<RegisterUserRequest>, pool: web::Data<PgPool>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "platform_owner" {
        return HttpResponse::Unauthorized().body("Only platform owners can register users");
    }

    let new_user_role = req.role.clone().unwrap_or_else(|| "user".to_string());

    // Basic role validation
    if !["user", "project_admin", "platform_owner"].contains(&new_user_role.as_str()) {
        return HttpResponse::BadRequest().body("Invalid role specified");
    }

    let new_user = User {
        wallet_address: req.wallet_address.clone(),
        role: new_user_role,
        created_at: chrono::Utc::now().naive_utc(),
    };

    match sqlx::query_as::<_, User>("INSERT INTO users (wallet_address, role, created_at) VALUES ($1, $2, $3) RETURNING *")
        .bind(&new_user.wallet_address)
        .bind(&new_user.role)
        .bind(new_user.created_at)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(user) => HttpResponse::Created().json(user),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
