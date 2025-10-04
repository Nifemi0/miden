use actix_web::{web};

use crate::handlers::auth_handlers;

pub fn auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/login", web::post().to(auth_handlers::login)),
    );
}
