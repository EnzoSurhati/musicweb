# 🎵 WAXROOM — Music Ecommerce Website

A full-stack music album store with real payments and order confirmation emails. Built with React, Node.js, PostgreSQL, Stripe, and Resend — fully containerized with Docker.

![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-black?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=flat-square&logo=stripe)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Overview

WAXROOM is a fully functional digital music storefront where users can browse albums, manage a cart, save items for later, and complete purchases with real credit card payments. After checkout, customers receive a beautifully designed order confirmation email automatically.

---

## Features

- 🏠 **Home** — Hero section, featured albums, new releases, genre browser
- 🎵 **Albums** — Browse, search, filter by genre, sort by price or rating
- 🎸 **Album Detail** — Cover art, full tracklist, ratings, add to cart or save
- 🎼 **New Releases & Genres** — Dedicated browsing pages
- 🔐 **Authentication** — Register, login, JWT-based sessions
- 👤 **Account** — View and edit profile
- 🛒 **Cart** — Slide-out sidebar with quantity controls and live totals
- 💳 **Checkout** — Billing form with real Stripe card payments
- ✅ **Order Confirmation** — Full order summary with order number and billing details
- 📧 **Confirmation Email** — HTML receipt sent automatically via Resend
- ♥ **Saved for Later** — Wishlist with move-to-cart functionality
- 📦 **Order History** — Full purchase history with itemized details

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios, Stripe.js |
| Backend | Node.js, Express |
| Database | PostgreSQL 15 |
| Payments | Stripe |
| Email | Resend |
| Infrastructure | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/waxroom.git
cd waxroom
```

### 2. Configure environment variables

Open `docker-compose.yml` and add your API keys:

```yaml
STRIPE_SECRET_KEY: sk_test_...
STRIPE_PUBLISHABLE_KEY: pk_test_...
RESEND_API_KEY: re_...
FROM_EMAIL: onboarding@resend.dev
```

> ⚠️ Never commit real API keys to a public repository. Consider using a `.env` file and adding it to `.gitignore`.

### 3. Start the app

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Health Check | http://localhost:4000/api/health |

A healthy response looks like:
```json
{ "status": "ok", "stripe": true, "email": true }
```

---

## Test Payments

Use Stripe's test card details to simulate a purchase:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any 5 digits |

No real charges are made in test mode.

---

## Project Structure

```
waxroom/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js              # Express API, Stripe, Resend email
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── components/
        │   ├── Navbar.js
        │   ├── AlbumCard.js
        │   ├── CartSidebar.js
        │   ├── Footer.js
        │   └── Toasts.js
        └── pages/
            ├── Home.js
            ├── Albums.js
            ├── AlbumDetail.js
            ├── Auth.js
            ├── Checkout.js
            ├── OrderConfirmation.js
            ├── AccountPages.js
            └── ExtraPages.js
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| PUT | `/api/auth/me` | ✓ | Update profile |
| GET | `/api/albums` | — | List albums (`?genre=`, `?search=`, `?sort=`, `?featured=true`) |
| GET | `/api/albums/:id` | — | Get single album |
| GET | `/api/genres` | — | List all genres |
| GET | `/api/cart` | ✓ | Get cart items |
| POST | `/api/cart` | ✓ | Add item to cart |
| PUT | `/api/cart/:id` | ✓ | Update item quantity |
| DELETE | `/api/cart/:id` | ✓ | Remove item from cart |
| GET | `/api/saved` | ✓ | Get saved items |
| POST | `/api/saved/:id` | ✓ | Save an item |
| DELETE | `/api/saved/:id` | ✓ | Remove saved item |
| POST | `/api/payments/create-intent` | ✓ | Create Stripe payment intent |
| GET | `/api/orders` | ✓ | Get order history |
| GET | `/api/orders/:id` | ✓ | Get single order |
| POST | `/api/orders` | ✓ | Place order and send confirmation email |

---

## Going Live

1. **Stripe** — Activate your Stripe account and replace test keys with live keys
2. **Resend** — Verify a custom domain to send emails to any recipient
3. **Deploy** — Suggested stack: backend on [Railway](https://railway.app), frontend on [Vercel](https://vercel.com), database on [Supabase](https://supabase.com)

---