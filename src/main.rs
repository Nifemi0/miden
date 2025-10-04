use actix_web::{web, App, HttpServer, dev::{Service, ServiceRequest, ServiceResponse, Transform}, Error, FromRequest, HttpRequest, HttpMessage};
use actix_web::middleware::Logger;
use std::io;
use uuid::Uuid;
use actix_web::dev::Payload;
use actix_web::error::ErrorUnauthorized;
use actix_web::http::header::AUTHORIZATION;
use std::future::{ready, Ready};
use futures_util::future::LocalBoxFuture;
use std::rc::Rc;
use std::task::{Context, Poll};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm, Header};
use serde::{Deserialize, Serialize};

mod db;
mod models;
mod handlers;
mod routes;
mod verifier;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub user_id: Uuid,
    pub role: String,
    pub exp: usize,
}

// AuthExtractor: The extractor for authenticated user information
#[derive(Clone, Debug)]
pub struct AuthExtractor {
    pub user_id: Uuid,
    pub role: String,
}

impl FromRequest for AuthExtractor {
    type Error = Error;
    type Future = Ready<Result<Self, Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        if let Some(auth) = req.extensions().get::<AuthExtractor>() {
            ready(Ok(auth.clone()))
        } else {
            ready(Err(ErrorUnauthorized("Unauthorized")))
        }
    }
}

pub struct Auth;

impl<S, B> Transform<S, ServiceRequest> for Auth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddleware { service: Rc::new(service) }))
    }
}

pub struct AuthMiddleware<S> {
    service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let svc = self.service.clone();

        Box::pin(async move {
            let auth_header = req.headers().get(AUTHORIZATION).and_then(|h| h.to_str().ok());

            if let Some(auth_header) = auth_header {
                if auth_header.starts_with("Bearer ") {
                    let token = auth_header.trim_start_matches("Bearer ");
                    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

                    match decode::<Claims>(
                        token,
                        &DecodingKey::from_secret(secret.as_ref()),
                        &Validation::new(Algorithm::Hs256),
                    ) {
                        Ok(token_data) => {
                            let user_id = token_data.claims.user_id;
                            let role = token_data.claims.role;
                            let auth_info = AuthExtractor { user_id, role };
                            req.extensions_mut().insert(auth_info);
                        }
                        Err(_) => return Err(ErrorUnauthorized("Invalid token")),
                    }
                }
            }

            svc.call(req).await
        })
    }
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let pool = db::init_db()
        .await
        .expect("Failed to create pool.");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(Auth) // Apply the Auth middleware globally
            .app_data(web::Data::new(pool.clone()))
            .configure(routes::config_routes)
            .configure(routes::auth_routes)
    })
    .workers(1)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
