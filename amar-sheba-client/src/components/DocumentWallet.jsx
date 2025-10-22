import React from "react";
import { Card, Row, Col, Alert } from "react-bootstrap";
import {
  PersonVcardFill,
  CarFrontFill,
  FileEarmarkTextFill,
  WalletFill,
  BarChartFill,
} from "react-bootstrap-icons";
import NidWidget from "./NidWidget";
import DrivingLicenseWidget from "./DrivingLicenseWidget";
import VehicleFitnessWidget from "./VehicleFitnessWidget";
import ETinWidget from "./ETinWidget";
import StatusChart from "./StatusChart";
import "./../styles/WidgetCard.css";
const DocumentWallet = ({ dashboardData }) => {
  if (!dashboardData) {
    return (
      <Alert variant="info" className="text-center">
        📂 ডেটা লোড হচ্ছে...
      </Alert>
    );
  }

  const { nid, driving_licenses, vehicle_fitnesses, e_tin } = dashboardData;

  // ✅ Chart data তৈরি (child side calculation only)
  const serviceStatusData = (() => {
    let active = 0,
      expired = 0,
      expiringSoon = 0;

    const items = [
      ...(driving_licenses || []),
      ...(vehicle_fitnesses || []),
    ];

    items.forEach((item) => {
      if (item.status === "Expired") expired++;
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
      labels: ["Active", "Expiring Soon", "Expired"],
      datasets: [
        {
          data: [active, expiringSoon, expired],
          backgroundColor: [
            "rgba(25,135,84,0.7)",
            "rgba(255,193,7,0.7)",
            "rgba(220,53,69,0.7)",
          ],
          borderColor: [
            "rgba(25,135,84,1)",
            "rgba(255,193,7,1)",
            "rgba(220,53,69,1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  })();

  return (
    <div>
      <h5 className="mb-3">
        <WalletFill className="me-2" />
        ডিজিটাল ডকুমেন্ট ওয়ালেট
      </h5>

      {/* ✅ সারসংক্ষেপ */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="fw-bold">
          <BarChartFill className="me-2" /> সেবার সারসংক্ষেপ
        </Card.Header>
        <Card.Body>
          {serviceStatusData.datasets[0].data.every((n) => n === 0) ? (
            <p className="text-muted text-center">
              📊 স্ট্যাটাস দেখানোর মতো কোনো ডেটা নেই।
            </p>
          ) : (
            <StatusChart chartData={serviceStatusData} />
          )}
        </Card.Body>
      </Card>

      {/* ✅ Widget Grid */}
      <Row xs={1} md={2} className="g-4">
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <PersonVcardFill className="me-2" />
              জাতীয় পরিচয়পত্র
            </Card.Header>
            <Card.Body>
              <NidWidget nid={nid} />
              {!nid && (
                <p className="text-muted text-center mt-2">
                  NID তথ্য পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <CarFrontFill className="me-2" />
              ড্রাইভিং লাইসেন্স
            </Card.Header>
            <Card.Body>
              <DrivingLicenseWidget licenses={driving_licenses} />
              {(!driving_licenses || driving_licenses.length === 0) && (
                <p className="text-muted text-center mt-2">
                  কোনো লাইসেন্স রেকর্ড পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <CarFrontFill className="me-2 text-info" />
              যানবাহনের ফিটনেস
            </Card.Header>
            <Card.Body>
              <VehicleFitnessWidget fitnesses={vehicle_fitnesses} />
              {(!vehicle_fitnesses || vehicle_fitnesses.length === 0) && (
                <p className="text-muted text-center mt-2">
                  কোনো ফিটনেস রেকর্ড নেই।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-bold">
              <FileEarmarkTextFill className="me-2" />
              ই-টিন (e-TIN)
            </Card.Header>
            <Card.Body>
              <ETinWidget eTin={e_tin} />
              {!e_tin && (
                <p className="text-muted text-center mt-2">
                  ই-টিন তথ্য পাওয়া যায়নি।
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(DocumentWallet);
