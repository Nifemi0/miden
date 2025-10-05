use actix_web::web;

use crate::handlers::proposal_handlers;
use crate::handlers::submission_handlers;
use crate::handlers::tally_handlers;

pub fn proposal_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/proposals")
            .route("", web::get().to(proposal_handlers::get_all_proposals))
            .route("/{proposal_id}", web::get().to(proposal_handlers::get_proposal))
            .route("/{proposal_id}/submit", web::post().to(submission_handlers::submit_vote))
            .route("/{proposal_id}/submissions", web::get().to(submission_handlers::list_submissions))
            .route("/{proposal_id}/tally", web::post().to(tally_handlers::tally_proposal))
            .route("/{proposal_id}/revoke", web::post().to(proposal_handlers::revoke_proposal))
            .route("/{proposal_id}/finalize", web::post().to(proposal_handlers::finalize_tally)),
    );
}
