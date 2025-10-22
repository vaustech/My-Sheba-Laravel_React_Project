// src/components/Sidebar.jsx
import React from "react";
import { Nav } from "react-bootstrap";
import {
  Grid,
  CalendarEvent,
  LifePreserver,
  BoxArrowRight,
  Speedometer,
} from "react-bootstrap-icons";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar shadow-sm">
      <div className="sidebar-header d-flex align-items-center mb-4">
        <Grid className="me-2 text-info fs-5" />
        <span className="fw-bold text-light">আমার সেবা</span>
      </div>

      <Nav className="flex-column sidebar-menu">
        <Nav.Link href="/" className="sidebar-link active">
          <Speedometer className="me-2" /> ড্যাশবোর্ড
        </Nav.Link>

        <Nav.Link href="/appointments" className="sidebar-link">
          <CalendarEvent className="me-2" /> অ্যাপয়েন্টমেন্ট
        </Nav.Link>

        <Nav.Link href="/support" className="sidebar-link">
          <LifePreserver className="me-2" /> সাপোর্ট
        </Nav.Link>

        <Nav.Link href="/logout" className="sidebar-link text-danger">
          <BoxArrowRight className="me-2" /> লগআউট
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
