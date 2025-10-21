import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axios';
import NotificationWidget from './NotificationWidget';
import NidWidget from './NidWidget';
import DrivingLicenseWidget from './DrivingLicenseWidget';
import VehicleFitnessWidget from './VehicleFitnessWidget';
import DocumentWallet from './DocumentWallet';
import StatusChart from './StatusChart';
import ActivityHistory from './ActivityHistory';
import ETinWidget from './ETinWidget';

// --- React Bootstrap Imports ---
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from 'react-bootstrap';

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

  // --- সার্ভিস স্ট্যাটাস ডেটা ---
  const serviceStatusData = useMemo(() => {
    let active = 0;
    let expired = 0;
    let expiringSoon = 0;

    const checkStatus = (items, expiryDaysThreshold = 60) => {
      if (!items) return;
      items.forEach((item) => {
        if (item.status === 'Expired') {
          expired++;
        } else if (item.expiry_date) {
          const expiry = new Date(item.expiry_date);
          const today = new Date();
          const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= expiryDaysThreshold) expiringSoon++;
          else if (diffDays > expiryDaysThreshold) active++;
          else expired++;
        } else {
          active++;
        }
      });
    };

    checkStatus(dashboardData?.driving_licenses, 30);
    checkStatus(dashboardData?.vehicle_fitnesses, 60);

    return {
      labels: ['Active (সক্রিয়)', 'Expiring Soon (মেয়াদ শেষের পথে)', 'Expired (মেয়াদোত্তীর্ণ)'],
      datasets: [
        {
          label: 'Service Status',
          data: [active, expiringSoon, expired],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData]);

  // --- রেন্ডার ---
  if (loading && !dashboardData) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchDashboardData}>
          পুনরায় চেষ্টা করুন
        </Button>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">কোনো ড্যাশবোর্ড ডেটা পাওয়া যায়নি।</Alert>
      </Container>
    );
  }

  const { nid, driving_licenses, vehicle_fitnesses, e_tin, notifications } = dashboardData;

  return (
    <Container className="my-4">
      {/* 🔔 Notification Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <NotificationWidget
            notifications={notifications}
            onActionComplete={fetchDashboardData}
          />
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" size="sm" /> রিফ্রেশ হচ্ছে...
        </div>
      )}

      {/* --- সেবার সারসংক্ষেপ --- */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="mb-3 text-center">📊 সেবার সারসংক্ষেপ</h4>
          <StatusChart chartData={serviceStatusData} />
        </Card.Body>
      </Card>

      {/* --- উইজেট গ্রিড --- */}
      <Row xs={1} md={2} lg={2} className="g-4">
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <NidWidget nid={nid} />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <DrivingLicenseWidget licenses={driving_licenses} />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <VehicleFitnessWidget fitnesses={vehicle_fitnesses} />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <ETinWidget eTin={e_tin} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Document Wallet Section --- */}
      <Card className="shadow-sm mt-5 mb-4">
        <Card.Body>
          <h5 className="mb-3">📂 ডিজিটাল ডকুমেন্ট ওয়ালেট</h5>
          <DocumentWallet />
        </Card.Body>
      </Card>

      {/* --- Activity History Section --- */}
      <Card className="shadow-sm mt-5">
        <Card.Body>
          <h5 className="mb-3">🕒 সাম্প্রতিক কার্যক্রম</h5>
          <ActivityHistory />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
