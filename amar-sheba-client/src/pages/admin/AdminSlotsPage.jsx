// src/pages/admin/AdminSlotsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios';
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, Pagination } from 'react-bootstrap';
import { PlusCircle, Trash } from 'react-bootstrap-icons';
import Datetime from 'react-datetime'; // Date and Time picker
import 'react-datetime/css/react-datetime.css'; // Datetime styles
import moment from 'moment'; // Moment.js for date manipulation

const AdminSlotsPage = () => {
    const [slots, setSlots] = useState([]);
    const [services, setServices] = useState([]); // For dropdowns
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newSlot, setNewSlot] = useState({ service_id: '', start_time: moment(), end_time: moment().add(30, 'minutes'), capacity: 1 });
    const [filters, setFilters] = useState({ service_id: '', date: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Services for dropdowns
    const fetchServices = useCallback(async () => {
        try {
            const response = await apiClient.get('/admin/services?per_page=1000'); // Get all active services potentially
            setServices(response.data.data || response.data);
        } catch (err) {
            console.error("Failed to fetch services for filter:", err);
            // setError("সেবা তালিকা লোড করা যায়নি।"); // Avoid overwriting main error
        }
    }, []);

    // Fetch Slots
    const fetchSlots = useCallback(async (page = 1, currentFilters = filters) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page });
            if (currentFilters.service_id) params.append('service_id', currentFilters.service_id);
            if (currentFilters.date) params.append('date', currentFilters.date);

            const response = await apiClient.get(`/admin/slots?${params.toString()}`);
            setSlots(response.data.data);
             setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
                perPage: response.data.per_page,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (err) {
            console.error("Failed to fetch slots:", err);
            setError("স্লট তালিকা লোড করা যায়নি।");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
        fetchSlots(1, filters);
    }, [fetchServices, fetchSlots]);

    // Modal Handling
    const handleShowModal = () => {
        setNewSlot({ service_id: services[0]?.id || '', start_time: moment().add(1, 'hour').startOf('hour'), end_time: moment().add(1, 'hour').startOf('hour').add(30, 'minutes'), capacity: 1 });
        setShowModal(true);
        setError('');
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setIsSaving(false);
    };

    // Form Input Change (Modal)
    const handleSlotInputChange = (e) => {
        const { name, value } = e.target;
        setNewSlot(prev => ({ ...prev, [name]: value }));
    };
    const handleStartTimeChange = (momentDate) => {
         // Get duration from selected service
        const selectedService = services.find(s => s.id == newSlot.service_id);
        const duration = selectedService?.duration_minutes || 30;
        setNewSlot(prev => ({
            ...prev,
            start_time: momentDate,
            // Automatically set end time based on duration
            end_time: moment(momentDate).add(duration, 'minutes')
        }));
    };
     const handleEndTimeChange = (momentDate) => {
        setNewSlot(prev => ({ ...prev, end_time: momentDate }));
    };


    // Save New Slot
    const handleSaveSlot = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        // Format dates for API (YYYY-MM-DD HH:MM:SS)
        const dataToSend = {
            ...newSlot,
            start_time: moment(newSlot.start_time).format('YYYY-MM-DD HH:mm:ss'),
            end_time: moment(newSlot.end_time).format('YYYY-MM-DD HH:mm:ss'),
        };

        try {
            await apiClient.post('/admin/slots', dataToSend);
            handleCloseModal();
            fetchSlots(pagination?.currentPage || 1, filters); // Refresh list
        } catch (err) {
            console.error("Failed to save slot:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "স্লট তৈরি করা যায়নি।");
            setIsSaving(false); // Keep modal open
        }
    };

    // Delete Slot
    const handleDeleteSlot = async (slotId) => {
        if (window.confirm(`আপনি কি এই স্লটটি ডিলিট করতে চান? বুক করা অ্যাপয়েন্টমেন্ট থাকলে সমস্যা হতে পারে।`)) {
            setLoading(true);
            setError('');
            try {
                await apiClient.delete(`/admin/slots/${slotId}`);
                fetchSlots(pagination?.currentPage || 1, filters); // Refresh list
            } catch (err) {
                console.error("Failed to delete slot:", err);
                setError(err.response?.data?.error || "স্লটটি ডিলিট করা যায়নি।");
                setLoading(false); // Stop loading on error
            }
        }
    };

     // Filter Handling
     const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
     };
     const applyFilters = () => fetchSlots(1, filters);

     // Pagination Handling
     // eslint-disable-next-line no-unused-vars
     const handlePageChange = (newPage) => {
         if (newPage >= 1 && newPage <= pagination?.lastPage) {
             fetchSlots(newPage, filters);
         }
     };
     // Generate Pagination Items (same as Audit Log)
     // ... paginationItems logic ...


    return (
        <div className="widget admin-slots-page">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>⏰ উপলব্ধ স্লট পরিচালনা</h3>
                <Button variant="primary" onClick={handleShowModal}>
                    <PlusCircle className="me-2" /> নতুন স্লট যোগ করুন
                </Button>
            </div>

            {/* --- Filter Section --- */}
            <Form className="mb-3 p-3 border rounded" style={{ backgroundColor: 'var(--color-widget-bg)' }}>
                <Row className="g-2 align-items-end">
                    <Col md={4}>
                         <Form.Group controlId="filterService">
                             <Form.Label>সেবা</Form.Label>
                             <Form.Select name="service_id" value={filters.service_id} onChange={handleFilterChange} disabled={loading}>
                                 <option value="">-- সব সেবা --</option>
                                 {services.map(service => (
                                     <option key={service.id} value={service.id}>{service.name}</option>
                                 ))}
                             </Form.Select>
                         </Form.Group>
                    </Col>
                     <Col md={4}>
                        <Form.Group controlId="filterDate">
                            <Form.Label>তারিখ</Form.Label>
                            <Form.Control type="date" name="date" value={filters.date} onChange={handleFilterChange} disabled={loading} />
                        </Form.Group>
                    </Col>
                     <Col md="auto">
                        <Button variant="primary" onClick={applyFilters} disabled={loading}>
                            {loading ? <Spinner as="span" size="sm" /> : '🔍 ফিল্টার'}
                        </Button>
                    </Col>
                </Row>
            </Form>


            {error && !showModal && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : slots.length === 0 ? (
                <Alert variant="info">কোনো উপলব্ধ স্লট পাওয়া যায়নি।</Alert>
            ) : (
                 <>
                    <Table striped bordered hover responsive size="sm" variant={document.documentElement.getAttribute('data-bs-theme') || 'light'}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>সেবা</th>
                                <th>শুরুর সময়</th>
                                <th>শেষের সময়</th>
                                {/* <th>Capacity</th> */}
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((slot, index) => (
                                <tr key={slot.id}>
                                    <td>{pagination.from + index}</td>
                                    <td>{slot.service?.name || 'N/A'}</td>
                                    <td>{moment(slot.start_time).format('lll (dddd)')}</td> {/* Format date/time */}
                                    <td>{moment(slot.end_time).format('LT')}</td> {/* Only show time */}
                                    {/* <td>{slot.capacity}</td> */}
                                    <td>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSlot(slot.id)} disabled={loading}>
                                            <Trash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                     {/* --- Pagination --- */}
                     {/* ... Pagination component here ... */}
                 </>
            )}

            {/* --- Create Slot Modal --- */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>নতুন স্লট যোগ করুন</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveSlot}>
                    <Modal.Body>
                         {error && <Alert variant="danger">{error}</Alert>} {/* Modal specific errors */}
                         <Form.Group className="mb-3" controlId="slotService">
                             <Form.Label>সেবা</Form.Label>
                             <Form.Select name="service_id" value={newSlot.service_id} onChange={handleSlotInputChange} required disabled={isSaving}>
                                 <option value="" disabled>-- সেবা নির্বাচন করুন --</option>
                                 {services.map(service => (
                                     <option key={service.id} value={service.id}>{service.name}</option>
                                 ))}
                             </Form.Select>
                         </Form.Group>
                         <Form.Group className="mb-3" controlId="slotStartTime">
                             <Form.Label>শুরুর সময়</Form.Label>
                             <Datetime
                                value={newSlot.start_time}
                                onChange={handleStartTimeChange}
                                dateFormat="YYYY-MM-DD"
                                timeFormat="HH:mm" // Use 24-hour format
                                inputProps={{ required: true, disabled: isSaving, placeholder: 'Select Start Time' }}
                                isValidDate={current => current.isSameOrAfter(moment().subtract(1, 'day'))} // Allow today and future
                             />
                         </Form.Group>
                         <Form.Group className="mb-3" controlId="slotEndTime">
                             <Form.Label>শেষের সময় (স্বয়ংক্রিয়ভাবে সেট হবে)</Form.Label>
                              <Datetime
                                value={newSlot.end_time}
                                onChange={handleEndTimeChange} // Allow manual change if needed
                                dateFormat={false} // Only time
                                timeFormat="HH:mm"
                                inputProps={{ required: true, disabled: isSaving, placeholder: 'Select End Time' }}
                             />
                             <Form.Text muted>
                                 সেবার ডিউরেশন অনুযায়ী শেষের সময় স্বয়ংক্রিয়ভাবে সেট হবে। প্রয়োজন হলে পরিবর্তন করতে পারেন।
                             </Form.Text>
                         </Form.Group>
                          <Form.Group className="mb-3" controlId="slotCapacity">
                            <Form.Label>ধারণক্ষমতা (Capacity)</Form.Label>
                            <Form.Control
                                type="number"
                                name="capacity"
                                value={newSlot.capacity}
                                onChange={handleSlotInputChange}
                                required
                                min="1"
                                disabled={isSaving}
                            />
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={isSaving}>বাতিল</Button>
                        <Button variant="primary" type="submit" disabled={isSaving}>
                             {isSaving ? <Spinner as="span" size="sm" /> : 'সেভ করুন'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSlotsPage;