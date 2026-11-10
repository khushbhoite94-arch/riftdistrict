-- Rift District — SQL Server schema (raw T-SQL). UNIQUEIDENTIFIER PKs.
-- Run directly in SSMS, or: sqlcmd -S <server> -d RiftDistrict -i schema.sql
-- Create the RiftDistrict database first.

-- USERS ---------------------------------------------------------------
CREATE TABLE users (
  id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name       NVARCHAR(255)    NOT NULL,
  email      NVARCHAR(255)    NOT NULL UNIQUE,
  password   NVARCHAR(255)    NOT NULL,
  phone      NVARCHAR(50)     NULL,
  [address]  NVARCHAR(MAX)    NULL,            -- legacy single-address field
  role       NVARCHAR(50)     NOT NULL DEFAULT 'user',
  is_verified      BIT          NOT NULL DEFAULT 0,  -- email verification gate
  otp_hash         NVARCHAR(255) NULL,              -- hashed signup OTP
  otp_expiry       DATETIME2     NULL,
  reset_otp_hash   NVARCHAR(255) NULL,              -- hashed password-reset OTP
  reset_otp_expiry DATETIME2     NULL,
  created_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE TRIGGER trg_users_updated ON users AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE u SET updated_at = SYSUTCDATETIME()
  FROM users u JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TABLE user_addresses (
  id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      NVARCHAR(100) NULL,
  street     NVARCHAR(255) NULL, city NVARCHAR(100) NULL, [state] NVARCHAR(100) NULL,
  zip        NVARCHAR(20)  NULL, country NVARCHAR(100) NULL, phone NVARCHAR(50) NULL,
  is_default BIT NOT NULL DEFAULT 0
);
GO
CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
GO

CREATE TABLE wishlist_items (
  user_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id NVARCHAR(255)    NOT NULL,        -- string id: GUID DB product or demo product
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT pk_wishlist PRIMARY KEY (user_id, product_id)
);
GO

-- CATEGORIES ----------------------------------------------------------
CREATE TABLE categories (
  id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name        NVARCHAR(255) NOT NULL UNIQUE,
  slug        NVARCHAR(255) NOT NULL UNIQUE,
  description NVARCHAR(MAX) NULL,
  created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE TRIGGER trg_categories_updated ON categories AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE c SET updated_at = SYSUTCDATETIME()
  FROM categories c JOIN inserted i ON c.id = i.id;
END;
GO

-- PRODUCTS ------------------------------------------------------------
CREATE TABLE products (
  id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name             NVARCHAR(255) NOT NULL,
  slug             NVARCHAR(255) NOT NULL UNIQUE,
  description      NVARCHAR(MAX) NOT NULL,
  price            DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NULL,
  category         NVARCHAR(255) NOT NULL,
  [collection]     NVARCHAR(255) NULL,
  images           NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(images) = 1),
  sizes            NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(sizes)  = 1),
  colors           NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(colors) = 1),
  tags             NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(tags)   = 1),
  stock            INT NOT NULL DEFAULT 0,
  featured         BIT NOT NULL DEFAULT 0,
  best_seller      BIT NOT NULL DEFAULT 0,
  limited_drop     BIT NOT NULL DEFAULT 0,
  sales_rank       INT NULL,
  rating           DECIMAL(2,1) NOT NULL DEFAULT 0,   -- written by reviews flow
  review_count     INT NOT NULL DEFAULT 0,            -- written by reviews flow
  created_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX idx_products_category ON products(category);
GO
CREATE TRIGGER trg_products_updated ON products AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE p SET updated_at = SYSUTCDATETIME()
  FROM products p JOIN inserted i ON p.id = i.id;
END;
GO

-- COUPONS -------------------------------------------------------------
CREATE TABLE coupons (
  id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  code           NVARCHAR(100) NOT NULL UNIQUE,
  discount_type  NVARCHAR(20)  NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
  min_order      DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses       INT NOT NULL DEFAULT 100,
  used_count     INT NOT NULL DEFAULT 0,
  active         BIT NOT NULL DEFAULT 1,
  expires_at     DATETIME2 NULL,
  created_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE TRIGGER trg_coupons_updated ON coupons AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE c SET updated_at = SYSUTCDATETIME()
  FROM coupons c JOIN inserted i ON c.id = i.id;
END;
GO

-- BANNERS -------------------------------------------------------------
CREATE TABLE banners (
  id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  image      NVARCHAR(MAX) NOT NULL,
  active     BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE TRIGGER trg_banners_updated ON banners AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE b SET updated_at = SYSUTCDATETIME()
  FROM banners b JOIN inserted i ON b.id = i.id;
END;
GO

-- NEWSLETTER ----------------------------------------------------------
CREATE TABLE newsletter_subscriptions (
  id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  email         NVARCHAR(255) NOT NULL UNIQUE,
  subscribed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ORDERS --------------------------------------------------------------
CREATE TABLE orders (
  id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_number     NVARCHAR(50) NOT NULL UNIQUE,
  user_id          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  subtotal         DECIMAL(10,2) NOT NULL,
  discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping         DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  status           NVARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','processing','shipped','in-orbit','delivered','cancelled')),
  payment_method   NVARCHAR(50) NOT NULL,
  coupon_code      NVARCHAR(100) NULL,
  tracking_number  NVARCHAR(100) NULL,            -- set when shipped; used in shipped email
  shipping_street  NVARCHAR(255) NOT NULL,
  shipping_city    NVARCHAR(100) NOT NULL,
  shipping_state   NVARCHAR(100) NOT NULL,
  shipping_zip     NVARCHAR(20)  NOT NULL,
  shipping_country NVARCHAR(100) NOT NULL,
  shipping_phone   NVARCHAR(50)  NULL,
  gift_wrap        BIT          NOT NULL DEFAULT 0,
  gift_message     NVARCHAR(500) NULL,
  created_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at);
GO
CREATE TRIGGER trg_orders_updated ON orders AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE o SET updated_at = SYSUTCDATETIME()
  FROM orders o JOIN inserted i ON o.id = i.id;
END;
GO

CREATE TABLE order_items (
  id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_id   UNIQUEIDENTIFIER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UNIQUEIDENTIFIER NULL,            -- denormalized; product may be gone
  name       NVARCHAR(255) NOT NULL,
  image      NVARCHAR(MAX) NULL,
  price      DECIMAL(10,2) NOT NULL,
  size       NVARCHAR(50)  NULL,
  color      NVARCHAR(50)  NULL,
  quantity   INT NOT NULL CHECK (quantity >= 1)
);
GO
CREATE INDEX idx_order_items_order ON order_items(order_id);
GO

-- REVIEWS -------------------------------------------------------------
-- user_id intentionally has NO cascade: multiple cascade paths to users
-- (orders->users and reviews->users) trip SQL Server's "may cause cycles" error.
CREATE TABLE reviews (
  id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  product_id UNIQUEIDENTIFIER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  user_name  NVARCHAR(255) NOT NULL,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    NVARCHAR(1000) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX idx_reviews_product ON reviews(product_id);
GO
CREATE TRIGGER trg_reviews_updated ON reviews AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE r SET updated_at = SYSUTCDATETIME()
  FROM reviews r JOIN inserted i ON r.id = i.id;
END;
GO

-- REFRESH SESSIONS ----------------------------------------------------
CREATE TABLE refresh_sessions (
  id                         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id                    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id_hash              NVARCHAR(255) NOT NULL UNIQUE,
  rotated_from_token_id_hash NVARCHAR(255) NULL,
  created_at                 DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  expires_at                 DATETIME2 NOT NULL,
  revoked_at                 DATETIME2 NULL
);
GO
CREATE INDEX idx_refresh_user    ON refresh_sessions(user_id);
CREATE INDEX idx_refresh_expires ON refresh_sessions(expires_at);
GO

-- REPLACEMENT REQUESTS ------------------------------------------------
-- Sequential case IDs: RD-CASE-000001, RD-CASE-000002, ...
CREATE SEQUENCE seq_replacement_case AS INT START WITH 1 INCREMENT BY 1;
GO
CREATE TABLE replacement_requests (
  id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  request_id   NVARCHAR(50) NOT NULL UNIQUE,
  order_id     UNIQUEIDENTIFIER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id      UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  type         NVARCHAR(20) NOT NULL CHECK (type IN ('damaged','replacement')),
  status       NVARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected','pickup_scheduled','picked_up','out_for_delivery','delivered')),
  images       NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(images) = 1),
  description  NVARCHAR(1000) NULL,
  requested_size NVARCHAR(50) NULL,
  current_size NVARCHAR(50) NULL,
  admin_notes  NVARCHAR(MAX) NULL,
  delivery_date DATETIME2 NULL,
  created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    GO
CREATE INDEX idx_replacements_user    ON replacement_requests(user_id);
CREATE INDEX idx_replacements_order   ON replacement_requests(order_id);
CREATE INDEX idx_replacements_created ON replacement_requests(created_at);
GO
CREATE TRIGGER trg_replacements_updated ON replacement_requests AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE r SET updated_at = SYSUTCDATETIME()
  FROM replacement_requests r JOIN inserted i ON r.id = i.id;
END;
GO

-- LOYALTY TRANSACTIONS ------------------------------------------------
CREATE TABLE loyalty_transactions (
  id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id        UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  order_id       UNIQUEIDENTIFIER NULL REFERENCES orders(id),
  order_number   NVARCHAR(50) NULL,
  type           NVARCHAR(20) NOT NULL CHECK (type IN ('earned','redeemed','reversed','expired','adjusted')),
  status         NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','credited','redeemed','reversed','expired','cancelled')),
  points         INT NOT NULL,
  description    NVARCHAR(500) NULL,
  expires_at     DATETIME2 NULL,
  created_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  credited_at    DATETIME2 NULL
);
GO
CREATE INDEX idx_loyalty_user     ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_order    ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_status   ON loyalty_transactions(status);
CREATE INDEX idx_loyalty_expires  ON loyalty_transactions(expires_at);
GO
CREATE TRIGGER trg_loyalty_updated ON loyalty_transactions AFTER UPDATE AS
BEGIN SET NOCOUNT ON;
  UPDATE lt SET credited_at = SYSUTCDATETIME()
  FROM loyalty_transactions lt JOIN inserted i ON lt.id = i.id
  WHERE i.status = 'credited' AND lt.credited_at IS NULL;
END;
GO
