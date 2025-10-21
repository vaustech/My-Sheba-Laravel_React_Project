import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const getExpiryBadge = (expiryDate) => {
  if (!expiryDate) return <Badge bg="secondary">N/A</Badge>;

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return <Badge bg="danger">মেয়াদোত্তীর্ণ</Badge>;
  if (diffDays <= 30) return <Badge bg="warning">শীঘ্রই শেষ</Badge>;
  return <Badge bg="success">সক্রিয়</Badge>;
};

const VehicleFitnessWidget = ({ fitnesses = [] }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">🚘 যানবাহনের ফিটনেস তথ্য</Card.Title>

        {fitnesses.length === 0 ? (
          <p className="text-muted">কোনো ফিটনেস রেকর্ড নেই।</p>
        ) : (
          <ListGroup variant="flush">
            {fitnesses.map((item) => (
              <ListGroup.Item key={item.id}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>{item.vehicle_no}</strong>
                  {getExpiryBadge(item.expiry_date)}
                </div>
                <small>
                  মেয়াদ শেষ:{' '}
                  {item.expiry_date
                    ? new Date(item.expiry_date).toLocaleDateString('bn-BD')
                    : 'N/A'}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default VehicleFitnessWidget;
