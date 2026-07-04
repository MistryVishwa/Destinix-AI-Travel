# ✈️ Destinix AI Travel

[![SSoC Season 5](https://img.shields.io/badge/SSoC-2026-orange.svg?style=flat-square)](https://socialsummerofcode.com/)
[![React 19](https://img.shields.io/badge/React-19.2-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express-5.2-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.42-purple.svg?style=flat-square&logo=googlegemini)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![CI](https://github.com/Mohammad-Hassan027/Destinix-AI-Travel/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammad-Hassan027/Destinix-AI-Travel/actions/workflows/ci.yml)

**Destinix AI Travel** is a state-of-the-art, premium AI-powered travel planning and package booking platform. Designed with sleek dark aesthetics, micro-animations, and interactive layouts, it offers users seamless itinerary generation, curated travel package exploring, email-verified booking engines, and personal travel assistant chats.

🌐 **Demo / Deployment**: [Destinix on Vercel](https://github.com/MistryVishwa/Destinix-AI-Travel) (Host URL managed by Project Admin)

---

## 🎨 Design & Visual Aesthetics

Destinix is built to feel highly premium:
* **Glassmorphism Layouts**: Utilizing blur backdrops, thin white borders, and vibrant glow shadows.
* **Sleek Dark Mode**: Rich `#030712` (gray-950) backgrounds combined with Indigo and Violet accents.
* **Micro-Animations**: Powered by `motion` (Framer Motion v12) for page transitions, navbar selection tabs, and button hover states.
* **Typography**: Elegant font pairings featuring modern serif headings and clean sans-serif bodies.

---

## 🚀 Key Features

* **🤖 Gemini AI Travel Planner**: Input your destination, budget, duration, and style. Our customized Gemini API integrations compile day-by-day itineraries with travel highlights.
* **🏝️ Curated Experiences Catalog**: Filter through domestic, international, and luxury packages with real-time detail showcases, highlights, and cost structures.
* **💬 Live Advisor Chatbot**: Chat directly with an interactive travel assistant to ask questions about your trip, suggestions, or help with booking.
* **🔒 Firebase Authentication**: Fully secure client-side user accounts allowing bookmarked trips, saved plans, and customized profile updates.
* **🎫 Secure Booking & Receipts**: A booking flow with Gmail SMTP integration to send customized PDFs and transaction details directly to the user's inbox.
* **💸 Price Drop Alerts**: Set targeted budget alerts for packages to receive notifications when travel pricing goes down.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 (TypeScript, React Router DOM v7)
* **Design & Styling**: Tailwind CSS, Motion (Framer Motion), Lucide Icons
* **Backend Runtime**: Node.js, Express (using `tsx` for TypeScript execution)
* **Database & Services**: Firebase Client SDK (Authentication), PostgreSQL via Prisma ORM (Bookings)
* **Integrations**: Google Gemini Developer API (`@google/genai`), Razorpay SDK, Nodemailer (SMTP configuration)

---

## 📂 Project Structure

```
Destinix-AI-Travel-main/
├── api/                   # (Optional) Cloud function adapters or specific API code
├── components/            # React Components
│   ├── About.tsx          # About page component
│   ├── AIPlanner.tsx      # Gemini AI planner view
│   ├── AdvisorChat.tsx    # Floating chatbot assistant
│   ├── Auth.tsx           # Firebase login / registration modal
│   ├── BookingPage.tsx    # Booking inputs & receipts
│   ├── CTASection.tsx     # Hero Call-to-action
│   ├── Hero.tsx           # Premium landing hero
│   ├── Navbar.tsx         # Animated responsive navigation
│   └── Profile.tsx        # Saved plans & price alerts dashboard
├── services/              # External API connectors
│   ├── authService.ts     # Firebase auth queries
│   └── geminiService.ts   # Gemini generation endpoints
├── prisma/                # Database schema and Prisma configuration
├── utils/                 # General helpers
├── types.ts               # Shared TypeScript schemas
├── constants.tsx          # Package database & category structures
├── server.ts              # Express.js backend (Vite middleware for HMR dev)
├── App.tsx                # Main Router layout
├── index.html             # Vite entry layout
├── index.tsx              # React bootstrap
├── tsconfig.json          # TS config
├── vite.config.ts         # Vite bundler properties
└── package.json           # Scripts and dependency lists
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file at the root of the project (you can use `.env.example` as a template):

| Variable | Description | Example / Location |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Transaction pooler) | `postgresql://postgres...:6543/postgres` |
| `DIRECT_URL` | PostgreSQL direct connection string (Session pooler) | `postgresql://postgres...:5432/postgres` |
| `GEMINI_API_KEY` | Google AI Studio Key | [Get API Key](https://aistudio.google.com/) |
| `VITE_FIREBASE_API_KEY` | Firebase API Client Key | Firebase console -> Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Domain | `<project-name>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase ID | Project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase storage URL | `<project-name>.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase sender ID | 12-digit number |
| `VITE_FIREBASE_APP_ID` | Firebase App identifier | `1:xxx:web:xxx` |
| `SMTP_USER` / `EMAIL_USER` | Gmail Address for Nodemailer | `your-email@gmail.com` |
| `SMTP_PASS` / `EMAIL_PASS` | Gmail App Password | Gmail Settings -> App Passwords |
| `RAZORPAY_KEY_ID` | Razorpay API Public Key | [Razorpay Settings](https://dashboard.razorpay.com) |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | Razorpay Key Secret |

---

## 🏁 Local Installation & Development

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/MistryVishwa/Destinix-AI-Travel.git
cd Destinix-AI-Travel
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup the Database
Generate the Prisma Client and push the schema to your PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Project
Start both the Express backend server and the Vite frontend HMR server simultaneously:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
To test the built bundle locally:
```bash
npm run build
npm run preview
```

---

## 🗺️ Future Enhancements & Roadmap

* [ ] **Google Maps API**: Embed active mapping routes directly onto generated AI itineraries.
* [ ] **Collaborative Planning**: Invite friends to view, edit, and co-book custom itineraries.
* [ ] **Expense Tracker**: Add a currency-converter enabled budgeting calculator for booking.
* [ ] **Offline Mode**: Allow PDF itinerary downloading and local cached viewing of trip bookings.

---

## 🤝 Contribution Guidelines
Interested in contributing to Destinix AI Travel? Read our [CONTRIBUTING.md](CONTRIBUTING.md) to understand SSoC rules, branch names, coding standards, and how to submit a pull request.
