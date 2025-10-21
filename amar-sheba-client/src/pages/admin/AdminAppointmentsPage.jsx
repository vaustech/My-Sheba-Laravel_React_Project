// src/pages/admin/AdminAppointmentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios'; // Adjust path if needed
import { Table, Pagination, Form, Row, Col, Spinner, Alert, Button, Badge, Dropdown } from 'react-bootstrap'; // Dropdown যোগ করুন
import { Link } from 'react-router-dom'; // Optional: for linking to user/service details

// Helper function to get status badge variant
const getStatusVariant = (status) => {
    switch (status) {
        case 'confirmed': return 'success';
        case 'completed': return 'secondary';
        case 'cancelled': return 'danger';
        case 'pending':
        default: return 'warning';
    }
};

const AdminAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({ status: '', date: '', userId: '', serviceId: '' });
    // ইউজার ও সার্ভিস তালিকা লোড করার স্টেট ( আপাতত খালি রাখছি )
    // const [users, setUsers] = useState([]);
    // const [services, setServices] = useState([]);

    // Fetch Appointments
    const fetchAppointments = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page });
            if (currentFilters.status) params.append('status', currentFilters.status);
            if (currentFilters.date) params.append('date', currentFilters.date);
            // Add userId and serviceId filters if available
            // if (currentFilters.userId) params.append('user_id', currentFilters.userId);
            // if (currentFilters.serviceId) params.append('service_id', currentFilters.serviceId);

            const response = await apiClient.get(`/admin/appointments?${params.toString()}`);
            setAppointments(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
                perPage: response.data.per_page,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
            setError(err.response?.data?.error || "অ্যাপয়েন্টমেন্টগুলো লোড করা যায়নি।");
        } finally {
            setLoading(false);
        }
    }, [filters]); // Refetch when filters change (directly or via applyFilters)

    // Fetch initial data
    useEffect(() => {
        fetchAppointments(1, filters);
        // Fetch users and services for filters if needed
        // fetchUsersForFilter();
        // fetchServicesForFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAppointments]); // Run when fetchAppointments changes

    // Handle filter input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters (fetch page 1 with new filters)
    const applyFilters = () => {
        fetchAppointments(1, filters);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination?.lastPage) {
            fetchAppointments(newPage, filters);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        // Find the appointment to show temporary loading/disabling
        const _targetAppointmentIndex = appointments.findIndex(app => app.id === appointmentId);

        // Optional: Add a temporary loading state to the specific row/button
        // setLoadingStatusUpdate({ ...loadingStatusUpdate, [appointmentId]: true });

        setError(''); // Clear previous errors specific to status update if needed

        try {
            await apiClient.patch(`/admin/appointments/${appointmentId}/status`, { status: newStatus });
            // Update the status in the local state for immediate feedback
            setAppointments(prev =>
                prev.map(app =>
                    app.id === appointmentId ? { ...app, status: newStatus } : app
                )
            );
            // Optionally show a success message
        } catch (err) {
            console.error("Failed to update appointment status:", err);
            setError(err.response?.data?.error || `অ্যাপয়েন্টমেন্ট #${appointmentId} স্ট্যাটাস আপডেট করা যায়নি।`);
        } finally {
            // Optional: Remove temporary loading state
            // setLoadingStatusUpdate({ ...loadingStatusUpdate, [appointmentId]: false });
        }
    };


    // Generate Pagination Items
    const paginationItems = [];
    if (pagination) {
        // Logic to show limited page numbers (e.g., first, last, current +/- 2)
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.lastPage, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }

        if (startPage > 1) {
            paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }
        for (let number = startPage; number <= endPage; number++) {
            paginationItems.push(
                <Pagination.Item key={number} active={number === pagination.currentPage} onClick={() => handlePageChange(number)} disabled={loading}>
                    {number}
                </Pagination.Item>,
            );
        }
         if (endPage < pagination.lastPage) {
            paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
         }
    }

    return (
        <div className="widget admin-appointments-page">
            <h3>🗓️ অ্যাপয়েন্টমেন্ট ব্যবস্থাপনা</h3>

            {/* --- Filter Section --- */}
            <Form className="mb-3 p-3 border rounded" style={{ backgroundColor: 'var(--color-widget-bg)' }}>
                <Row className="g-2 align-items-end">
                    <Col md={3}>
                        <Form.Group controlId="filterStatus">
                            <Form.Label>স্ট্যাটাস</Form.Label>
                            <Form.Select name="status" value={filters.status} onChange={handleFilterChange} disabled={loading}>
                                <option value="">-- সব --</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="filterDate">
                            <Form.Label>তারিখ</Form.Label>
                            <Form.Control type="date" name="date" value={filters.date} onChange={handleFilterChange} disabled={loading} />
                        </Form.Group>
                    </Col>
                    {/* Add User and Service filters here if needed */}
                    <Col md="auto">
                        <Button variant="primary" onClick={applyFilters} disabled={loading}>
                            {loading ? <Spinner as="span" size="sm" /> : '🔍 ফিল্টার'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* --- Appointments Table --- */}
            {loading && !appointments.length ? (
                <div className="text-center"><Spinner animation="border" /> <p>লোড হচ্ছে...</p></div>
            ) : appointments.length > 0 ? (
                <>
                    <Table striped bordered hover responsive size="sm" variant={document.documentElement.getAttribute('data-bs-theme') || 'light'}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ব্যবহারকারী</th>
                                <th>সেবা</th>
                                <th>সময়</th>
                                <th>স্ট্যাটাস</th>
                                <th>অ্যাকশন (স্ট্যাটাস)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((app, index) => (
                                <tr key={app.id}>
                                    <td>{pagination.from + index}</td>
                                    <td>{app.user?.name || 'N/A'}</td>
                                    <td>{app.service?.name || 'N/A'}</td>
                                    <td>{new Date(app.appointment_time).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                    <td>
                                        <Badge bg={getStatusVariant(app.status)} pill>
                                            {app.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {/* Status Update Dropdown */}
                                        <Dropdown size="sm">
                                            <Dropdown.Toggle variant="outline-secondary" id={`dropdown-status-${app.id}`} disabled={loading}>
                                                পরিবর্তন
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {['pending', 'confirmed', 'completed', 'cancelled']
                                                    .filter(status => status !== app.status) // Show only other statuses
                                                    .map(status => (
                                                        <Dropdown.Item
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(app.id, status)}
                                                        >
                                                            Mark as {status}
                                                        </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* --- Pagination --- */}
                    {pagination && pagination.lastPage > 1 && (
                         <div className="d-flex justify-content-center">
                             <Pagination size="sm">
                                 <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1 || loading} />
                                 <Pagination.Prev onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1 || loading} />
                                 {paginationItems}
                                 <Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage || loading} />
                                 <Pagination.Last onClick={() => handlePageChange(pagination.lastPage)} disabled={pagination.currentPage === pagination.lastPage || loading} />
                             </Pagination>
                         </div>
                    )}
                     {pagination && <div className="text-center text-muted mt-2"><small>{pagination.from}-{pagination.to} of {pagination.total} অ্যাপয়েন্টমেন্ট</small></div>}

                </>
            ) : (
                <Alert variant="info">কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।</Alert>
            )}
        </div>
    );
};

export default AdminAppointmentsPage;