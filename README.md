# 🎵 WAXROOM — Music Ecommerce Store

A full-stack music album store built with React, Node.js, Express, and PostgreSQL, fully containerized with Docker.

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Google Fonts
- **Backend**: Node.js, Express, JWT auth, bcrypt
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker + Docker Compose

## Features

- 🏠 **Home page** — hero, featured albums, new releases, genre grid
- 🎵 **All Albums** — browse, search, filter by genre, sort by price/rating
- 🎸 **Album Detail** — cover art, tracklist, ratings, add to cart/save
- 🎼 **New Releases** — latest drops
- 🎛️ **Genres** — browse by genre with albums grouped
- 🔐 **Auth** — register, login, JWT sessions
- 👤 **Account** — view/edit profile, nav to orders/saved
- 🛒 **Cart** — slide-out sidebar, quantity controls, real-time totals
- ♥ **Saved for Later** — wishlist, move to cart
- 📦 **Orders** — full order history with items

## Quick Start

### Prerequisites
- Docker Desktop for Mac (you already have this!)

### 1. Run the app

```bash
cd musicstore
docker-compose up --build
```

First run takes ~3-5 minutes to install dependencies.

### 2. Open in browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

### 3. Stop the app

```bash
docker-compose down
```

To also delete the database:
```bash
docker-compose down -v
```

## Development

The app uses volume mounts so code changes hot-reload automatically.

### Useful commands

```bash
# View logs
docker-compose logs -f

# View just backend logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Connect to the database
docker-compose exec db psql -U musicuser -d musicstore
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get profile |
| PUT | /api/auth/me | ✓ | Update profile |

### Albums
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/albums | List all (supports ?genre=, ?search=, ?sort=, ?featured=true, ?new_release=true) |
| GET | /api/albums/:id | Single album |
| GET | /api/genres | All genres |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart | Add item |
| PUT | /api/cart/:albumId | Update quantity |
| DELETE | /api/cart/:albumId | Remove item |
| DELETE | /api/cart | Clear cart |

### Saved
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/saved | Get saved items |
| POST | /api/saved/:albumId | Save item |
| DELETE | /api/saved/:albumId | Remove saved item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Order history |
| POST | /api/orders | Checkout (converts cart to order) |

## Project Structure

```
musicstore/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js          # All API routes in one file
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js          # Routes
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── hooks/
        │   └── useToast.js
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
            ├── AccountPages.js
            └── ExtraPages.js
```
