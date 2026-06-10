# 🗄️ Database Setup Guide

Welcome to the PostgreSQL integration for Destinix AI Travel! The backend has been migrated from a local `bookings.json` file to a scalable PostgreSQL database using Prisma ORM.

As the project maintainer, you will need to provision a PostgreSQL database for both local development and your production (Vercel) deployment.

Follow this guide to get your database up and running in minutes.

---

## 1. Provision a PostgreSQL Database
The easiest way to get a free, serverless PostgreSQL database is through **Supabase** or **Neon**.

### Using Supabase (Recommended)
1. Go to [Supabase](https://supabase.com/) and create an account.
2. Click **New Project** and choose a strong database password. Wait a minute for the database to provision.
3. Click the **Connect** button at the top right of the dashboard.
4. Go to the **ORMs** tab and select **Prisma**.
5. Supabase will provide you with two connection strings:
   - **Transaction Pooler** (Port 6543, used for `DATABASE_URL`)
   - **Session Pooler / Direct** (Port 5432, used for `DIRECT_URL`)

---

## 2. Configure Environment Variables
In the root directory of this project, you need to add these connection strings to your `.env` file (for local development).

Open your `.env` file and append:
```env
# Database connection for queries (Transaction Pooler)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-xx-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct database connection for Prisma Migrations (Session Pooler)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-xx-west-1.pooler.supabase.com:5432/postgres"
```

> **Important:** Remember to replace `[YOUR-PASSWORD]` with the actual database password you created in step 1.

---

## 3. Generate the Prisma Client
Before you can run the server, you need to generate the Prisma Client types. This ensures TypeScript knows exactly what your database tables look like.

Run this command in your terminal:
```bash
npx prisma generate
```

---

## 4. Push the Database Schema
Now you need to push the `Booking` schema defined in `prisma/schema.prisma` to your actual Supabase database to create the tables.

Run this command:
```bash
npx prisma db push
```
*Note: If you plan on using migrations in the future instead of direct pushes, use `npx prisma migrate dev`.*

---

## 5. Deploying to Vercel (Production)
When deploying the application to Vercel, the local `.env` file is ignored. You must configure these variables securely in your Vercel project settings.

1. Go to your **Vercel Dashboard** -> **Project Settings** -> **Environment Variables**.
2. Add `DATABASE_URL` and paste your Transaction Pooler string.
3. Add `DIRECT_URL` and paste your Session/Direct string.
4. Vercel will automatically run `prisma generate` during the build step (as defined by `@prisma/client`), so no extra build commands are needed.

You are all set! 🎉
