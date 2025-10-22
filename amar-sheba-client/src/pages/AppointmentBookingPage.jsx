// src/pages/AppointmentBookingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios'; // Adjust path if needed
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    ListGroup,
    Badge
} from 'react-bootstrap';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';
import { useAuth } from '../context/AuthContext'; // Or '../App'

const AppointmentBookingPage = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedDate, setSelectedDate] = useState(moment()); // Default to today
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); // { id: slot_id, time: start_time }
    const [notes, setNotes] = useState('');

    const [loadingServices, setLoadingServices] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
// eslint-disable-next-line no-unused-vars
    const { user } = useAuth(); // Get logged-in user info if needed

    // Fetch available services
    useEffect(() => {
        const fetchServices = async () => {
            setLoadingServices(true);
            setError('');
            try {
                const response = await apiClient.get('/services');
                setServices(response.data || []);
            } catch (err) {
                console.error("Failed to fetch services:", err);
                setError("সেবা তালিকা লোড করা যায়নি।");
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    // Fetch available slots when service or date changes
    const fetchSlots = useCallback(async () => {
        if (!selectedService || !selectedDate) {
            setAvailableSlots([]);
            return;
        }
        setLoadingSlots(true);
        setError('');
        setAvailableSlots([]); // Clear previous slots
        setSelectedSlot(null); // Reset selected slot

        const dateString = moment(selectedDate).format('YYYY-MM-DD');

        try {
            const response = await apiClient.get(`/services/${selectedService}/slots?date=${dateString}`);
            setAvailableSlots(response.data || []);
        } catch (err) {
            console.error("Failed to fetch slots:", err);
            setError("নির্বাচিত তারিখে কোনো উপলব্ধ স্লট পাওয়া যায়নি বা লোড করা যায়নি।");
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedService, selectedDate]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);


    // Handle Booking Submission
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedService || !selectedSlot) {
            setError("অনুগ্রহ করে সেবা এবং সময় স্লট নির্বাচন করুন।");
            return;
        }
        setIsBooking(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await apiClient.post('/appointments', {
                service_id: selectedService,
                available_slot_id: selectedSlot.id,
                notes: notes,
            });
            setSuccessMessage(`অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে! আপনার অ্যাপয়েন্টমেন্ট সময়: ${moment(response.data.appointment_time).format('lll')}`);
            // Reset form
            setSelectedSlot(null);
            setNotes('');
            // Refetch slots for the current date to show updated availability
            fetchSlots();
        } catch (err) {
            console.error("Failed to book appointment:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "অ্যাপয়েন্টমেন্ট বুক করা সম্ভব হয়নি। স্লটটি ইতিমধ্যে বুক হয়ে যেতে পারে।");
        } finally {
            setIsBooking(false);
        }
    };

    // Date Time Picker validation: disable past dates
    const validDate = (current) => {
        const yesterday = moment().subtract(1, 'day');
        return current.isAfter(yesterday);
    };


    return (
        <Container className="my-4">
            <Card className="shadow-sm">
                <Card.Header as="h4">🗓️ অ্যাপয়েন্টমেন্ট বুকিং</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form onSubmit={handleBookingSubmit}>
                        {/* --- ১. সেবা নির্বাচন --- */}
                        <Form.Group as={Row} className="mb-3" controlId="selectService">
                            <Form.Label column sm={3}>সেবা নির্বাচন করুন:</Form.Label>
                            <Col sm={9}>
                                {loadingServices ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <Form.Select
                                        value={selectedService}
                                        onChange={(e) => {
                                            setSelectedService(e.target.value);
                                            setSelectedSlot(null); // Reset slot on service change
                                        }}
                                        required
                                        disabled={isBooking}
                                    >
                                        <option value="" disabled>-- একটি সেবা নির্বাচন করুন --</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} ({service.duration_minutes} মিনিট)
                                            </option>
                                        ))}
                                    </Form.Select>
                                )}
                            </Col>
                        </Form.Group>

                        {/* --- ২. তারিখ নির্বাচন --- */}
                        {selectedService && (
                             <Form.Group as={Row} className="mb-3 align-items-center" controlId="selectDate">
                                <Form.Label column sm={3}>তারিখ নির্বাচন করুন:</Form.Label>
                                <Col sm={9}>
                                     <Datetime
                                        value={selectedDate}
                                        onChange={(momentDate) => {
                                            setSelectedDate(momentDate);
                                            setSelectedSlot(null); // Reset slot on date change
                                        }}
                                        dateFormat="YYYY-MM-DD (dddd)"
                                        timeFormat={false} // Only date selection
                                        inputProps={{ required: true, disabled: isBooking, placeholder: 'Select Date' }}
                                        isValidDate={validDate} // Disable past dates
                                        closeOnSelect={true}
                                     />
                                </Col>
                            </Form.Group>
                        )}

                        {/* --- ৩. সময় স্লট নির্বাচন --- */}
                        {selectedService && selectedDate && (
                            <Form.Group as={Row} className="mb-3" controlId="selectSlot">
                                <Form.Label column sm={3}>উপলব্ধ সময়:</Form.Label>
                                <Col sm={9}>
                                    {loadingSlots ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : availableSlots.length > 0 ? (
                                        <ListGroup horizontal className="flex-wrap">
                                            {availableSlots.map(slot => (
                                                <ListGroup.Item
                                                    key={slot.id}
                                                    action // Makes it clickable
                                                    active={selectedSlot?.id === slot.id}
                                                    onClick={() => !isBooking && setSelectedSlot({ id: slot.id, time: slot.start_time })}
                                                    disabled={isBooking}
                                                    style={{ margin: '5px', flexBasis: '120px', textAlign: 'center' }} // Adjust styling
                                                >
                                                    {moment(slot.start_time).format('LT')} {/* যেমন: 10:00 AM */}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <Alert variant="info" className="mt-2">এই তারিখে কোনো খালি স্লট নেই।</Alert>
                                    )}
                                </Col>
                            </Form.Group>
                        )}

                        {/* --- ৪. অতিরিক্ত নোটস (ঐচ্ছিক) --- */}
                        {selectedSlot && (
                            <Form.Group as={Row} className="mb-3" controlId="notes">
                                <Form.Label column sm={3}>বিশেষ নোট (যদি থাকে):</Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        disabled={isBooking}
                                        placeholder="কোনো বিশেষ অনুরোধ বা তথ্য থাকলে লিখুন..."
                                    />
                                </Col>
                            </Form.Group>
                        )}

                        {/* --- ৫. বুকিং বাটন --- */}
                        {selectedSlot && (
                             <Row>
                                 <Col sm={{ span: 9, offset: 3 }}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isBooking || loadingSlots || !selectedSlot}
                                    >
                                        {isBooking ? (
                                             <><Spinner as="span" size="sm" /> বুকিং হচ্ছে...</>
                                         ) : (
                                             `কনফার্ম বুকিং (${moment(selectedSlot.time).format('LT')})`
                                         )}
                                    </Button>
                                 </Col>
                             </Row>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AppointmentBookingPage;