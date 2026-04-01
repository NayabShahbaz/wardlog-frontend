import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DoctorDashboard from "./components/dashboard/DoctorsDashboard";
import PatientManagement from "./components/patients/PatientManagement";
import PatientDetail from "./components/patients/PatientDetail";
import ClinicalDocumentation from "./components/clinical/ClinicalDocumentation";
import DoctorLayout from "./components/layout/DoctorLayout";
import WardDash from "./components/WardCoor/WardDash";
import Noticeboard from "./components/Noticeboard/Noticeboard";
import TaskPage from "./components/Task/TaskPage";
import RosterManagement from "./components/roster/RosterManagement";
import StaffDirectory from "./components/staffdirectory/StaffDirectory";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminStaffDirectory from "./components/admin/AdminStaffDir";
import AdminPatients from "./components/admin/AdminPatients";
import AdminRoster from "./components/admin/AdminRoster";
import AdminNoticeboard from "./components/admin/AdminNoticeboard";
import AdminSettings from "./components/admin/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Doctor Routes - NESTED inside DoctorLayout */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:mrn" element={<PatientDetail />} />
          <Route path="clinical-docs" element={<ClinicalDocumentation />} />
          <Route path="ward-dashboard" element={<WardDash />} />
          <Route path="noticeboard" element={<Noticeboard />} />
          <Route path="tasks" element={<TaskPage />} />
          <Route path="roster" element={<RosterManagement />} />
          <Route path="staff-directory" element={<StaffDirectory />} />
        </Route>

        {/* Admin Routes - NESTED inside AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="roster" element={<AdminRoster />} />
          <Route path="staff-directory" element={<AdminStaffDirectory />} />
          <Route path="noticeboard" element={<AdminNoticeboard />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all: redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
