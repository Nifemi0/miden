use actix_web::web;

use crate::handlers::user_handlers;

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("", web::get().to(user_handlers::get_all_users))
            .route("", web::post().to(user_handlers::register_user))
            .route("/{wallet_address}/role", web::put().to(user_handlers::update_user_role)),
    );
}
