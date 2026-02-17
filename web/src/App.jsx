import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import AIEstimate from './pages/AIEstimate';
import RepairHistory from './pages/RepairHistory';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianProfile from './pages/TechnicianProfile';
import TechnicianRegister from './pages/TechnicianRegister';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import WriteReview from './pages/WriteReview';
import OAuthCallback from './pages/OAuthCallback';
import TermsOfService from './pages/TermsOfService';
import MatchingStatus from './pages/MatchingStatus';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />
                <Route path="/estimate" element={<AIEstimate />} />
                <Route path="/history" element={<RepairHistory />} />
                <Route path="/technician" element={<TechnicianDashboard />} />
                <Route path="/technician/:id" element={<TechnicianProfile />} />
                <Route path="/technician-register" element={<TechnicianRegister />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/review/write" element={<WriteReview />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/matching-status" element={<MatchingStatus />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
