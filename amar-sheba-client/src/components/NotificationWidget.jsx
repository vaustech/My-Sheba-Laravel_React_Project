import React, { useState } from 'react';
import apiClient from '../api/axios';
import { Card, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';

// 🔸 নোটিফিকেশনের টাইপ অনুযায়ী রঙ নির্ধারণ
const getVariant = (type) => {
  switch (type) {
    case 'error':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
};

const NotificationWidget = ({ notifications, onActionComplete }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [message, setMessage] = useState('');

  // 🔁 নবায়ন হ্যান্ডলার
  const handleRenew = async (notification) => {
    if (!notification.id || !notification.id.startsWith('dl_')) {
      setMessage('ত্রুটি: লাইসেন্স আইডি পাওয়া যায়নি।');
      return;
    }

    const licenseId = notification.id.split('_')[1];
    setLoadingStates((prev) => ({ ...prev, [notification.id]: true }));
    setMessage('');

    try {
      const response = await apiClient.post(`/driving-licenses/${licenseId}/renew`);
      setMessage(response.data.message || '✅ সফলভাবে নবায়ন হয়েছে।');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error('লাইসেন্স নবায়ন ব্যর্থ হয়েছে:', error);
      setMessage(error.response?.data?.error || 'লাইসেন্স নবায়ন করা যায়নি।');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [notification.id]: false }));
    }
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">🔔 সতর্কবার্তা ও করণীয়</Card.Title>
        {message && (
          <Alert variant="info" className="py-2 text-center">
            {message}
          </Alert>
        )}

        <ListGroup variant="flush">
          {notifications.map((notif) => (
            <ListGroup.Item
              key={notif.id}
              variant={getVariant(notif.type)}
              className="d-flex justify-content-between align-items-center"
            >
              <span>{notif.message}</span>
              {notif.id.startsWith('dl_') && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleRenew(notif)}
                  disabled={loadingStates[notif.id]}
                >
                  {loadingStates[notif.id] ? (
                    <>
                      <Spinner animation="border" size="sm" /> প্রসেসিং...
                    </>
                  ) : (
                    'নবায়ন করুন'
                  )}
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default NotificationWidget;
