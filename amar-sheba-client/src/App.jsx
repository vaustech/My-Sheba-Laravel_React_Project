// src/App.jsx

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
    // eslint-disable-next-line no-unused-vars
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <AuthContext.Provider value={authContextValue}>
            <Routes>
                {/* Public Route */}
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to="/" replace />}
                />

                {/* Normal User Routes */}
                <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/support" element={<SupportPage />} />
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
                    <Route path="audit-logs" element={<AuditLogPage />} /> {/* ✅ ADMIN রুট */}
                  <Route path="appointments" element={<AdminAppointmentsPage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
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
