// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axios';

// Widgets
import NotificationWidget from './NotificationWidget';
import NidWidget from './NidWidget';
import DrivingLicenseWidget from './DrivingLicenseWidget';
import VehicleFitnessWidget from './VehicleFitnessWidget';
import DocumentWallet from './DocumentWallet';
import StatusChart from './StatusChart';
import ActivityHistory from './ActivityHistory';
import ETinWidget from './ETinWidget';

// --- React Bootstrap Imports ---
import { Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';

// --- Icons ---
import {
  BarChartFill,
  BellFill,
  PersonVcardFill,
  CarFrontFill,
  FileEarmarkTextFill,
  WalletFill,
  ClockHistory
,
} from 'react-bootstrap-icons';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 ড্যাশবোর্ড ডেটা ফেচ করার ফাংশন
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      console.error('ড্যাশবোর্ড ডেটা লোড করা যায়নি', err);
      setError('⚠️ ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- সার্ভিস স্ট্যাটাস ডেটা (অপরিবর্তিত লজিক) ---
  const serviceStatusData = useMemo(() => {
    if (!dashboardData) return null;

    let active = 0,
      expired = 0,
      expiringSoon = 0;

    const itemsToCheck = [
      ...(dashboardData?.driving_licenses || []),
      ...(dashboardData?.vehicle_fitnesses || []),
    ];

    itemsToCheck.forEach((item) => {
      if (item.status === 'Expired') expired++;
      else if (item.expiry_date) {
        const expiry = new Date(item.expiry_date);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 60) expiringSoon++;
        else if (diffDays > 60) active++;
        else expired++;
      } else active++;
    });

    return {
      labels: [
        'Active (সক্রিয়)',
        'Expiring Soon (মেয়াদ শেষের পথে)',
        'Expired (মেয়াদোত্তীর্ণ)',
      ],
      datasets: [
        {
          data: [active, expiringSoon, expired],
          backgroundColor: [
            'rgba(25, 135, 84, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(220, 53, 69, 0.7)',
          ],
          borderColor: [
            'rgba(25, 135, 84, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData]);

  // --- Loading State ---
  if (loading && !dashboardData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '300px' }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">ড্যাশবোর্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={fetchDashboardData}>
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      </Alert>
    );
  }

  // --- No Data State ---
  if (!dashboardData) {
    return (
      <Alert variant="warning" className="text-center">
        কোনো ড্যাশবোর্ড ডেটা পাওয়া যায়নি।
      </Alert>
    );
  }

  const { nid, driving_licenses, vehicle_fitnesses, e_tin, notifications } =
    dashboardData;

  // --- Main Dashboard Render ---
  return (
    <div>
      {/* 🔔 Notification Section */}
      {Array.isArray(notifications) && notifications.length > 0 && (
        <Card className="mb-4 border-start border-warning border-3 shadow-sm">
          <Card.Header className="d-flex align-items-center bg-light fw-bold">
            <BellFill className="me-2 text-warning" />
            গুরুত্বপূর্ণ নোটিফিকেশন
          </Card.Header>
          <Card.Body className="p-0">
            <NotificationWidget
              notifications={notifications}
              onActionComplete={fetchDashboardData}
            />
          </Card.Body>
        </Card>
      )}

      {/* --- Main Widgets Grid --- */}
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        {/* --- Service Summary Chart --- */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column chart-widget">
              <h5 className="mb-3 text-center">
                <BarChartFill className="me-2" />
                সেবার সারসংক্ষেপ
              </h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                {serviceStatusData && <StatusChart chartData={serviceStatusData} />}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* --- NID Widget --- */}
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <PersonVcardFill className="me-2" />
              জাতীয় পরিচয়পত্র
            </Card.Header>
            <Card.Body>
              <NidWidget nid={nid} />
              {!nid && (
                <p className="text-muted text-center mt-3">
                  NID তথ্য পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* --- Driving License Widget --- */}
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <CarFrontFill className="me-2" />
              ড্রাইভিং লাইসেন্স
            </Card.Header>
            <Card.Body>
              <DrivingLicenseWidget licenses={driving_licenses} />
              {(!driving_licenses || driving_licenses.length === 0) && (
                <p className="text-muted text-center mt-3">
                  কোনো লাইসেন্স রেকর্ড পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* --- Vehicle Fitness Widget --- */}
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <CarFrontFill className="me-2 text-info" />
              যানবাহনের ফিটনেস
            </Card.Header>
            <Card.Body>
              <VehicleFitnessWidget fitnesses={vehicle_fitnesses} />
              {(!vehicle_fitnesses || vehicle_fitnesses.length === 0) && (
                <p className="text-muted text-center mt-3">
                  কোনো ফিটনেস রেকর্ড নেই।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* --- e-TIN Widget --- */}
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <FileEarmarkTextFill className="me-2" />
              ই-টিন (e-TIN)
            </Card.Header>
            <Card.Body>
              <ETinWidget eTin={e_tin} />
              {!e_tin && (
                <p className="text-muted text-center mt-3">
                  ই-টিন তথ্য পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Document Wallet Section --- */}
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Header className="fw-bold">
              <WalletFill className="me-2" />
              ডিজিটাল ডকুমেন্ট ওয়ালেট
            </Card.Header>
            <Card.Body>
              <DocumentWallet />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Activity History Section --- */}
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Header className="fw-bold">
              <ClockHistory
 className="me-2" />
              সাম্প্রতিক কার্যক্রম
            </Card.Header>
            <Card.Body>
              <ActivityHistory />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(Dashboard);
