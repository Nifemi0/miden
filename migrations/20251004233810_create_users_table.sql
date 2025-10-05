-- Add migration script here
CREATE TABLE users (
    wallet_address TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);