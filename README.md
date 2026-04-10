# Gated Community Management System - Frontend

> Modern React web application for managing gated community operations with role-based dashboards and real-time updates.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg)](https://tailwindcss.com/)

## 🚀 Features

- **Role-Based Dashboards**: Separate interfaces for Admin, Resident, and Gate Security
- **Real-time Updates**: WebSocket integration for live notifications
- **Payment Integration**: Razorpay payment gateway for online invoice payments
- **Responsive Design**: Mobile-friendly UI with TailwindCSS
- **Smooth Animations**: Framer Motion for enhanced UX
- **Modern Charts**: Recharts for data visualization
- **Form Validation**: React Hook Form with validation

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + Custom CSS
- **State Management**: Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: SockJS + STOMP WebSocket
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend README)

## ⚙️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-frontend-repo-url>
cd frontend-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.production` file:
```env
VITE_API_URL=http://localhost:8080
```

### 4. Run Development Server

```bash
npm run dev
```

Application will be available at http://localhost:5173

## 🧪 Testing

### Run E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Run Unit Tests (Vitest)
```bash
npm run test
```

## 📦 Build for Production

```bash
npm run build
```

Build output will be in `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variable: `VITE_API_URL=<your-railway-backend-url>`
3. Vercel auto-deploys on push to main branch

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📱 User Roles & Features

### Admin Dashboard
- Property and resident management
- Invoice generation (single & batch)
- Payment tracking and reports
- Visitor logs and approval
- Complaint management
- Facility and staff management
- Announcements

### Resident Dashboard
- View and pay invoices online
- Submit and track complaints
- Book community facilities
- Pre-approve visitors
- View announcements
- Profile management

### Gate Security Dashboard
- Visitor verification and check-in/check-out
- View approved visitor list
- Emergency contacts
- Real-time visitor logs

## 🎨 Key Components

- `AdminDashboard.jsx` - Complete admin interface
- `ResidentDashboard.jsx` - Resident portal
- `GateDashboard.jsx` - Security interface
- `AuthContext.jsx` - Authentication state management
- `api.js` - Axios API client with interceptors

## 🔒 Security

- JWT token-based authentication
- Protected routes with role-based access
- Automatic token refresh
- Secure payment processing via Razorpay

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is part of an academic capstone project.

## 👥 Authors

- Your Name - [AbhiramAchana](https://github.com/AbhiramAchana)

## 🔗 Links

- **Backend Repository**: [(https://github.com/AbhiramAchana/gated-community-system-backend1)]
- **Live Demo**: [(https://gated-community-system-frontend1.vercel.app/)]

