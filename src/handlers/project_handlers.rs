use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Project;

#[derive(serde::Deserialize)]
pub struct CreateProjectPayload {
    owner: String,
    token_address: String,
    merkle_root: String,
    config: serde_json::Value,
}

pub async fn create_project(payload: web::Json<CreateProjectPayload>, pool: web::Data<PgPool>, auth: AuthExtractor) -> impl Responder {
    if auth.role != "admin" {
        return HttpResponse::Unauthorized().body("Only admins can create projects");
    }

    let project = Project {
        id: Uuid::new_v4(),
        owner: payload.owner.clone(),
        token_address: payload.token_address.clone(),
        merkle_root: payload.merkle_root.clone(),
        config: payload.config.clone(),
        created_at: chrono::Utc::now().naive_utc(),
    };

    match sqlx::query_as::<_, Project>("INSERT INTO projects (id, owner, token_address, merkle_root, config, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *")
        .bind(project.id)
        .bind(&project.owner)
        .bind(&project.token_address)
        .bind(&project.merkle_root)
        .bind(&project.config)
        .bind(project.created_at)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(project) => HttpResponse::Ok().json(project),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_project(path: web::Path<Uuid>, pool: web::Data<PgPool>) -> impl Responder {
    let project_id = path.into_inner();
    match sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = $1")
        .bind(project_id)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(project) => HttpResponse::Ok().json(project),
        Err(_) => HttpResponse::NotFound().body("Project not found"),
    }
}

pub async fn get_all_projects(pool: web::Data<PgPool>) -> impl Responder {
    match sqlx::query_as::<_, Project>("SELECT * FROM projects")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(projects) => HttpResponse::Ok().json(projects),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
