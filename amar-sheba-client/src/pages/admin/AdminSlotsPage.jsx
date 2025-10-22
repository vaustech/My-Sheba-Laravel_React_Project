import React, { useState, useEffect } from "react";
import apiClient from "../../api/axios";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { PlusCircle, Trash } from "react-bootstrap-icons";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ service_id: "", date: "" });
  // eslint-disable-next-line no-unused-vars
  const [newSlot, setNewSlot] = useState({
    service_id: "",
    start_time: moment(),
    end_time: moment().add(30, "minutes"),
    capacity: 1,
  });

  // ✅ Load services once
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/services?per_page=1000");
        setServices(res.data.data || res.data);
      } catch (err) {
        console.error("Service fetch failed:", err);
      }
    })();
  }, []);

  // ✅ Safe slot fetcher
  const loadSlots = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page });
      if (filters.service_id) params.append("service_id", filters.service_id);
      if (filters.date) params.append("date", filters.date);

      const res = await apiClient.get(`/admin/slots?${params.toString()}`);
      setSlots(res.data.data || []);
      setPagination({
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
      });
    } catch (err) {
      console.error(err);
      setError("স্লট লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter change => load once
  useEffect(() => {
    loadSlots(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.service_id, filters.date]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি এই স্লটটি ডিলিট করতে চান?")) return;
    await apiClient.delete(`/admin/slots/${id}`);
    loadSlots();
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3">
        <h3>⏰ স্লট ম্যানেজমেন্ট</h3>
        <Button onClick={() => setShowModal(true)}>
          <PlusCircle className="me-2" /> নতুন স্লট যোগ করুন
        </Button>
      </div>

      <Form className="mb-3 p-3 border rounded bg-light-subtle">
        <Row className="g-2 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label>সেবা</Form.Label>
              <Form.Select
                name="service_id"
                value={filters.service_id}
                onChange={handleFilterChange}
              >
                <option value="">-- সব সেবা --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
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

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : slots.length === 0 ? (
        <Alert variant="info">কোনো স্লট পাওয়া যায়নি।</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>সেবা</th>
                <th>শুরুর সময়</th>
                <th>শেষ সময়</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.service?.name || "N/A"}</td>
                  <td>{moment(s.start_time).format("lll")}</td>
                  <td>{moment(s.end_time).format("LT")}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default AdminSlotsPage;
