# RIFT DISTRICT — Codebase Brain

> Luxury streetwear e-commerce app (Next.js 16 + SQL Server + Tailwind CSS v4).
> This file is the canonical quick-reference for AI agents. Read this instead of crawling the whole repo.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.6 (App Router) |
| Runtime | React 19.2.4 |
| Language | TypeScript 5 (strict, ESNext, bundler module resolution) |
| Database | Microsoft SQL Server via `mssql` npm |
| Caching | Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`) |
| Auth | JWT access + refresh tokens (`jsonwebtoken`) + `bcryptjs` |
| State | Zustand (persisted in localStorage) |
| Forms | React Hook Form + Zod resolvers |
| UI CSS | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Animation | GSAP (`gsap`, `@gsap/react`), Framer Motion, Lenis smooth scroll |
| Email | Nodemailer |
| Media | Cloudinary (via `next-cloudinary`) |
| ID path alias | `@/*` → `src/*` |

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — Navbar, ClientProviders, AIChatbot
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Tailwind + custom fonts + global styles
│   ├── about/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── checkout/success/page.tsx
│   ├── collection/[slug]/page.tsx
│   ├── contact/page.tsx
│   ├── forgot-password/page.tsx
│   ├── login/page.tsx
│   ├── lookbook/page.tsx
│   ├── loyalty/page.tsx
│   ├── orders/page.tsx
│   ├── orders/track/page.tsx
│   ├── product/[slug]/page.tsx
│   ├── profile/page.tsx
│   ├── replacement-tracking/[requestId]/page.tsx
│   ├── shop/page.tsx
│   ├── signup/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── support/
│   │   ├── [orderId]/page.tsx
│   │   ├── damaged/[orderId]/page.tsx
│   │   ├── replacement/[orderId]/page.tsx
│   │   └── success/page.tsx
│   ├── terms/page.tsx
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell — AdminSidebar
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── banners/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   └── replacements/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── forgot-password/route.ts
│       │   ├── login/route.ts
│       │   ├── me/route.ts        # GET profile, PUT update, DELETE logout
│       │   ├── register/route.ts
│       │   ├── resend-otp/route.ts
│       │   ├── reset-password/route.ts
│       │   ├── verify-otp/route.ts
│       ├── banners/route.ts
│       ├── chatbot/route.ts
│       ├── coupons/validate/route.ts
│       ├── newsletter/route.ts
│       ├── orders/
│       │   ├── [id]/route.ts
│       │   ├── route.ts
│       │   └── track/route.ts
│       ├── products/[slug]/route.ts
│       ├── products/route.ts
│       ├── replacements/route.ts
│       ├── reviews/route.ts
│       ├── wishlist/route.ts
│       └── admin/
│           ├── analytics/route.ts
│           ├── banners/route.ts
│           ├── coupons/route.ts
│           ├── customers/route.ts
│           ├── orders/route.ts
│           ├── products/route.ts
│           ├── upload/route.ts
│           └── replacements/
│               ├── [id]/route.ts
│               └── route.ts
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   └── product-form.tsx
│   ├── auth/AuthForm.tsx
│   ├── cart/CartDrawer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   └── NewsletterSection.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── personalization/
│   │   ├── CartStylistSuggestions.tsx
│   │   ├── CompleteTheLook.tsx
│   │   ├── PersonalStylist.tsx
│   │   ├── RecentlyViewed.tsx
│   │   └── StyleQuiz.tsx
│   ├── product/
│   │   ├── ProductDetails.tsx
│   │   ├── ProductGallery.tsx
│   │   └── SizeGuide.tsx
│   ├── providers/
│   │   └── ClientProviders.tsx    # QueryClient + Zustand cart/personalization/auth hydration
│   ├── shop/ProductCard.tsx
│   ├── social-proof/
│   │   ├── CustomerPhotos.tsx
│   │   ├── LivePurchaseNotifications.tsx
│   │   ├── StockCountdown.tsx
│   │   └── TrendingBadge.tsx
│   └── ui/
│       ├── AIChatbot.tsx
│       ├── AnimatedButton.tsx
│       ├── CursorFollower.tsx
│       ├── CustomCursor.tsx
│       └── LoadingScreen.tsx
├── hooks/
│   ├── useAnimations.ts
│   ├── useMagnetic.ts
│   └── useSmoothScroll.ts
├── lib/
│   ├── api-helpers.ts             # jsonResponse, errorResponse, requireAuth, requireAdmin
│   ├── auth.ts                    # JWT sign/verify, cookie names/options
│   ├── cloudinary.ts
│   ├── constants.ts               # PALETTE, BRAND, CATEGORIES, SIZES, SORT_OPTIONS, images
│   ├── db/
│   │   ├── sessions.ts            # Refresh session create/revoke
│   │   ├── users.ts               # User & address CRUD, OTP helpers
│   │   ├── products.ts            # Product CRUD, listing, reviews
│   │   ├── orders.ts              # Order CRUD, stock decrement, coupon increment
│   │   ├── coupons.ts             # Coupon CRUD, validation query
│   │   ├── reviews.ts             # Reviews + recompute product rating
│   │   ├── banners.ts             # Banner CRUD
│   │   ├── wishlist.ts
│   │   ├── newsletter.ts
│   │   ├── replacements.ts        # Replacement requests full lifecycle
│   │   └── analytics.ts
│   ├── demo-products.ts           # Empty fallback catalog (local-dev)
│   ├── email/                     # Nodemailer setup + templates (auth, orders, replacements)
│   ├── otp.ts                     # 4-digit OTP generate/hash/verify/expiry
│   ├── product-utils.ts
│   ├── rate-limit.ts              # Upstash Redis rate limiter
│   ├── security.ts                # Same-origin assertion
│   ├── sql.ts                     # mssql ConnectionPool singleton, query(), withTransaction()
│   ├── stylist-ai.ts
│   └── utils.ts
├── store/
│   ├── authStore.ts               # Zustand — current user, login/logout/fetch
│   ├── cartStore.ts               # Zustand persist — cart items, drawer, coupon, totals
│   ├── loyaltyStore.ts
│   └── personalizationStore.ts
├── animations/
│   └── textReveal.tsx
└── types/
    ├── index.ts                   # IUser, IProduct, IOrder, ICoupon, IBanner, etc.
    └── replacement.ts             # ReplacementType, ReplacementStatus, IReplacementRequest
src/middleware.ts
```

---

## Database (SQL Server: `RiftDistrict`)

Connects via `mssql` package using env vars:
- `SQLSERVER_HOST` (required)
- `SQLSERVER_PORT` (default `1433`)
- `SQLSERVER_DB` (default `RiftDistrict`)
- `SQLSERVER_USER`, `SQLSERVER_PASSWORD`
- `SQLSERVER_ENCRYPT` / `SQLSERVER_TRUST_CERT`

Pool is a singleton (`getPool()` in `src/lib/sql.ts`) with `max: 10`.

### Schema Tables

| Table | Key Columns / Notes |
|-------|---------------------|
| `users` | `id` (unique GUID PK), `name`, `email` unique, `password`, `phone`, `address`, `role` (`user`/`admin`), `is_verified`, `otp_hash`, `otp_expiry`, `reset_otp_hash`, `reset_otp_expiry`, `created_at`, `updated_at`. Trigger auto-updates `updated_at`. |
| `user_addresses` | Multi-address per user. `user_id` FK→users cascade delete. `is_default` flag. |
| `wishlist_items` | Composite PK `(user_id, product_id)`. `product_id` is string (GUID or demo id). |
| `categories` | `id` GUID PK, `name` unique, `slug` unique, `description`. |
| `products` | `id` GUID PK, `name`, `slug` unique, `description`, `price`, `compare_at_price`, `category`, `collection`, `images`/`sizes`/`colors`/`tags` (JSON strings), `stock` int, `featured`/`best_seller`/`limited_drop` bits, `sales_rank`, `rating` (REVIEWS flow writes), `review_count`, timestamps. Trigger auto-updates `updated_at`. |
| `coupons` | `id` GUID PK, `code` unique UPPER, `discount_type` (`percentage`/`fixed`), `discount_value` >=0, `min_order`, `max_uses`, `used_count`, `active`, `expires_at`, timestamps. |
| `banners` | `id` GUID PK, `image`, `active`, timestamps. |
| `newsletter_subscriptions` | `id` GUID PK, `email` unique, `subscribed_at`. |
| `orders` | `id` GUID PK, `order_number` unique, `user_id` FK→users, `subtotal`/`discount`/`shipping`/`total`, `status` enum: `pending|processing|shipped|in-orbit|delivered|cancelled`, `payment_method`, `coupon_code`, `tracking_number`, shipping address fields, `created_at`, `updated_at`. Trigger auto-updates `updated_at`. |
| `order_items` | `id` GUID PK, `order_id` cascade delete, `product_id` nullable, `name`, `image`, `price`, `size`, `color`, `quantity`. |
| `reviews` | `id` GUID PK, `product_id` cascade delete, `user_id` (no cascade -- multiple cascade paths warning), `user_name`, `rating` (1-5), `comment` (1000), timestamps. Trigger auto-updates `updated_at`. |
| `refresh_sessions` | `id` GUID PK, `user_id` cascade delete, `token_id_hash` unique, `rotated_from_token_id_hash`, `created_at`, `expires_at`, `revoked_at`. |
| `replacement_requests` | `id` GUID PK, `request_id` unique (`RD-CASE-000001` sequence), `order_id` cascade delete, `user_id`, `type` (`damaged`/`replacement`), `status` enum (`pending|approved|rejected|pickup_scheduled|picked_up|out_for_delivery|delivered`), `images` JSON, `description`, `requested_size`, `current_size`, `admin_notes`, `delivery_date`, timestamps. Trigger auto-updates `updated_at`. |

### Migrations / Bootstrap
- Some tables (replacement_requests) and their indexes/sequences/triggers are bootstrapped idempotently from code in `src/lib/db/replacements.ts` — not strictly via migration files, but via `ensureReplacementRequestsTable()`.
- User `is_verified`/OTP columns and orders `tracking_number` column are also idempotently added in `src/lib/db/users.ts` and `src/lib/db/orders.ts`.

### Raw SQL Reference
`schema.sql` at project root contains the complete T-SQL DDL.

---

## Authentication & Authorization

- **Access token**: JWT, cookie name `rift_token`, 30-day expiry.
- **Refresh token**: JWT with `tokenId` (UUID) for rotation, cookie name `rift_refresh`, 30-day expiry. Rotation defined in `createRefreshSession` / `revokeRefreshSession`. Token IDs stored hashed (SHA-256) in `refresh_sessions`.
- **Signed-up accounts without email verification are blocked from login** (`is_verified` gate). Existing accounts were backfilled to verified on first run.
- **OTP flow**: 10-minute TTL, 4-digit random numeric codes, bcrypt hashed before storage. Used for signup verification and password reset.
- **Admin routes**: `/admin/*` and `/api/admin/*` are middleware-guarded. `api-helpers.ts` provides `requireAuth()` and `requireAdmin()`.

### Auth Flow
1. `POST /api/auth/register` → creates user (unverified), sends OTP email.
2. `POST /api/auth/verify-otp` → marks user verified.
3. `POST /api/auth/login` → validates credentials + verification gate → sets access + refresh cookies + creates refresh session.
4. `GET /api/auth/me` → returns current user from `rift_token`.
5. `DELETE /api/auth/me` → logout: revokes refresh session, clears cookies.
6. Password reset: `POST /api/auth/forgot-password` → sends OTP; `POST /api/auth/reset-password` → verifies OTP + updates password.

---

## Client State (Zustand)

| Store | File | Persisted? | Key State |
|-------|------|-----------|-----------|
| cart | `src/store/cartStore.ts` | Yes (`rift-cart` localStorage) | `items` (`ICartItem[]`), `isOpen`, `couponCode`, `discount`. Methods: `addItem`, `removeItem`, `updateQuantity`, `setCoupon`, `clearCart`, `subtotal`, `total`. Shipping logic: free >=150, else 12. |
| auth | `src/store/authStore.ts` | No | `user` (null→object), `loading`. `login`, `logout` (also calls DELETE /api/auth/me), `fetchUser` (GET /api/auth/me). |
| loyalty | `src/store/loyaltyStore.ts` | — | — |
| personalization | `src/store/personalizationStore.ts` | — | — |

---

## API Routes Summary

All under `src/app/api/`.

### Public / User
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | List products (category, collection, featured, bestSeller, limitedDrop, search, sort, pagination). |
| GET | `/api/products/[slug]` | Get single product by slug. |
| GET | `/api/banners` | Active banners (for homepage carousel). |
| POST | `/api/newsletter` | Subscribe to newsletter. |
| GET | `/api/reviews` | Get reviews (product filter). |
| POST | `/api/reviews` | Create review (requires auth). |
| GET | `/api/orders/track` | Track order by `orderNumber` query. |
| POST | `/api/chatbot` | AI chatbot endpoint (likely stylist assistant). |
| POST | `/api/coupons/validate` | Validate coupon code for cart. |
| GET/POST | `/api/wishlist` | Get / add wishlist item. |
| GET/POST | `/api/replacements` | List (own), create replacement request (requires auth). |

### Auth
| Method | Path |
|--------|------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |
| PUT | `/api/auth/me` |
| DELETE | `/api/auth/me` |
| POST | `/api/auth/forgot-password` |
| POST | `/api/auth/reset-password` |
| POST | `/api/auth/verify-otp` |
| POST | `/api/auth/resend-otp` |

### Admin (require `requireAdmin`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/orders` | List all orders (with user info). |
| PUT | `/api/admin/orders` | Update order status / tracking. |
| GET | `/api/admin/products` | List all products. |
| POST | `/api/admin/products` | Create product. |
| PUT | `/api/admin/products` | Update product (by id body). |
| DELETE | `/api/admin/products` | Delete product (by id body). |
| GET | `/api/admin/banners` | List all banners. |
| POST | `/api/admin/banners` | Create banner. |
| PUT | `/api/admin/banners` | Update banner. |
| DELETE | `/api/admin/banners` | Delete banner. |
| GET | `/api/admin/coupons` | List all coupons. |
| POST | `/api/admin/coupons` | Create coupon. |
| DELETE | `/api/admin/coupons` | Delete coupon. |
| GET | `/api/admin/customers` | List users with role=`user`. |
| GET/PUT | `/api/admin/replacements/[id]` | Get / admin-update replacement by id. |
| GET | `/api/admin/replacements` | List all replacements. |
| POST | `/api/admin/upload` | File upload endpoint (Cloudinary). |
| GET | `/api/admin/analytics` | Dashboard analytics data. |

---

## Env Vars (check `.env.example`)

| Var | Required | Notes |
|-----|----------|-------|
| `JWT_SECRET` | Yes | Signs JWTs. |
| `SQLSERVER_HOST` | Yes | SQL Server hostname. |
| `SQLSERVER_PORT` | No (default 1433) | |
| `SQLSERVER_DB` | No (default `RiftDistrict`) | |
| `SQLSERVER_USER` | Yes | |
| `SQLSERVER_PASSWORD` | Yes | |
| `SQLSERVER_ENCRYPT` | No | |
| `SQLSERVER_TRUST_CERT` | No | |
| `NEXT_PUBLIC_APP_URL` | No | Used by same-origin assert. |
| Cloudinary vars | Yes (via `next-cloudinary`) | |
| Nodemailer (SMTP) vars | Yes | Used by email templates. |

---

## UI / Visual Language

- Dark theme: body `bg-black text-white`.
- Brand palette (`src/lib/constants.ts`): base `#1A2730`, surface `#424048`, slate `#45586C`, mist `#B0CEE2`, rust `#A63E1B`, orange `#E95D2C`.
- Brand name: **RIFT DISTRICT**, tagline: *Luxury Streetwear Redefined*.
- Fonts: CSS vars defined in `globals.css` (`--font-display`, `--font-body`, etc.).
- Custom cursor, magnetic buttons, Lenis scroll, GSAP text reveals, Framer Motion page transitions.
- Social proof widgets: `StockCountdown`, `TrendingBadge`, `LivePurchaseNotifications`, `CustomerPhotos`.
- AI Chatbot (`src/components/ui/AIChatbot.tsx`) and Style Quiz (`src/components/personalization/StyleQuiz.tsx`).

---

## Key Libraries & Their Use

| Library | Purpose |
|---------|---------|
| `zustand` | Client state (cart, auth, personalization, loyalty). Cart is persisted. |
| `@tanstack/react-query` | Likely server state / data fetching (used in ClientProviders). |
| `react-hook-form` + `zod` | Form validation (login, signup, checkout, admin). |
| `framer-motion` | Page transitions, animations. |
| `gsap` + `@gsap/react` | Hero / scroll animations. |
| `lenis` | Smooth scrolling wrapper. |
| `lucide-react` | Icon set. |
| `sonner` | Toast notifications. |
| `recharts` | Admin analytics charts. |
| `nodemailer` | Email transporter. |
| `bcryptjs` | Password hashing + OTP hashing. |
| `jsonwebtoken` | Access + refresh token signing. |
| `next-cloudinary` | Image optimization / upload. |
| `@upstash/redis` + `@upstash/ratelimit` | Rate limiting + any caching. |
| `mssql` | SQL Server driver. |

---

## Important Conventions

1. **DB layer lives in `src/lib/db/*.ts`** — all raw parameterized SQL via `query(text, params)`. No ORM.
2. **JSON arrays stored as strings** in SQL Server (`images`, `sizes`, `colors`, `tags`) and parsed in code / stored as `nvarchar(max)` with `ISJSON` checks.
3. **`id` naming** — DB uses `id` GUID PKs; TypeScript mapper aliases them to `_id` in interfaces.
4. **API helpers** — `jsonResponse`, `errorResponse`, `requireAuth`, `requireAdmin` from `src/lib/api-helpers.ts`.
5. **Security** — `assertSameOrigin` in `src/lib/security.ts` for mutation routes; rate limiting via `src/lib/rate-limit.ts`.
6. **Middleware** (`src/middleware.ts`) — currently a no-op pass-through for `/admin/:path*` and `/api/admin/:path*`.
7. **Column idempotency** — `ensureUserAuthColumns()`, `ensureOrderTrackingColumn()` etc. exist so schema migrations don't need separate SQL migrations.
8. **Demo fallback** — `src/lib/demo-products.ts` exports `DEMO_PRODUCTS: IProduct[] = []` (empty). Used only when DB unavailable; no demo catalog is bundled.

---

## Common Attribute Paths When Editing

- Root layout (Navbar + Providers + Chatbot): `src/app/layout.tsx`
- Cart state: `src/store/cartStore.ts`
- Auth state + logout: `src/store/authStore.ts`
- SQL connection: `src/lib/sql.ts` (`getPool`, `query`, `withTransaction`)
- Auth tokens/cookies: `src/lib/auth.ts`
- User/address/banner/coupon/review/order/replacement DB functions: `src/lib/db/*.ts`
- TypeScript models: `src/types/index.ts` (+ `replacement.ts`)
- Error + auth helper utilities: `src/lib/api-helpers.ts`
- Admin sidebar: `src/components/admin/sidebar.tsx`
- Product form: `src/components/admin/product-form.tsx`

---

## Quick Reference: Page Purposes

- Home (`/`) — Hero, featured / best sellers, social proof, newsletter.
- Shop (`/shop`) — Product listing with category / collection / search / sort.
- Collection (`/collection/[slug]`) — Category or collection pages.
- Product (`/product/[slug]`) — PDP with gallery, size guide, reviews, add to cart.
- Cart (`/cart`) — Cart drawer + page.
- Checkout (`/checkout`) — Checkout form + coupon.
- Orders (`/orders`, `/orders/track`) — Order history + public tracking.
- Profile (`/profile`) — Account details + addresses.
- Repl tracking (`/replacement-tracking/[requestId]`) — Public status page.
- Admin dashboard (`/admin/*`) — Overview, product management, order management, customer management, coupon management, banner management, replacement management.
