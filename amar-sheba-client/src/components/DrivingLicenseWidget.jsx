import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import "./../styles/WidgetCard.css"; 
const getStatusVariant = (status) => {
  switch (status) {
    case 'Expired':
      return 'danger';
    case 'Active':
      return 'success';
    case 'Pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

const DrivingLicenseWidget = ({ licenses }) => {
  if (!licenses || licenses.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>🚗 ড্রাইভিং লাইসেন্স</Card.Title>
          <p className="text-muted">কোনো লাইসেন্স রেকর্ড পাওয়া যায়নি।</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">🚗 ড্রাইভিং লাইসেন্স</Card.Title>
        <ListGroup variant="flush">
          {licenses.map((license) => (
            <ListGroup.Item key={license.id}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>নম্বর:</strong> {license.license_number}
                <Badge bg={getStatusVariant(license.status)}>
                  {license.status || 'Unknown'}
                </Badge>
              </div>
              <div>
                <small>
                  <strong>শ্রেণী:</strong> {license.vehicle_class || 'N/A'}
                </small>
              </div>
              <div>
                <small>
                  <strong>মেয়াদ শেষ:</strong>{' '}
                  {license.expiry_date
                    ? new Date(license.expiry_date).toLocaleDateString('bn-BD')
                    : 'N/A'}
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default DrivingLicenseWidget;
