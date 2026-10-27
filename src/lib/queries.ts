export const CREATE_SCHEMA_MIGRATIONS = `CREATE TABLE IF NOT EXISTS schema_migrations (
                                        name       text PRIMARY KEY,
                                        applied_at timestamptz NOT NULL DEFAULT now())`;

export const SELECT_NAME_MIGRATION_SCHEMA = 'SELECT name FROM schema_migrations';

export const INSERT_NAME_MIGRATION_SCHEMA = 'INSERT INTO schema_migrations (name) VALUES ($1)';

export const FIND_USER_BY_ID = 'SELECT * FROM users WHERE id = $1';

export const FIND_USER_BY_EMAIL = 'SELECT * FROM users WHERE lower(email) = lower($1)';

export const CREATE_USER = `INSERT INTO users (id, full_name, email, password_hash, role)
                            VALUES ($1, $2, $3, $4, 'user')
                            RETURNING id, full_name, email, password_hash, role`;

export const FIND_QUOTE_BY_ID = 'SELECT * FROM quotes WHERE id = $1';

export const CREATE_QUOTE = `INSERT INTO quotes (
                            id, user_id, full_name, email, address, monthly_consumption_kw, system_size_kw,
                            down_payment, currency, system_price, principal_amount, risk_band, base_apr, offers_json)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;

export const LIST_QUOTES_FOR_USER = `SELECT * FROM quotes q WHERE q.user_id = $1 ORDER BY q.created_at DESC, q.id DESC`;

export const QUOTE_SELECT = `
    SELECT q.*, u.full_name, u.email 
    FROM quotes q 
    LEFT JOIN users u ON q.user_id = u.id
`;
