-- ============================================================
-- V1__init_schema.sql
-- DineFlow initial schema — derived from prisma/schema.prisma
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'STAFF', 'KITCHEN', 'CUSTOMER');
CREATE TYPE table_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED');
CREATE TYPE table_shape AS ENUM ('square', 'circle', 'rectangle');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE order_type AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
CREATE TYPE order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'ONLINE');
CREATE TYPE mock_payment_status AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
CREATE TYPE ai_job_type AS ENUM ('FEEDBACK_ANALYZER', 'MENU_ITEM_GENERATOR');
CREATE TYPE ai_job_status AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    role            user_role    NOT NULL DEFAULT 'CUSTOMER',
    status          VARCHAR(50)  NOT NULL DEFAULT 'active',
    banned          BOOLEAN      NOT NULL DEFAULT FALSE,
    ban_reason      VARCHAR(500),
    image           TEXT,
    age             INT,
    gender          VARCHAR(50),
    phone           VARCHAR(50),
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    token       TEXT         NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP    NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Token Blacklist (for invalidating access tokens on ban/logout)
CREATE TABLE token_blacklist (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    token_jti   VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(255) NOT NULL UNIQUE,
    slug    VARCHAR(255) NOT NULL UNIQUE
);

-- Menu Items
CREATE TABLE menu_items (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255)  NOT NULL,
    description   TEXT,
    price         DECIMAL(10,2) NOT NULL,
    discount      DECIMAL(5,2)  NOT NULL DEFAULT 0,
    image         TEXT,
    is_available  BOOLEAN       NOT NULL DEFAULT TRUE,
    recipe        TEXT,
    ai_suggestion TEXT,
    category_id   UUID          NOT NULL REFERENCES categories(id)
);

-- Feedbacks
CREATE TABLE feedbacks (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    rating        INT       NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment       TEXT,
    menu_item_id  UUID      NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    user_id       UUID      REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tables (dining floor)
CREATE TABLE restaurant_tables (
    id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name     VARCHAR(100) NOT NULL UNIQUE,
    seats    INT          NOT NULL,
    section  VARCHAR(255) NOT NULL DEFAULT 'Main Dining Room',
    shape    table_shape  NOT NULL DEFAULT 'square',
    status   table_status NOT NULL DEFAULT 'AVAILABLE'
);

-- Reservations
CREATE TABLE reservations (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name   VARCHAR(255),
    user_id         UUID           REFERENCES users(id) ON DELETE SET NULL,
    table_id        UUID           NOT NULL REFERENCES restaurant_tables(id),
    reservation_date TIMESTAMP     NOT NULL,
    guests          INT            NOT NULL,
    status          booking_status NOT NULL DEFAULT 'PENDING'
);

-- Orders
CREATE TABLE orders (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    order_type      order_type     NOT NULL,
    status          order_status   NOT NULL DEFAULT 'PENDING',
    payment_status  payment_status NOT NULL DEFAULT 'PENDING',
    payment_method  payment_method NOT NULL DEFAULT 'ONLINE',
    total_amount    DECIMAL(10,2)  NOT NULL,
    user_id         UUID           REFERENCES users(id) ON DELETE SET NULL,
    table_id        UUID           REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID          NOT NULL REFERENCES menu_items(id),
    quantity     INT           NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    notes        TEXT
);

-- Activities Log
CREATE TABLE activities_log (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      REFERENCES users(id) ON DELETE SET NULL,
    action     VARCHAR(255) NOT NULL,
    details    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Jobs
CREATE TABLE ai_jobs (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    type            ai_job_type   NOT NULL,
    status          ai_job_status NOT NULL DEFAULT 'PENDING',
    user_id         UUID          REFERENCES users(id) ON DELETE SET NULL,
    input_payload   JSONB,
    result_payload  JSONB,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP
);

-- Mock Payments
CREATE TABLE mock_payments (
    id                    UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID                 REFERENCES orders(id) ON DELETE SET NULL,
    amount                DECIMAL(10,2)        NOT NULL,
    currency              VARCHAR(10)          NOT NULL DEFAULT 'USD',
    status                mock_payment_status  NOT NULL DEFAULT 'PENDING',
    simulated_card_last4  VARCHAR(4)           NOT NULL DEFAULT '4242',
    created_at            TIMESTAMP            NOT NULL DEFAULT NOW(),
    confirmed_at          TIMESTAMP,
    failure_reason        VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_feedbacks_menu_item_id ON feedbacks(menu_item_id);
CREATE INDEX idx_reservations_table_id ON reservations(table_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_activities_log_user_id ON activities_log(user_id);
CREATE INDEX idx_activities_log_created_at ON activities_log(created_at);
CREATE INDEX idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_expires ON token_blacklist(expires_at);
