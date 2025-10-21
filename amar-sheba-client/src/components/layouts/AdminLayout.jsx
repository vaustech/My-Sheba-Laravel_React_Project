import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Nav,
  Navbar,
  Button,
  Dropdown,
  Offcanvas,
} from 'react-bootstrap';
import {
  PeopleFill,
  ChatLeftTextFill,
  FileEarmarkTextFill,
  List,
  MoonStars,
  Sun,
  HouseDoorFill,
} from 'react-bootstrap-icons';
import './AdminLayout.css';
import {  CalendarCheckFill } from 'react-bootstrap-icons';
import { /* ..., */ Speedometer2 } from 'react-bootstrap-icons';
const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const location = useLocation();
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars
  const { user, logout, theme, toggleTheme } = useAuth();

  const handleLogout = () => logout();
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  useEffect(() => {
    handleCloseOffcanvas();
  }, [location]);

  const currentTheme = theme || 'light';

  // Sidebar Content
  const sidebarContent = (
    <Nav
      className="flex-column admin-nav"
      variant="pills"
      activeKey={location.pathname}
      onSelect={handleCloseOffcanvas}
    >

<Nav.Item>
             <Nav.Link as={Link} to="/admin" eventKey="/admin" active={location.pathname === '/admin' || location.pathname === '/admin/dashboard'}> {/* Handle both index and explicit path */}
                 <Speedometer2 className="me-2" /> ড্যাশবোর্ড
             </Nav.Link>
         </Nav.Item>



      <Nav.Item>
        <Nav.Link as={Link} to="/admin/users" eventKey="/admin/users">
          <PeopleFill className="me-2" /> ব্যবহারকারীগণ
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/admin/support-tickets" eventKey="/admin/support-tickets">
          <ChatLeftTextFill className="me-2" /> সাপোর্ট টিকেট
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/admin/audit-logs" eventKey="/admin/audit-logs">
          <FileEarmarkTextFill className="me-2" /> অডিট লগ
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
            <Nav.Link as={Link} to="/admin/appointments" eventKey="/admin/appointments">
               <CalendarCheckFill className="me-2" /> অ্যাপয়েন্টমেন্ট
            </Nav.Link>
        </Nav.Item>

    </Nav>
    
  );

  return (
    <div className={`admin-layout theme-${currentTheme}`}>
      {/* Top Navbar */}
      <Navbar
        bg={currentTheme}
        variant={currentTheme}
        fixed="top"
        expand={false}
        className="shadow-sm admin-navbar"
      >
        <Container fluid>
          <Button
            variant="outline-secondary"
            onClick={handleShowOffcanvas}
            className="d-lg-none me-2"
          >
            <List size={22} />
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="d-none d-lg-block me-2"
          >
            <List size={22} />
          </Button>

          <Navbar.Brand as={Link} to="/admin" className="fw-semibold">
            ⚙️ অ্যাডমিন প্যানেল
          </Navbar.Brand>

          <Nav className="ms-auto d-flex flex-row align-items-center gap-2">
            <Nav.Link as={Link} to="/" title="সাইট দেখুন" className="d-none d-sm-block">
              <HouseDoorFill size={20} />
            </Nav.Link>
            <Button
              variant={currentTheme === 'light' ? 'outline-dark' : 'outline-light'}
              size="sm"
              onClick={toggleTheme}
              title="থিম পরিবর্তন করুন"
            >
              {currentTheme === 'light' ? <MoonStars /> : <Sun />}
            </Button>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                👤 {user?.name || 'Admin'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  লগআউট
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* Sidebar + Main Content */}
      <div className="admin-body">
        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} theme-${currentTheme}`}
        >
          {sidebarContent}
        </aside>

        {/* Mobile Offcanvas Sidebar */}
        <Offcanvas
          show={showOffcanvas}
          onHide={handleCloseOffcanvas}
          className={`admin-offcanvas theme-${currentTheme}`}
        >
          <Offcanvas.Header closeButton closeVariant={currentTheme === 'dark' ? 'white' : undefined}>
            <Offcanvas.Title>মেনু</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>{sidebarContent}</Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
