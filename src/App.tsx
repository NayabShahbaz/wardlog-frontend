import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DoctorDashboard from "./components/dashboard/DoctorsDashboard";
import PatientManagement from "./components/patients/PatientManagement";
import PatientDetail from "./components/patients/PatientDetail";
import ClinicalDocumentation from "./components/clinical/ClinicalDocumentation";
import PageLayout from "./components/layout/PageLayout";
import WardDash from "./components/WardCoor/WardDash";
import Noticeboard from "./components/Noticeboard/Noticeboard";
import TaskPage from "./components/Task/TaskPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Doctor Routes - NESTED inside PageLayout */}
        <Route path="/doctor" element={<PageLayout />}>
          {/* Index route: redirects /doctor to /doctor/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Child routes: these will render inside the PageLayout's <Outlet /> */}
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:mrn" element={<PatientDetail />} />
          <Route path="clinical-docs" element={<ClinicalDocumentation />} />
          <Route path="ward-dashboard" element={<WardDash />} />
          <Route path="noticeboard" element={<Noticeboard />} />
          <Route path="tasks" element={<TaskPage />} />
        </Route>

        {/* Catch-all: redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
