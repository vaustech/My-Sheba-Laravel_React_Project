import React, { useState, useEffect } from "react";
import apiClient from "../../api/axios";
import {
  Table,
  Pagination,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Badge,
  Dropdown,
} from "react-bootstrap";

const getStatusVariant = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "completed":
      return "secondary";
    case "cancelled":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
};

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    userId: "",
    serviceId: "",
  });

  // ✅ Stable fetch function (no re-creation)
  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page });
      if (filters.status) params.append("status", filters.status);
      if (filters.date) params.append("date", filters.date);
      if (filters.userId) params.append("user_id", filters.userId);
      if (filters.serviceId) params.append("service_id", filters.serviceId);

      const response = await apiClient.get(
        `/admin/appointments?${params.toString()}`
      );
      setAppointments(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("অ্যাপয়েন্টমেন্টগুলো লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loop-free useEffect
  useEffect(() => {
    fetchAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.date, filters.userId, filters.serviceId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      if (prev[name] === value) return prev; // prevent re-renders
      return { ...prev, [name]: value };
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination?.lastPage) fetchAppointments(page);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiClient.patch(`/admin/appointments/${id}/status`, {
        status: newStatus,
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch {
      alert("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="p-3">
      <h3 className="mb-3">🗓️ অ্যাপয়েন্টমেন্ট ব্যবস্থাপনা</h3>

      {/* Filter Form */}
      <Form className="mb-3 p-3 border rounded bg-light-subtle">
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>স্ট্যাটাস</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">-- সব --</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>তারিখ</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>লোড হচ্ছে...</p>
        </div>
      ) : appointments.length === 0 ? (
        <Alert variant="info">কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>ব্যবহারকারী</th>
                <th>সেবা</th>
                <th>সময়</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.user?.name || "N/A"}</td>
                  <td>{a.service?.name || "N/A"}</td>
                  <td>{new Date(a.appointment_time).toLocaleString()}</td>
                  <td>
                    <Badge bg={getStatusVariant(a.status)}>{a.status}</Badge>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        id="dropdown-basic"
                      >
                        পরিবর্তন
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {["pending", "confirmed", "completed", "cancelled"]
                          .filter((s) => s !== a.status)
                          .map((s) => (
                            <Dropdown.Item
                              key={s}
                              onClick={() => handleStatusUpdate(a.id, s)}
                            >
                              {s}
                            </Dropdown.Item>
                          ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {pagination?.lastPage > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              />
              <Pagination.Item active>
                {pagination.currentPage} / {pagination.lastPage}
              </Pagination.Item>
              <Pagination.Next
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              />
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
