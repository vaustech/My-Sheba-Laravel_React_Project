import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import "./../styles/WidgetCard.css";

const ETinWidget = ({ eTin }) => {
  if (!eTin) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>💼 ই-টিন (e-TIN)</Card.Title>
          <p className="text-muted mb-0">ই-টিন তথ্য পাওয়া যায়নি।</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">💼 ই-টিন (e-TIN)</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>TIN নম্বর:</strong> {eTin.tin_number || 'N/A'}
          </ListGroup.Item>
          {eTin.registration_date && (
            <ListGroup.Item>
              <strong>রেজিস্ট্রেশনের তারিখ:</strong>{' '}
              {new Date(eTin.registration_date).toLocaleDateString('bn-BD')}
            </ListGroup.Item>
          )}
          {eTin.tax_circle && (
            <ListGroup.Item>
              <strong>ট্যাক্স সার্কেল:</strong> {eTin.tax_circle}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ETinWidget;
