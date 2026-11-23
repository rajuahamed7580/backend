# PrivateDelights Modular Backend API

A scalable, production-grade REST API backend built for the **PrivateDelights** dynamic listing and profile platform, featuring dynamic profiles, galleries, multi-tab content (About, Reviews, Schedule, Screening), ratings, review moderation, an automated demo review generator, Cloudinary integration, and an administrative dashboard.

---

## 🚀 Technology Stack

- **Runtime & Framework:** Node.js (v18+) with Express.js
- **Database:** MongoDB with Mongoose ORM
- **Language:** Pure Modern JavaScript (ES6+ with ES Modules `import`/`export`)
- **Authentication & Security:** bcryptjs (salted password hashing), jsonwebtoken (JWT), CORS
- **Validation:** Zod for request payloads, query parameters, and identifiers
- **File & Media Storage:** Cloudinary SDK with Multer memory storage
- **Development Tooling:** Nodemon for hot reloading, dotenv for configuration management

---

## 📂 Project Architecture

```
backend/
├── src/
│   ├── app.js                          # Express application configuration & route mounting
│   ├── server.js                       # Server initialization & database connection
│   │
│   ├── config/
│   │   ├── index.js                    # Centralized environment configuration
│   │   ├── database.js                 # MongoDB connection handler
│   │   └── cloudinary.js               # Cloudinary SDK client configuration
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT authentication & optional guest auth
│   │   ├── role.middleware.js          # Role-based access control (RBAC)
│   │   ├── validate.middleware.js      # Zod request validation middleware
│   │   ├── error.middleware.js         # Global centralized error handler
│   │   ├── notFound.middleware.js      # 404 handler for unmatched routes
│   │   └── upload.middleware.js        # Multer image upload filter and buffer handling
│   │
│   ├── utils/
│   │   ├── AppError.js                 # Operational error subclass
│   │   ├── catchAsync.js               # Async function error-forwarding wrapper
│   │   ├── sendResponse.js             # Standardized API response formatter
│   │   └── cloudinary.js               # Cloudinary stream buffer uploader & asset deletion
│   │
│   ├── modules/
│   │   ├── auth/                       # Authentication (register, login, getMe)
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.route.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── user/                       # User management & administration
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.route.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── post/                       # Main profile listings, tabs, dynamic attributes
│   │   │   ├── post.model.js
│   │   │   ├── post.controller.js
│   │   │   ├── post.service.js
│   │   │   ├── post.route.js
│   │   │   └── post.validation.js
│   │   │
│   │   ├── comment/                    # Reviews, ratings, and demo review generator
│   │   │   ├── comment.model.js
│   │   │   ├── comment.controller.js
│   │   │   ├── comment.service.js
│   │   │   ├── commentGenerator.service.js
│   │   │   ├── comment.route.js
│   │   │   └── comment.validation.js
│   │   │
│   │   └── dashboard/                  # Administrative analytics & overview stats
│   │       ├── dashboard.controller.js
│   │       ├── dashboard.service.js
│   │       └── dashboard.route.js
│   │
│   └── seed/
│       ├── seedSuperAdmin.js           # Enforces single Super Admin creation
│       └── seedSampleData.js           # Populates exact sample profile (miaa_snow) with 10 reviews
│
├── .env                                # Local environment variables
├── .env.example                        # Template for environment configuration
├── .gitignore
└── package.json
```

---

## ⚙️ Environment Configuration

Configure the `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=mongodb://127.0.0.1:27017/privatedelights

# JWT Configuration
JWT_SECRET=privatedelights_super_secret_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d

# Super Admin Default Credentials (Used by seed script)
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=admin@privatedelights.com
SUPER_ADMIN_PASSWORD=AdminPassword123!

# Cloudinary Configuration (Supply your Cloudinary credentials)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Whitelist (Comma separated URLs)
CLIENT_URL=http://localhost:3000,http://localhost:5173
```

---

## 🛠️ Installation & Running

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Seed the Super Admin:**
   > Only one super admin can exist; subsequent runs will detect the existing admin and safely skip creation.
   ```bash
   npm run seed:admin
   ```

3. **Seed Reference Profile & Reviews (from screenshots):**
   ```bash
   npm run seed:data
   ```

   Or run both with:
   ```bash
   npm run seed
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/auth/me` | Authenticated | Fetch current authenticated user's profile |

### 2. User Administration (`/api/v1/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | Retrieve paginated list of users |
| `GET` | `/users/:id` | Authenticated | Retrieve single user by ID |
| `POST` | `/users` | Admin | Create user account |
| `PATCH` | `/users/:id` | Admin | Update user information |
| `PATCH` | `/users/:id/block` | Admin | Block user access |
| `PATCH` | `/users/:id/unblock` | Admin | Restore user access |
| `DELETE` | `/users/:id` | Admin | Delete user account |

### 3. Profiles / Posts (`/api/v1/posts`)

> **Single Post Rule:** The detail endpoint (`/posts/slug/:slug` or `/posts/:id`) delivers the complete profile for exactly one post at a time, containing approved reviews, dynamic attributes, tab content, and adjacent previous/next navigation links.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/posts` | Public | List summary cards of published posts (filter by city, state, category) |
| `GET` | `/posts/slug/:slug` | Public | **Single post view** with full details and approved reviews |
| `GET` | `/posts/:id` | Public / Admin | Fetch post by ID |
| `POST` | `/posts` | Authenticated / Admin | Create new profile post |
| `PATCH` | `/posts/:id` | Post Owner / Admin | Update post details |
| `DELETE` | `/posts/:id` | Post Owner / Admin | Delete post and cascade delete its comments |
| `PATCH` | `/posts/:id/publish` | Post Owner / Admin | Set status to `published` |
| `PATCH` | `/posts/:id/archive` | Post Owner / Admin | Set status to `archived` |
| `POST` | `/posts/:id/upload-images` | Post Owner / Admin | Upload multiple images directly to Cloudinary |

### 4. Comments & Reviews (`/api/v1/comments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/comments` | Public / Guest | Submit review for a post (queued in `isApproved: false`) |
| `GET` | `/comments/post/:postId` | Public | Get approved reviews for a post (Admin sees all) |
| `GET` | `/comments` | Admin | List all reviews across the platform with moderation filters |
| `GET` | `/comments/:id` | Authenticated | Get single comment details |
| `PATCH` | `/comments/:id` | Authenticated / Admin | Update review or attach provider response |
| `DELETE` | `/comments/:id` | Owner / Admin | Delete review (recalculates post average rating) |
| `PATCH` | `/comments/:id/approve` | Admin | Approve review (recalculates post average rating) |
| `PATCH` | `/comments/:id/reject` | Admin | Move review to unapproved status |
| `POST` | `/comments/generate` | Admin | **Automated Demo Review Generator** (see below) |

#### 🎲 Demo Review Generator
Admin endpoint for generating realistic demo reviews:
```http
POST /api/v1/comments/generate
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "postId": "65b5c98f7e2a9c1d04e5f67a",
  "limit": 5
}
```
- Sets `isGenerated: true` and `isApproved: false`.
- Prevents duplicate comments on the same post.
- Returns a summary of generated reviews ready for preview and moderation.

### 5. Admin Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Admin | Platform overview: post counts, review statuses, user metrics, pending queue |
| `GET` | `/dashboard/analytics` | Admin | Category distribution, geographic density, rating breakdown |

---

## 🎨 Frontend Applications

1. **Admin Dashboard (`dashboard/`):**
   - React 19 + Vite + Tailwind CSS
   - Real-time statistics, Profile Listing manager, Review Moderation queue, Demo Review Generator, and User access control.
   - Run with: `cd dashboard && npm run dev` (starts on `http://localhost:5173`)

2. **Client Website (`website/`):**
   - Next.js + Tailwind CSS
   - Matches the reference screenshots pixel-for-pixel (gallery carousel, profile card, About/Reviews/Schedule/Screening tabs, dynamic reviews list, and review submission modal).
   - Run with: `cd website && npm run dev` (starts on `http://localhost:3000`)
