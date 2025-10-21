// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
// import Container from 'react-bootstrap/Container'; // <-- এটি আর প্রয়োজন নেই
import './Login.css'; // ✅ নতুন CSS ফাইল যুক্ত করো

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/login', { email, password });
      login(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  return (
    // শুধুমাত্র .login-page wrapper-টিই যথেষ্ট
    <div className="login-page">
      {/* অতিরিক্ত .login-center-container এবং <Container> বাদ দেওয়া হয়েছে।
        .login-page এখন সরাসরি কার্ডটিকে center করবে।
      */}
      <Card className="login-card shadow-lg border-0 p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary mb-2">লগইন করুন</h3>
            <p className="text-muted">আপনার অ্যাডমিন অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 text-center">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="fw-semibold">ইমেইল অ্যাড্রেস</Form.Label>
              <Form.Control
                type="email"
                placeholder="ইমেইল লিখুন"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label className="fw-semibold">পাসওয়ার্ড</Form.Label>
              <Form.Control
                type="password"
                placeholder="পাসওয়ার্ড লিখুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="py-2"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-semibold py-2"
              disabled={loading}
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;