use actix_web::web;

pub mod project_routes;
pub mod proposal_routes;

pub fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg.configure(project_routes::project_routes)
       .configure(proposal_routes::proposal_routes);
}