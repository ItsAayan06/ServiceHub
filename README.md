# ServiceHub — Full-Stack Service Booking Platform

A production-ready MERN stack application for booking local home services (electricians, plumbers, AC repair, cleaning, and more) with real-time updates, role-based dashboards, and location-based provider matching.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| File Upload | Cloudinary + Multer |
| State | React Context API |

---

## Project Structure

```
servicehub/
├── server/                    # Express backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js  # Register, login, provider setup
│   │   ├── bookingController.js
│   │   └── providerController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Provider.js
│   │   ├── Booking.js
│   │   ├── Category.js
│   │   ├── Review.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── providers.js
│   │   ├── bookings.js
│   │   ├── categories.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── utils/
│   │   └── jwt.js
│   ├── seed.js                # Database seeder
│   ├── index.js               # Entry point + Socket.io
│   └── .env.example
│
└── client/                    # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── MainLayout.jsx       # Navbar + Footer
    │   │   │   └── DashboardLayout.jsx  # Sidebar dashboard
    │   │   ├── common/
    │   │   │   ├── StarRating.jsx
    │   │   │   ├── StatusBadge.jsx
    │   │   │   └── Spinner.jsx
    │   │   └── user/
    │   │       └── ProviderCard.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── NotificationContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ServicesPage.jsx
    │   │   ├── ProviderDetailPage.jsx
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── ProviderSetupPage.jsx
    │   │   ├── user/
    │   │   │   ├── UserDashboard.jsx
    │   │   │   ├── MyBookingsPage.jsx
    │   │   │   ├── BookingDetailPage.jsx
    │   │   │   ├── BookingPage.jsx
    │   │   │   └── UserProfilePage.jsx
    │   │   ├── provider/
    │   │   │   ├── ProviderDashboard.jsx
    │   │   │   ├── ProviderBookings.jsx
    │   │   │   ├── ProviderProfile.jsx
    │   │   │   └── ProviderEarnings.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminUsers.jsx
    │   │       ├── AdminProviders.jsx
    │   │       └── AdminBookings.jsx
    │   ├── utils/
    │   │   ├── api.js          # Axios instance with interceptors
    │   │   ├── socket.js       # Socket.io client
    │   │   └── helpers.js      # Formatters, utilities
    │   ├── App.jsx             # Router + protected routes
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd servicehub

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/servicehub
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd server
node seed.js
```

This creates:
- 8 service categories
- Admin, demo user, and 4 demo provider accounts

### 4. Run in Development

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open: http://localhost:5173

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Customer | user@demo.com | demo123 |
| Electrician | provider@demo.com | demo123 |
| Plumber | plumber@demo.com | demo123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |
| POST | `/api/auth/provider/setup` | Protected |

### Providers
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/providers` | Public |
| GET | `/api/providers/:id` | Public |
| GET | `/api/providers/me` | Provider |
| PUT | `/api/providers/me` | Provider |

### Bookings
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/bookings` | User |
| GET | `/api/bookings/my` | User |
| GET | `/api/bookings/provider` | Provider |
| GET | `/api/bookings/provider/stats` | Provider |
| GET | `/api/bookings/:id` | Protected |
| PUT | `/api/bookings/:id/status` | Protected |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/analytics` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/toggle` | Admin |
| GET | `/api/admin/providers` | Admin |
| PUT | `/api/admin/providers/:id/approve` | Admin |
| GET | `/api/admin/bookings` | Admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/reviews` | User |
| GET | `/api/reviews/provider/:id` | Public |
| PUT | `/api/reviews/:id/respond` | Provider |

---

## Features

### User
- Register/Login with JWT
- Browse & search service providers
- Filter by category, rating, location radius
- View provider profiles with services, reviews, availability
- Book a service (date, time, address, notes)
- Track booking status in real-time
- View booking history & details
- Cancel bookings
- Submit star ratings & reviews
- Manage profile & avatar

### Provider
- Register and set up service profile
- List multiple services with pricing
- Set weekly availability
- View & manage incoming bookings
- Accept, reject, start, complete bookings
- View earnings overview & monthly chart
- Edit skills, services, bio
- Receive real-time booking notifications

### Admin
- Analytics dashboard (users, providers, revenue)
- Approve/reject provider applications
- Manage user accounts (activate/deactivate)
- View all platform bookings
- Monitor booking status breakdown
- Monthly revenue charts

### Real-time (Socket.io)
- Booking status change notifications
- New booking alerts for providers
- Toast notifications for all status updates
- Unread notification badge in navbar

---

## Booking Flow

```
User books service
      ↓
Status: PENDING  → Provider notified via Socket.io
      ↓
Provider ACCEPTS or REJECTS
      ↓
Status: ACCEPTED → User notified
      ↓
Provider starts work
      ↓
Status: IN PROGRESS
      ↓
Provider marks complete
      ↓
Status: COMPLETED → User can leave review
```

---

## Cloudinary Setup (for image uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret
3. Add them to `server/.env`

Without Cloudinary, the app works fully — image upload features simply won't save.

---

## Production Build

```bash
# Build React frontend
cd client && npm run build

# Serve with Node (add static serving to index.js):
# app.use(express.static('../client/dist'))
```

---

## Environment Notes

- MongoDB must be running locally or use MongoDB Atlas connection string
- Socket.io uses the same port as the Express server (HTTP upgrade)
- CORS is configured for `CLIENT_URL` — update for production domain
