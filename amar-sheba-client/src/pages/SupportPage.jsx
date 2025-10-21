import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from 'react-bootstrap';

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');

  useAuth();

  // --- টিকেট লোড করা ---
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/support-tickets');
      setTickets(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
      setError('⚠️ আপনার সাপোর্ট টিকেটগুলো লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // --- নতুন টিকেট সাবমিট ---
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/support-tickets', { subject, message, priority });
      setSubject('');
      setMessage('');
      setPriority('medium');
      setShowCreateForm(false);
      fetchTickets();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.message || '❌ টিকেট তৈরি করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'closed':
        return 'secondary';
      case 'replied':
        return 'success';
      case 'open':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Container className="my-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">💬 সাপোর্ট ও সাহায্য</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* নতুন টিকেট তৈরি */}
          {!showCreateForm ? (
            <div className="text-center mb-4">
              <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
                + নতুন টিকেট খুলুন
              </Button>
            </div>
          ) : (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Card.Title>📝 নতুন সাপোর্টের আবেদন</Card.Title>
                <Form onSubmit={handleCreateTicket}>
                  <Form.Group className="mb-3">
                    <Form.Label>বিষয়</Form.Label>
                    <Form.Control
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="বিষয় লিখুন"
                      required
                      maxLength="255"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>বিস্তারিত সমস্যা</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="আপনার সমস্যার বিবরণ দিন..."
                      required
                      minLength="10"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>গুরুত্ব</Form.Label>
                    <Form.Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={loading}
                    >
                      <option value="low">Low (কম)</option>
                      <option value="medium">Medium (মাঝারি)</option>
                      <option value="high">High (বেশি)</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" /> সাবমিট হচ্ছে...
                        </>
                      ) : (
                        'সাবমিট করুন'
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowCreateForm(false)}
                      disabled={loading}
                    >
                      বাতিল
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          <hr />

          {/* টিকেট তালিকা */}
          <h5 className="mb-3">📨 আপনার টিকেটসমূহ</h5>

          {loading && tickets.length === 0 && (
            <div className="text-center my-4">
              <Spinner animation="border" />
              <p className="mt-2">টিকেট লোড হচ্ছে...</p>
            </div>
          )}

          {!loading && tickets.length === 0 && (
            <Alert variant="info" className="text-center">
              আপনার কোনো সাপোর্ট টিকেট নেই।
            </Alert>
          )}

          {!loading && tickets.length > 0 && (
            <ListGroup variant="flush">
              {tickets.map((ticket) => (
                <ListGroup.Item
                  key={ticket.id}
                  className="mb-2 shadow-sm rounded border"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{ticket.subject}</strong>
                    <Badge bg={getStatusVariant(ticket.status)}>
                      {ticket.status === 'open'
                        ? 'Open'
                        : ticket.status === 'replied'
                        ? 'Replied'
                        : 'Closed'}
                    </Badge>
                  </div>

                  <small className="text-muted">
                    তৈরি হয়েছে:{' '}
                    {new Date(ticket.created_at).toLocaleString('bn-BD')}
                    {ticket.last_reply_at &&
                      ` | শেষ উত্তর: ${new Date(
                        ticket.last_reply_at
                      ).toLocaleString('bn-BD')}`}
                  </small>

                  {ticket.messages && ticket.messages.length > 0 && (
                    <p className="fst-italic mt-2 text-secondary">
                      "{ticket.messages[0].message.substring(0, 100)}
                      {ticket.messages[0].message.length > 100 ? '...' : ''}"
                    </p>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SupportPage;
