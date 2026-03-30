# WardLog Frontend

A clean hospital ward management frontend built with **React**, **TypeScript**, and **Vite**. This project currently includes a login screen and a doctor dashboard UI for viewing patient summaries, tasks, notices, and clinical notes.

## ✨ Features

- **Login page** for staff access
- **Doctor dashboard** with quick ward insights
- **Patient overview** and recent clinical notes panels
- **Tasks** and **noticeboard** sections
- **Responsive UI** with reusable layout and card components
- **Client-side routing** using `react-router-dom`

## 🛠️ Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **React Icons**
- **Tailwind CSS 4**
- **ESLint**

## 📁 Project Structure

```text
wardlog-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Doctor/
│   │   │   └── DoctorsDashboard.tsx
│   │   ├── layout/
│   │   └── ui/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will usually be available at:

```text
http://localhost:5173
```

## 📜 Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build the project for production     |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint checks                    |

## 🧭 Current Routes

- `/login` — login page
- `/doctor/dashboard` — doctor dashboard

## 📌 Current Status

This is currently a **frontend prototype/UI project** with static sample data. Backend integration, authentication, and live hospital workflow features can be added later.

## 🔮 Possible Next Improvements

- Connect to a real backend/API
- Add authentication and protected routes
- Manage patient/task data dynamically
- Add role-based dashboards for doctors, nurses, and admins
- Improve testing coverage

## 📄 License

This project is for educational/internal development use unless otherwise specified.
