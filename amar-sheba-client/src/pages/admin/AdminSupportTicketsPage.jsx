import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { Link } from 'react-router-dom';
import {
  Card,
  Table,
  Spinner,
  Alert,
  Container,
  Badge,
  Form,
  Pagination,
  Button,
} from 'react-bootstrap';

const AdminSupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTickets = async (status = '', page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);
      const response = await apiClient.get(`/admin/support-tickets?${params.toString()}`);
      setTickets(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.response?.data?.error || 'সাপোর্ট টিকেটগুলো লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setFilterStatus(newStatus);
    fetchTickets(newStatus, 1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination?.lastPage) {
      fetchTickets(filterStatus, page);
    }
  };

  const getStatusBadge = (status) => {
    const variants = { open: 'warning', replied: 'success', closed: 'secondary' };
    const textMap = { open: 'Open', replied: 'Replied', closed: 'Closed' };
    return <Badge bg={variants[status] || 'info'}>{textMap[status] || status}</Badge>;
  };

  return (
   <Container fluid className="my-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">🎫 সাপোর্ট টিকেট ব্যবস্থাপনা</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3 d-flex align-items-center gap-2">
            <Form.Label>স্ট্যাটাস ফিল্টার:</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={handleFilterChange}
              disabled={loading}
              style={{ maxWidth: '250px' }}
            >
              <option value="">-- সব স্ট্যাটাস --</option>
              <option value="open">Open</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </Form.Select>
          </Form.Group>

          {loading && (
            <div className="text-center">
              <Spinner animation="border" />
              <p>টিকেট লোড হচ্ছে...</p>
            </div>
          )}

          {!loading && tickets.length === 0 && !error && (
            <Alert variant="info" className="text-center">
              কোনো টিকেট পাওয়া যায়নি।
            </Alert>
          )}

          {!loading && tickets.length > 0 && (
            <>
              <Table striped bordered hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>বিষয়</th>
                    <th>ব্যবহারকারী</th>
                    <th>স্ট্যাটাস</th>
                    <th>শেষ আপডেট</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.subject}</td>
                      <td>{t.user?.name || 'N/A'}</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td>{new Date(t.updated_at).toLocaleString('bn-BD')}</td>
                      <td>
                        <Link to={`/admin/support-tickets/${t.id}`}>
                          <Button size="sm" variant="outline-primary">
                            বিস্তারিত
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {pagination?.lastPage > 1 && (
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.Prev
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    />
                    <Pagination.Item active>
                      {pagination.currentPage} / {pagination.lastPage}
                    </Pagination.Item>
                    <Pagination.Next
                      disabled={pagination.currentPage === pagination.lastPage}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSupportTicketsPage;
