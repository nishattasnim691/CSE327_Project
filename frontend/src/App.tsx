import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import KioskHome from "./pages/KioskHome";
import DoctorHome from "./pages/DoctorHome";
import SymptomsPage from "./pages/SymptomsPage";
import ConsultationPage from "./pages/ConsultationPage";
import PrescriptionPage from "./pages/PrescriptionPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DispatcherDashboard from "./pages/DispatcherDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/kiosk" element={<KioskHome />} />
        <Route path="/kiosk/symptoms" element={<SymptomsPage />} />
        <Route path="/kiosk/consultation" element={<ConsultationPage />} />
        <Route path="/kiosk/prescription" element={<PrescriptionPage />} />
        <Route path="/kiosk/checkout" element={<CheckoutPage />} />
        <Route path="/kiosk/orders" element={<OrderTrackingPage />} />
        <Route path="/kiosk/dashboard" element={<PatientDashboardPage />} />

        <Route path="/doctor" element={<DoctorHome />} />

        <Route
          path="/dispatcher"
          element={<DispatcherDashboard />}
        />
        <Route
          path="*"
          element={
            <main>
              <h1>404</h1>
              <p>Page not found.</p>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;