import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import {
  Card,
  Spinner,
  Alert,
  Button,
  Form,
  Badge,
  Container,
  ListGroup,
} from 'react-bootstrap';

const AdminTicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/admin/support-tickets/${ticketId}`);
      setTicket(res.data);
      setMessages(res.data.messages || []);
    } catch  {
      setError('টিকেট লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setIsReplying(true);
    try {
      const res = await apiClient.post(`/admin/support-tickets/${ticketId}/reply`, {
        message: replyMessage,
      });
      setMessages([...messages, res.data.reply]);
      setReplyMessage('');
    } catch {
      alert('রিপ্লাই পাঠানো যায়নি।');
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/admin/support-tickets/${ticketId}/status`, { status });
      alert('স্ট্যাটাস আপডেট হয়েছে।');
      if (status === 'closed') navigate('/admin/support-tickets');
      else fetchTicket();
    } catch {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Spinner animation="border" className="mt-5 d-block mx-auto" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
   <Container fluid className="my-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>🎫 টিকেট বিস্তারিত</Card.Title>
          {ticket ? (
            <>
              <p><strong>বিষয়:</strong> {ticket.subject}</p>
              <p><strong>ইউজার:</strong> {ticket.user?.name} ({ticket.user?.email})</p>
              <p>
                <strong>স্ট্যাটাস:</strong>{' '}
                <Badge bg={ticket.status === 'closed' ? 'secondary' : 'success'}>
                  {ticket.status}
                </Badge>
              </p>

              <h5 className="mt-4">📨 মেসেজসমূহ</h5>
              {messages.length > 0 ? (
                <ListGroup className="mb-3">
                  {messages.map((msg, i) => (
                    <ListGroup.Item key={i}>
                      <strong>{msg.sender_name}:</strong> {msg.body}
                      <br />
                      <small>{new Date(msg.created_at).toLocaleString('bn-BD')}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">কোনো মেসেজ নেই।</Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>রিপ্লাই লিখুন</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={isReplying}
                />
              </Form.Group>
              <Button onClick={handleReply} disabled={isReplying}>
                {isReplying ? 'পাঠানো হচ্ছে...' : 'রিপ্লাই পাঠান'}
              </Button>

              <div className="mt-4">
                <Button
                  variant="outline-success"
                  onClick={() => handleStatusChange('open')}
                  disabled={isUpdating}
                  className="me-2"
                >
                  Open করুন
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => handleStatusChange('closed')}
                  disabled={isUpdating}
                >
                  Close করুন
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="warning">টিকেট পাওয়া যায়নি।</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminTicketDetailPage;
