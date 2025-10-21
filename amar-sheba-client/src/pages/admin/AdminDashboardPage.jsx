// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { PeopleFill, FileEarmarkTextFill, TicketDetailedFill } from 'react-bootstrap-icons';

const AdminDashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get('/admin/analytics/summary');
                setSummary(response.data);
            } catch (err) {
                console.error("Failed to fetch analytics summary:", err);
                setError(err.response?.data?.error || "সারাংশ লোড করা যায়নি।");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>ড্যাশবোর্ড লোড হচ্ছে...</p>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!summary) {
        return <Alert variant="warning">কোনো ডেটা পাওয়া যায়নি।</Alert>;
    }

    // --- সুন্দরভাবে সমান ডিজাইন করা কার্ড কম্পোনেন্ট ---
    const StatCard = ({ title, value, icon, variant = 'primary' }) => (
        <Card
            // ১. কার্ডকে h-100 (height: 100%) ক্লাস দেওয়া হয়েছে
            className={`text-${variant === 'warning' ? 'dark' : 'white'} bg-${variant} shadow border-0 h-100`}
            style={{
                minHeight: '160px',
                borderRadius: '15px',
                // ২. কার্ড থেকে display:flex এবং অ্যালাইনমেন্ট স্টাইলগুলো সরানো হয়েছে,
                // কারণ Card.Body নিজেই তার কনটেন্ট সেন্টার করছে।
                transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
            }}
        >
            <Card.Body
                // Card.Body-এর এই ফ্লেক্স প্রপার্টিগুলোই কনটেন্ট সেন্টারে রাখার জন্য যথেষ্ট
                className="d-flex flex-column align-items-center justify-content-center text-center"
                style={{ padding: '20px' }}
            >
                <div className="fs-1 mb-2">{icon}</div>
                <h3 className="fw-bold mb-1">{value}</h3>
                <p className="mb-0 fw-semibold">{title}</p>
            </Card.Body>
        </Card>
    );

    return (
        <div>
            <h2 className="fw-semibold mb-4">📊 অ্যাডমিন ড্যাশবোর্ড</h2>
            <Row xs={1} sm={2} md={2} lg={4} className="g-4">
                <Col>
                    <StatCard
                        title="মোট ব্যবহারকারী (User)"
                        value={summary.totalUsers ?? 0}
                        icon={<PeopleFill />}
                        variant="primary"
                    />
                </Col>
                <Col>
                    <StatCard
                        title="মোট ডকুমেন্ট"
                        value={summary.totalDocuments ?? 0}
                        icon={<FileEarmarkTextFill />}
                        variant="info"
                    />
                </Col>
                <Col>
                    <StatCard
                        title="মোট সাপোর্ট টিকেট"
                        value={summary.supportTickets?.total ?? 0}
                        icon={<TicketDetailedFill />}
                        variant="success"
                    />
                </Col>
                <Col>
                    <StatCard
                        title="খোলা টিকেট (Open)"
                        value={summary.supportTickets?.open ?? 0}
                        icon={<TicketDetailedFill />}
                        variant="warning"
                    />
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;