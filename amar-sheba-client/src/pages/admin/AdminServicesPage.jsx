// src/pages/admin/AdminServicesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios';
import { Table, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import { PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🧩 Fetch all services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/services');
      setServices(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('সেবা তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // 🧩 Open & Close modal
  const handleShowModal = (service = null) => {
    setCurrentService(
      service
        ? { ...service }
        : { name: '', description: '', duration_minutes: 30, is_active: true }
    );
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentService(null);
    setIsSaving(false);
  };

  // 🧩 Form input handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentService((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🧩 Save (Create or Update)
  const handleSaveService = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const isUpdating = !!currentService?.id;
    const url = isUpdating
      ? `/admin/services/${currentService.id}`
      : '/admin/services';
    const method = isUpdating ? 'patch' : 'post';

    // 🟢 Send only clean data (no circular reference)
    const payload = {
      name: currentService.name,
      description: currentService.description,
      duration_minutes: Number(currentService.duration_minutes),
      is_active: !!currentService.is_active,
    };

    try {
      await apiClient[method](url, payload);
      handleCloseModal();
      fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
      setError(
        err.response?.data?.error ||
          `সেবা ${isUpdating ? 'আপডেট' : 'সংরক্ষণ'} করা সম্ভব হয়নি।`
      );
      setIsSaving(false);
    }
  };

  // 🧩 Delete service
  const handleDeleteService = async (serviceId, serviceName) => {
    if (
      window.confirm(
        `আপনি কি "${serviceName}" সেবাটি ডিলিট করতে চান? এর সাথে যুক্ত স্লট বা অ্যাপয়েন্টমেন্ট প্রভাবিত হতে পারে।`
      )
    ) {
      setLoading(true);
      setError('');
      try {
        await apiClient.delete(`/admin/services/${serviceId}`);
        fetchServices();
      } catch (err) {
        console.error('Failed to delete service:', err);
        setError(err.response?.data?.error || 'সেবাটি ডিলিট করা যায়নি।');
        setLoading(false);
      }
    }
  };

  return (
    <div className="widget admin-services-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">🛠️ সেবাসমূহ পরিচালনা</h3>
        <Button variant="primary" className="ms-2" onClick={handleShowModal}>
          <PlusCircle className="me-2" /> নতুন সেবা যোগ করুন
        </Button>
      </div>

      {/* Alerts */}
      {error && !showModal && <Alert variant="danger">{error}</Alert>}

      {/* Data Table */}
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      ) : services.length === 0 ? (
        <Alert variant="info">কোনো সেবা এখনো যোগ করা হয়নি।</Alert>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          size="sm"
          variant={document.documentElement.getAttribute('data-bs-theme') || 'light'}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>নাম</th>
              <th>ডিউরেশন (মিনিট)</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service.id}>
                <td>{index + 1}</td>
                <td>{service.name}</td>
                <td>{service.duration_minutes}</td>
                <td>
                  {service.is_active ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="secondary">Inactive</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(service)}
                    className="me-2"
                  >
                    <PencilSquare />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() =>
                      handleDeleteService(service.id, service.name)
                    }
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentService?.id ? 'সেবা এডিট করুন' : 'নতুন সেবা যোগ করুন'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveService}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="serviceName">
              <Form.Label>সেবার নাম</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentService?.name || ''}
                onChange={handleInputChange}
                required
                maxLength="255"
                disabled={isSaving}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceDescription">
              <Form.Label>বিবরণ (ঐচ্ছিক)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentService?.description || ''}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceDuration">
              <Form.Label>ডিউরেশন (মিনিট)</Form.Label>
              <Form.Control
                type="number"
                name="duration_minutes"
                value={currentService?.duration_minutes || ''}
                onChange={handleInputChange}
                required
                min="5"
                disabled={isSaving}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="serviceStatus"
              label="সক্রিয় (Active)"
              name="is_active"
              checked={currentService?.is_active || false}
              onChange={handleInputChange}
              disabled={isSaving}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSaving}>
              বাতিল
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? (
                <Spinner as="span" size="sm" />
              ) : currentService?.id ? (
                'আপডেট করুন'
              ) : (
                'সেভ করুন'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminServicesPage;
