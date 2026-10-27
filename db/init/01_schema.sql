CREATE TABLE users (
  id            uuid PRIMARY KEY,
  full_name     text NOT NULL,
  email         text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

CREATE TABLE quotes (
  id                       uuid PRIMARY KEY,
  user_id                  uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  full_name                text NOT NULL,
  email                    text NOT NULL,
  address                  text NOT NULL,
  monthly_consumption_kw   double precision NOT NULL CHECK (monthly_consumption_kw > 0),
  system_size_kw           double precision NOT NULL CHECK (system_size_kw > 0),
  down_payment             numeric(12, 2) NOT NULL DEFAULT 0 CHECK (down_payment >= 0),
  currency                 char(3) NOT NULL,
  system_price             numeric(12, 2) NOT NULL,
  principal_amount         numeric(12, 2) NOT NULL,
  risk_band                char(1) NOT NULL CHECK (risk_band IN ('A', 'B', 'C')),
  base_apr                 numeric(5, 2) NOT NULL,
  offers_json              jsonb NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quotes_user_created_idx ON quotes (user_id, created_at DESC);
CREATE INDEX quotes_created_idx ON quotes (created_at DESC);
