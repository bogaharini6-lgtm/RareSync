import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CollaborationRoom from './pages/CollaborationRoom';
import SpecialistRequestsPage from './pages/SpecialistRequestsPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import DiseasesPage from './pages/DiseasesPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';
import DoctorsPage from './pages/DoctorsPage';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doctor/dashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
      <Route path="/hospital/dashboard" element={<PrivateRoute><HospitalDashboard /></PrivateRoute>} />
      <Route path="/patients" element={<PrivateRoute><PatientsPage /></PrivateRoute>} />
      <Route path="/patients/:id" element={<PrivateRoute><PatientDetailPage /></PrivateRoute>} />
      <Route path="/diseases" element={<PrivateRoute><DiseasesPage /></PrivateRoute>} />
      <Route path="/access-requests" element={<PrivateRoute><AccessRequestsPage /></PrivateRoute>} />
      <Route path="/audit-logs" element={<PrivateRoute><AuditLogsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/doctors" element={<PrivateRoute><DoctorsPage /></PrivateRoute>} />
      <Route path="/collaboration/:patient_id" element={<PrivateRoute><CollaborationRoom /></PrivateRoute>} />
<Route path="/specialist-requests" element={<PrivateRoute><SpecialistRequestsPage /></PrivateRoute>} />
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;