// src/components/Navbar.jsx
import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import {
  HouseDoor,
  Grid,
  CalendarEvent,
  LifePreserver,
  BoxArrowRight,
} from "react-bootstrap-icons";
import "../styles/Navbar.css";

const AppNavbar = () => {
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="app-navbar shadow-sm"
    >
      <Container fluid>
        <Navbar.Brand
          href="/"
          className="fw-bold d-flex align-items-center text-info"
        >
          <Grid className="me-2 text-info" /> আমার সেবা
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="/" className="nav-link-custom active">
              <HouseDoor className="me-1" /> ড্যাশবোর্ড
            </Nav.Link>
            <Nav.Link href="/appointments" className="nav-link-custom">
              <CalendarEvent className="me-1" /> অ্যাপয়েন্টমেন্ট বুকিং
            </Nav.Link>
            <Nav.Link href="/support" className="nav-link-custom">
              <LifePreserver className="me-1" /> সাপোর্ট
            </Nav.Link>
            <Nav.Link href="/logout" className="nav-link-custom text-danger">
              <BoxArrowRight className="me-1" /> লগআউট
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
