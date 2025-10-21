import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import {
  Card,
  Table,
  Spinner,
  Alert,
  Button,
  Pagination,
  Container,
} from 'react-bootstrap';

const ActivityHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // 🔄 হিস্ট্রি লোড ফাংশন
  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/history?page=${page}`);
      setHistory(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        perPage: response.data.per_page,
      });
    } catch (err) {
      console.error('হিস্ট্রি লোড করা যায়নি', err);
      setError('⚠️ কাজের ইতিহাস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.lastPage) {
      fetchHistory(newPage);
    }
  };

  return (
    <Container className="px-0">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3 text-center">🕒 আপনার কাজের ইতিহাস</Card.Title>

          {/* 🔹 এরর মেসেজ */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* 🔹 লোডিং */}
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">লোড হচ্ছে...</p>
            </div>
          )}

          {/* 🔹 ডেটা না থাকলে */}
          {!loading && history.length === 0 && (
            <Alert variant="info" className="text-center">
              কোনো কাজের ইতিহাস পাওয়া যায়নি।
            </Alert>
          )}

          {/* 🔹 টেবিল */}
          {!loading && history.length > 0 && (
            <>
              <Table striped bordered hover responsive className="align-middle">
                <thead>
                  <tr className="text-center">
                    <th>সময়</th>
                    <th>কাজের ধরন</th>
                    <th>বিবরণ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap text-center">
                        {new Date(log.created_at).toLocaleString('bn-BD', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="text-center fw-semibold">{log.action_type}</td>
                      <td>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* 🔹 পেজিনেশন */}
              {pagination && pagination.lastPage > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1 || loading}
                    >
                      আগের পৃষ্ঠা
                    </Pagination.Prev>

                    <Pagination.Item active>
                      {pagination.currentPage} / {pagination.lastPage}
                    </Pagination.Item>

                    <Pagination.Next
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.lastPage || loading
                      }
                    >
                      পরের পৃষ্ঠা
                    </Pagination.Next>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityHistory;
