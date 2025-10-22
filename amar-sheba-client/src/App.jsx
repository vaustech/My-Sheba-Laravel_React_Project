import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import apiClient from './api/axios';
import UserListPage from './pages/admin/UserListPage';
import SupportPage from './pages/SupportPage';
import AdminSupportTicketsPage from './pages/admin/AdminSupportTicketsPage';
import AdminTicketDetailPage from './pages/admin/AdminTicketDetailPage';
import { useAuth, AuthContext } from './context/AuthContext';
import AdminLayout from './components/layouts/AdminLayout';
import AuditLogPage from './pages/admin/AuditLogPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import { Navbar, Nav } from 'react-bootstrap';

// =========Style Imports=========
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/WidgetCard.css";
import "./styles/Dashboard.css";
import "./styles/Navbar.css";
import "./styles/Sidebar.css";
// ===============================

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <Container className="mt-5 text-center">
        <div>Checking authentication...</div>
      </Container>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children ? children : <Outlet />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    token: localStorage.getItem('accessToken') || null,
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const fetchUser = useCallback(async () => {
    if (!authState.token) {
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
      return;
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    try {
      const response = await apiClient.get('/me');
      setAuthState(prev => ({
        ...prev,
        user: response.data,
        loading: false,
      }));
    } catch {
      console.log('❌ Token invalid or expired.');
      localStorage.removeItem('accessToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setAuthState({ user: null, loading: false, token: null });
    }
  }, [authState.token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLoginSuccess = (data) => {
    const token = data.access_token;
    const userData = data.user;
    localStorage.setItem('accessToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuthState({ user: userData, loading: false, token });

    if (userData.role === 'admin') navigate('/admin/users');
    else navigate('/');
  };

  const handleLogout = async () => {
    if (!authState.token) return;
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('accessToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuthState({ user: null, loading: false, token: null });
    navigate('/login');
  };

  const authContextValue = {
    user: authState.user,
    loading: authState.loading,
    login: handleLoginSuccess,
    logout: handleLogout,
    theme,
    toggleTheme,
  };

  if (authState.loading)
    return (
      <Container className="mt-5 text-center">
        <div>অ্যাপ লোড হচ্ছে...</div>
      </Container>
    );

  const user = authState.user;

  // ✅ Navbar hide on login page
  if (location.pathname === "/login") {
    return (
      <AuthContext.Provider value={authContextValue}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">

        <Container>
          <Navbar.Brand as={Link} to="/">আমার সেবা</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">ড্যাশবোর্ড</Nav.Link>
              <Nav.Link as={Link} to="/support">সাপোর্ট</Nav.Link>
              <Nav.Link as={Link} to="/book-appointment">অ্যাপয়েন্টমেন্ট বুকিং</Nav.Link>
              {/* {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin">অ্যাডমিন প্যানেল</Nav.Link>
              )} */}
            </Nav>
            <Nav>
              {user ? (
                <Nav.Link onClick={handleLogout}>লগআউট</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/login">লগইন</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />

        {/* ইউজার রাউট */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/book-appointment" element={<Container className="mt-4"><AppointmentBookingPage /></Container>} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="support-tickets" element={<AdminSupportTicketsPage />} />
          <Route path="support-tickets/:ticketId" element={<AdminTicketDetailPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="slots" element={<AdminSlotsPage />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <Container className="text-center mt-5">
              <h2>404 - পেজটি খুঁজে পাওয়া যায়নি</h2>
              <Link to="/">হোমে ফিরে যান</Link>
            </Container>
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
