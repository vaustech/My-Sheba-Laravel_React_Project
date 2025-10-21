import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const NidWidget = ({ nid }) => {
  if (!nid) return null;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">🆔 জাতীয় পরিচয়পত্র (NID)</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>নাম:</strong> {nid.full_name_bn || 'N/A'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>NID নম্বর:</strong> {nid.nid_number || 'N/A'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>জন্ম তারিখ:</strong>{' '}
            {nid.date_of_birth
              ? new Date(nid.date_of_birth).toLocaleDateString('bn-BD')
              : 'N/A'}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default NidWidget;
