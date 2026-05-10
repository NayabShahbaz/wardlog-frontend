# WardLog Frontend

A modern **React + TypeScript** hospital ward management dashboard built with **Vite** and **Tailwind CSS**. Provides role-based dashboards for doctors, nurses, and administrators to manage patients, tasks, clinical documentation, and ward operations.

## ✨ Features

- **Authentication System** — Secure login for staff with JWT tokens
- **Role-Based Dashboards** — Separate interfaces for doctors, nurses, and admins
- **Patient Management** — View patient records, clinical notes, and medical history
- **Clinical Documentation** — E-rounds, lab orders, and clinical notes
- **Task Management** — Create, assign, and track ward tasks
- **Notifications** — Real-time notification panel for staff
- **Staff Directory** — Browse and manage staff information
- **Roster Management** — View and manage shift schedules
- **Notice Board** — Hospital announcements and notices
- **Responsive Design** — Mobile-friendly UI with Tailwind CSS 4
- **Type Safety** — Full TypeScript support for reliable code

## 🛠️ Tech Stack

- **React 19** — Modern UI library with latest features
- **TypeScript 5.9** — Static type checking
- **Vite 8** — Lightning-fast build tool and dev server
- **React Router DOM 7** — Client-side routing
- **Tailwind CSS 4** — Utility-first CSS framework
- **React Icons 5** — Icon library (over 20,000 icons)
- **ESLint 9** — Code quality and style enforcement
- **Node 24** — Runtime type definitions

## 📁 Project Structure

```
wardlog-frontend/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx           # Authentication page
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminNoticeboard.tsx
│   │   │   ├── AdminPatients.tsx
│   │   │   ├── AdminRoster.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── AdminStaffDir.tsx
│   │   ├── clinical/                # Clinical documentation components
│   │   │   ├── ClinicalDocumentation.tsx
│   │   │   ├── ClinicalNoteCard.tsx
│   │   │   ├── ClinicalNotesSection.tsx
│   │   │   ├── CreateERoundModal.tsx
│   │   │   ├── CreateLabOrderModal.tsx
│   │   │   ├── CreateNoteModal.tsx
│   │   │   ├── ERoundsSection.tsx
│   │   │   └── LabOrdersSection.tsx
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── DoctorsDashboard.tsx
│   │   │   └── NursesDashboard.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── DoctorLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── index.ts
│   │   ├── Noticeboard/             # Noticeboard component
│   │   │   └── Noticeboard.tsx
│   │   ├── notifications/           # Notification system
│   │   │   ├── Notificationpanel.tsx
│   │   │   └── NotificationsContext.tsx
│   │   ├── patients/                # Patient management
│   │   │   ├── PatientDetail.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   └── PatientManagement.tsx
│   │   ├── roster/                  # Roster management
│   │   │   ├── DaySchedule.tsx
│   │   │   └── ...
│   │   ├── staffdirectory/          # Staff directory
│   │   │   └── ...
│   │   ├── Task/                    # Task management
│   │   │   └── ...
│   │   ├── ui/                      # Reusable UI components
│   │   └── WardCoor/                # Ward coordinator components
│   ├── utils/
│   │   └── api.ts                   # API client configuration
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles
├── public/
│   ├── index.html
│   ├── manifest.json                # PWA manifest
│   └── robots.txt                   # SEO robots file
├── package.json
├── tsconfig.json                    # TypeScript config
├── tsconfig.app.json                # App-specific TypeScript config
├── tsconfig.node.json               # Node-specific TypeScript config
├── vite.config.ts                   # Vite configuration
├── eslint.config.js                 # ESLint configuration
├── vercel.json                      # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- A running WardLog backend server

### 1. Clone and Install Dependencies

```bash
cd wardlog-frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or update `.env.local`):

```env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

For production:

```env
VITE_API_URL=https://wardlog-backend.onrender.com
VITE_API_TIMEOUT=10000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will typically be available at:

```
http://localhost:5173
```

The dev server provides hot module replacement (HMR) for instant updates during development.

### 4. Build for Production

```bash
npm run build
```

Builds TypeScript and creates an optimized production bundle in the `dist/` directory.

## 📜 Available Scripts

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start Vite development server with HMR      |
| `npm run build`   | Compile TypeScript and build for production |
| `npm run lint`    | Run ESLint to check code quality            |
| `npm run preview` | Preview the production build locally        |

## 🗺️ Application Routes

### Public Routes

- `/` or `/login` — Login page for staff authentication

### Doctor Routes

- `/doctor/dashboard` — Doctor's main dashboard with ward overview
- `/doctor/patients` — Patient management interface
- `/doctor/clinical` — Clinical documentation workspace
- `/doctor/tasks` — Task management
- `/doctor/roster` — Roster/schedule view
- `/doctor/notices` — Notice board
- `/doctor/notifications` — Notification panel

### Nurse Routes

- `/nurse/dashboard` — Nurse's main dashboard
- `/nurse/patients` — Patient care interface
- `/nurse/tasks` — Task assignments
- `/nurse/roster` — Schedule management
- `/nurse/clinical` — Clinical documentation
- `/nurse/notifications` — Notification panel

### Admin Routes

- `/admin/dashboard` — Admin control panel
- `/admin/staff` — Staff directory management
- `/admin/patients` — Patient records management
- `/admin/roster` — Roster administration
- `/admin/noticeboard` — Notice board management
- `/admin/settings` — System settings

## 🔐 Authentication

The frontend implements JWT-based authentication:

1. **Login Flow**
   - User enters credentials on `/login`
   - Credentials sent to backend `/api/auth/login`
   - Backend returns JWT token
   - Token stored in localStorage
   - User redirected to role-based dashboard

2. **Protected Routes**
   - Routes protected with `ProtectedRoute` component
   - Token included in `Authorization: Bearer <token>` header for API calls
   - Invalid/expired token redirects to login

3. **Token Storage**
   - JWT stored in browser localStorage
   - Persists across sessions
   - Cleared on logout

## 🎨 UI Components

### Layout Components

- **Navbar** — Top navigation with user menu
- **Sidebar** — Role-specific navigation menu
- **AdminLayout** — Admin dashboard layout wrapper
- **DoctorLayout** — Doctor dashboard layout wrapper

### Feature Components

- **PatientManagement** — Patient CRUD interface
- **ClinicalDocumentation** — Clinical notes, E-rounds, lab orders
- **TaskPanel** — Task creation and assignment
- **NotificationPanel** — User notifications display
- **Noticeboard** — Hospital announcements

### Reusable UI Components (ui/)

- Buttons, Cards, Modals, Forms, Tables
- Input fields with validation
- Loading spinners and error states

## 📡 API Integration

### API Client Setup

The `utils/api.ts` file configures Axios with:

- Base URL from environment variables
- Request/response interceptors
- Error handling
- JWT token injection

### API Endpoints Used

**Authentication**

- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration
- `POST /api/auth/logout` — User logout

**Patients**

- `GET /api/patients` — List patients
- `GET /api/patients/:id` — Get patient details
- `POST /api/patients` — Create patient
- `PUT /api/patients/:id` — Update patient

**Clinical**

- `GET /api/clinical/notes` — Get clinical notes
- `POST /api/clinical/notes` — Create note
- `GET /api/clinical/erounds` — Get E-rounds
- `POST /api/clinical/erounds` — Create E-round

**Tasks**

- `GET /api/tasks` — List tasks
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task

**And more...** See backend README for complete API documentation.

## 🎯 Key Features Explained

### Role-Based Access

- **Doctor Dashboard** — Ward overview, patient summaries, clinical tasks
- **Nurse Dashboard** — Patient care, task assignments, shifts
- **Admin Dashboard** — System management, user administration, settings

### Notifications

- Real-time notification panel
- Context API for state management
- Dismissible notifications with icons

### Patient Records

- Comprehensive patient information display
- Clinical history and notes
- Lab orders and E-rounds
- Editable patient forms

### Task Management

- Create tasks with priority levels
- Assign to specific staff
- Track completion status
- Filter and sort tasks

## 🧪 Development Tips

### Component Development

- Use TypeScript for type safety
- Follow React 19 patterns (hooks)
- Create reusable, composable components
- Keep components focused on single responsibility

### Styling

- Use Tailwind CSS utilities
- Follow utility-first CSS principles
- Create custom components with @apply
- Maintain consistent spacing and colors

### Debugging

- Use React Developer Tools browser extension
- Check network tab for API calls
- View localStorage for token issues
- Use console for component state inspection

## 🔧 Configuration Files

### vite.config.ts

- Vite build configuration
- React plugin integration
- Development server settings

### tsconfig.json

- TypeScript compiler options
- Module resolution settings
- JSX configuration

### eslint.config.js

- Code quality rules
- React-specific linting
- ESLint plugin configuration

## 📦 Dependencies Overview

| Package            | Purpose         |
| ------------------ | --------------- |
| `react`            | UI library      |
| `react-dom`        | React rendering |
| `react-router-dom` | Routing         |
| `tailwindcss`      | Styling         |
| `react-icons`      | Icon library    |
| `vite`             | Build tool      |
| `typescript`       | Type checking   |

## 🚀 Deployment

### Vercel Deployment (Current)

The frontend is deployed on Vercel at: `https://wardlog-frontend.vercel.app`

**Deployment steps:**

1. Push changes to main branch
2. Vercel automatically builds and deploys
3. Environment variables set in Vercel dashboard
4. Update `VITE_API_URL` for production backend

**Vercel Config** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Local Production Preview

```bash
npm run build
npm run preview
```

## 🐛 Troubleshooting

| Issue                  | Solution                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| API connection errors  | Check `VITE_API_URL` environment variable and backend server status |
| Login not working      | Verify backend is running and CORS is configured correctly          |
| Styling not appearing  | Clear browser cache, restart dev server                             |
| TypeScript errors      | Run `npm run build` to check compilation errors                     |
| Hot reload not working | Check Vite dev server is running and browser supports WebSocket     |

## 📝 Environment Variables Reference

| Variable           | Purpose                  | Example                 |
| ------------------ | ------------------------ | ----------------------- |
| `VITE_API_URL`     | Backend API base URL     | `http://localhost:5000` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000`                 |

## 📄 License

This project is for educational/internal hospital management use.

## 🤝 Contributing

When contributing:

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Keep components small and reusable
4. Write meaningful commit messages
5. Test locally before pushing
6. Update README with new routes/features

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com)

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the backend README for API details
3. Contact the development team
