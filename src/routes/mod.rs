pub mod project_routes;
pub mod proposal_routes;
pub mod auth_routes;

pub fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("")
        .configure(project_routes::project_routes)
        .configure(proposal_routes::proposal_routes)
        .configure(auth_routes::auth_routes)
    );
}
