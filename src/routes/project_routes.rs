use actix_web::web;

use crate::handlers::project_handlers;
use crate::handlers::proposal_handlers;

pub fn project_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/projects")
            .route("", web::post().to(project_handlers::create_project))
            .route("", web::get().to(project_handlers::get_all_projects))
            .route("/{project_id}", web::get().to(project_handlers::get_project))
            .route("/{project_id}/proposals", web::post().to(proposal_handlers::create_proposal)),
    );
}
