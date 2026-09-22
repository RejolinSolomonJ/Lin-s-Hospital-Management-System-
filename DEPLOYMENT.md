# 🚀 Deployment Guide: Vercel (Frontend) + Render (Backend)

This comprehensive guide explains how to deploy **Lin's Dental Medical University & Hospital Appointment & Mentorship System** across **Vercel** and **Render**.

---

## 1. Architecture Overview

- **Frontend**: React + Vite (Hosted on **Vercel**)
- **Backend**: Node.js + Express + Socket.IO (Hosted on **Render**)
- **Database**:
  - **Option 1 (Zero-code / Recommended for Sequelize)**: Render PostgreSQL or Supabase PostgreSQL.
  - **Option 2 (MongoDB)**: If using MongoDB Atlas, models can be connected via Mongoose.
  - **Option 3 (Immediate / Free)**: SQLite (Pre-seeded with demo faculties, students & appointments).

---

## 2. Deploying Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository:
   `https://github.com/RejolinSolomonJ/Lin-s-Patient-Appointment-Mangement-System---Students-Faculties`
4. Configure the Web Service settings:
   - **Name**: `lins-dental-hospital-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add Environment Variables in Render:
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_secure_jwt_secret_key_here`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
7. Once deployed, copy your Render Web Service URL (e.g., `https://lins-dental-hospital-api.onrender.com`).

> **Note for WebSockets on Render**: Render natively supports WebSockets and Socket.IO without any additional configuration!

---

## 3. Deploying Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository:
   `https://github.com/RejolinSolomonJ/Lin-s-Patient-Appointment-Mangement-System---Students-Faculties`
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: `https://lins-dental-hospital-api.onrender.com` *(Paste your Render backend URL)*
6. Click **Deploy**.

> **Note on Client-Side Routing**: The repository already includes `frontend/vercel.json` with SPA route rewrites, so navigating directly to `/dashboard` or refreshing pages will work seamlessly.

---

## 4. Cross-Platform & Real-Time Functionality

- The frontend automatically detects `VITE_BACKEND_URL` on Vercel and connects to the Render Socket.IO server.
- Real-time updates for:
  - Patient appointment bookings by students under supervising faculty
  - Appointment status changes
  - Faculty mentorship applications and approvals
  - Clinical dental chair occupancy calendar updates
- Mobile-optimized bottom navigation and drawer calendar support on all iOS & Android devices.
