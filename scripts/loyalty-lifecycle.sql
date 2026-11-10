USE LPAPK;
GO

SET NOCOUNT ON;
GO

/* =====================================================
   1. Create loyalty_transactions table
===================================================== */

IF OBJECT_ID(N'LPAPK.loyalty_transactions', N'U') IS NULL
BEGIN
    CREATE TABLE LPAPK.loyalty_transactions
    (
        id UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_loyalty_transactions PRIMARY KEY
            DEFAULT NEWID(),

        user_id UNIQUEIDENTIFIER NOT NULL,

        order_id UNIQUEIDENTIFIER NULL,

        order_number NVARCHAR(50) NULL,

        type NVARCHAR(20) NOT NULL,

        status NVARCHAR(20) NOT NULL
            DEFAULT 'pending',

        points INT NOT NULL,

        description NVARCHAR(500) NULL,

        expires_at DATETIME2 NULL,

        created_at DATETIME2 NOT NULL
            DEFAULT SYSUTCDATETIME(),

        credited_at DATETIME2 NULL
    );
END
GO

/* =====================================================
   2. Indexes
===================================================== */

IF NOT EXISTS (
    SELECT *
    FROM sys.indexes
    WHERE name='idx_loyalty_user'
)
CREATE INDEX idx_loyalty_user
ON LPAPK.loyalty_transactions(user_id);
GO

IF NOT EXISTS (
    SELECT *
    FROM sys.indexes
    WHERE name='idx_loyalty_order'
)
CREATE INDEX idx_loyalty_order
ON LPAPK.loyalty_transactions(order_id);
GO

IF NOT EXISTS (
    SELECT *
    FROM sys.indexes
    WHERE name='idx_loyalty_status'
)
CREATE INDEX idx_loyalty_status
ON LPAPK.loyalty_transactions(status);
GO

/* =====================================================
   3. Loyalty Dashboard View
===================================================== */

CREATE OR ALTER VIEW LPAPK.vw_loyalty_dashboard
AS
SELECT

    u.id AS user_id,

    u.name,

    u.email,

    ISNULL(SUM(
        CASE
            WHEN lt.status='credited'
            THEN lt.points
            ELSE 0
        END),0) available_points,

    ISNULL(SUM(
        CASE
            WHEN lt.status='pending'
            THEN lt.points
            ELSE 0
        END),0) pending_points,

    ISNULL(SUM(
        CASE
            WHEN lt.type='earned'
            THEN lt.points
            ELSE 0
        END),0) lifetime_earned,

    ISNULL(SUM(
        CASE
            WHEN lt.type='redeemed'
            THEN ABS(lt.points)
            ELSE 0
        END),0) lifetime_redeemed,

    ISNULL(SUM(
        CASE
            WHEN lt.status IN ('expired','reversed')
            THEN lt.points
            ELSE 0
        END),0) lifetime_expired

FROM LPAPK.users u

LEFT JOIN LPAPK.loyalty_transactions lt
ON lt.user_id=u.id

GROUP BY
u.id,
u.name,
u.email;
GO

/* =====================================================
   4. Create Pending Loyalty
===================================================== */

CREATE OR ALTER PROCEDURE LPAPK.sp_create_pending_loyalty_transaction

@user_id UNIQUEIDENTIFIER,
@order_id UNIQUEIDENTIFIER,
@order_number NVARCHAR(50),
@points INT,
@description NVARCHAR(500)=NULL

AS
BEGIN

SET NOCOUNT ON;

INSERT INTO LPAPK.loyalty_transactions
(
user_id,
order_id,
order_number,
type,
status,
points,
description,
expires_at
)
VALUES
(
@user_id,
@order_id,
@order_number,
'earned',
'pending',
@points,
COALESCE(@description,'Points earned for order '+@order_number),
DATEADD(DAY,90,SYSUTCDATETIME())
);

END
GO

/* =====================================================
   5. Credit Pending Points
===================================================== */

CREATE OR ALTER PROCEDURE LPAPK.sp_credit_pending_loyalty

@order_id UNIQUEIDENTIFIER=NULL

AS
BEGIN

SET NOCOUNT ON;

DECLARE @cutoff DATETIME2=DATEADD(DAY,-7,SYSUTCDATETIME());

UPDATE lt

SET
status='credited',
credited_at=SYSUTCDATETIME()

FROM LPAPK.loyalty_transactions lt

INNER JOIN LPAPK.orders o

ON o.id=lt.order_id

WHERE lt.status='pending'
AND lt.type='earned'
AND (@order_id IS NULL OR lt.order_id=@order_id)
AND o.status<>'cancelled'
AND o.created_at<=@cutoff;

END
GO

/* =====================================================
   6. Cancel Pending
===================================================== */

CREATE OR ALTER PROCEDURE LPAPK.sp_cancel_pending_loyalty

@order_id UNIQUEIDENTIFIER

AS
BEGIN

UPDATE LPAPK.loyalty_transactions

SET status='cancelled'

WHERE order_id=@order_id
AND status='pending';

END
GO

/* =====================================================
   7. Reverse Points
===================================================== */

CREATE OR ALTER PROCEDURE LPAPK.sp_reverse_loyalty_points

@user_id UNIQUEIDENTIFIER,
@order_id UNIQUEIDENTIFIER,
@order_number NVARCHAR(50),
@points INT,
@description NVARCHAR(500)=NULL

AS
BEGIN

INSERT INTO LPAPK.loyalty_transactions
(
user_id,
order_id,
order_number,
type,
status,
points,
description
)
VALUES
(
@user_id,
@order_id,
@order_number,
'reversed',
'reversed',
@points,
COALESCE(@description,'Refund for order '+@order_number)
);

END
GO