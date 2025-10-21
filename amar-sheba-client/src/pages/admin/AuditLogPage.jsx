// src/pages/admin/AuditLogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios'; // Adjust path if needed
import { Table, Pagination, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({ userId: '', actionType: '' });
    const [users, setUsers] = useState([]); // User list for filter dropdown

    // Fetch Audit Logs
    const fetchLogs = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page });
            if (currentFilters.userId) params.append('user_id', currentFilters.userId);
            if (currentFilters.actionType) params.append('action_type', currentFilters.actionType);

            const response = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
            setLogs(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
                perPage: response.data.per_page,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
            setError(err.response?.data?.error || "অডিট লগ লোড করা যায়নি।");
        } finally {
            setLoading(false);
        }
    }, [filters]); // Refetch when filters change

     // Fetch users for the filter dropdown (only once)
     const fetchUsersForFilter = async () => {
         try {
             // We need an endpoint to get all users (or just relevant ones)
             // Let's assume the existing admin/users endpoint can be used without pagination for this
             // Or create a dedicated endpoint: GET /api/admin/users/all
             // For now, let's reuse the paginated one and fetch the first page only as an example
             const response = await apiClient.get('/admin/users?page=1&per_page=100'); // Fetch up to 100 users
             setUsers(response.data.data || []);
         } catch (err) {
             console.warn("Could not load users for filter:", err);
             // Handle error - maybe show a message or disable the filter
         }
     };

    useEffect(() => {
        fetchLogs(1, filters); // Fetch initial logs
        fetchUsersForFilter(); // Fetch users for dropdown
    }, [fetchLogs]);
 // Run when fetchLogs (due to filters changing) runs

    // Handle filter input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters (fetch page 1 with new filters)
    const applyFilters = () => {
        fetchLogs(1, filters);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination?.lastPage) {
            fetchLogs(newPage, filters);
        }
    };

    // Generate Pagination Items
    const paginationItems = [];
    if (pagination) {
        for (let number = 1; number <= pagination.lastPage; number++) {
            paginationItems.push(
                <Pagination.Item key={number} active={number === pagination.currentPage} onClick={() => handlePageChange(number)} disabled={loading}>
                    {number}
                </Pagination.Item>,
            );
        }
    }

    return (
        <div className="widget audit-log-page w-100 ">
            <h3>📜 অডিট লগ</h3>

            {/* --- Filter Section --- */}
            <Form className="mb-3 p-3 border rounded" style={{ backgroundColor: 'var(--color-widget-bg)' }}>
                <Row className="g-2 align-items-end">
                    <Col md={4}>
                        <Form.Group controlId="filterUser">
                            <Form.Label>ব্যবহারকারী</Form.Label>
                            <Form.Select
                                name="userId"
                                value={filters.userId}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                <option value="">-- সকল ব্যবহারকারী --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="filterAction">
                            <Form.Label>কাজের ধরন</Form.Label>
                            <Form.Control
                                type="text"
                                name="actionType"
                                placeholder="যেমন: DOCUMENT_UPLOADED"
                                value={filters.actionType}
                                onChange={handleFilterChange}
                                disabled={loading}
                            />
                        </Form.Group>
                    </Col>
                    <Col md="auto">
                        <Button variant="primary" onClick={applyFilters} disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'ফিল্টার'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* --- Log Table --- */}
            {loading && !logs.length ? ( // Initial loading
                <div className="text-center"><Spinner animation="border" /> <p>লোড হচ্ছে...</p></div>
            ) : logs.length > 0 ? (
                <>
                    <Table striped bordered hover responsive size="sm" variant={document.documentElement.getAttribute('data-bs-theme') || 'light'}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>সময়</th>
                                <th>ব্যবহারকারী</th>
                                <th>কাজের ধরন</th>
                                <th>বিবরণ</th>
                                <th>IP অ্যাড্রেস</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={log.id}>
                                    <td>{pagination.from + index}</td>
                                    <td>{new Date(log.created_at).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'medium' })}</td>
                                    <td>{log.user ? `${log.user.name} (ID: ${log.user.id})` : 'N/A'}</td>
                                    <td>{log.action_type}</td>
                                    <td>{log.description}</td>
                                    <td>{log.ip_address}</td>
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
                                 {/* We might need more sophisticated pagination rendering for many pages */}
                                 {paginationItems}
                                 <Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage || loading} />
                                 <Pagination.Last onClick={() => handlePageChange(pagination.lastPage)} disabled={pagination.currentPage === pagination.lastPage || loading} />
                             </Pagination>
                         </div>
                    )}
                </>
            ) : (
                <Alert variant="info">কোনো অডিট লগ পাওয়া যায়নি।</Alert>
            )}
        </div>
    );
};

export default AuditLogPage;