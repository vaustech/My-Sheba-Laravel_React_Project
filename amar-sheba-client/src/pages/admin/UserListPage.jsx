import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import './UserListPage.css';

import {
  Card,
  Table,
  Spinner,
  Alert,
  Button,
  Pagination,
} from 'react-bootstrap';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // ✅ ইউজার লিস্ট লোড
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/users?page=${page}`);
      setUsers(res.data.data);
      setPagination({
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        total: res.data.total,
      });
    } catch {
      setError('ব্যবহারকারীদের তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ ডিলিট হ্যান্ডলার
  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" ব্যবহারকারীকে মুছে ফেলতে চান?`)) {
      try {
        await apiClient.delete(`/admin/users/${id}`);
        fetchUsers(pagination?.currentPage || 1);
      } catch {
        alert('ব্যবহারকারী ডিলিট ব্যর্থ হয়েছে।');
      }
    }
  };

  // ✅ Pagination হ্যান্ডলার
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination?.lastPage) fetchUsers(page);
  };

  return (
   <div className="px-0 px-lg-0 py-3 w-100">
      <Card className="shadow-sm border-0 w-100">
        <Card.Body>
          <h4 className="text-center mb-4">👥 ব্যবহারকারী তালিকা</h4>

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">লোড হচ্ছে...</p>
            </div>
          )}

          {!loading && users.length === 0 && !error && (
            <Alert variant="info" className="text-center">
              কোনো ব্যবহারকারী পাওয়া যায়নি।
            </Alert>
          )}

          {!loading && users.length > 0 && (
            <>
              <div className="table-responsive">
                <Table hover bordered className="align-middle user-table">
                  <thead>
                    <tr>
                      <th>নাম</th>
                      <th>ইমেইল</th>
                      <th>Role</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(u.id, u.name)}
                          >
                            ডিলিট
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {pagination?.lastPage > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
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
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserListPage;
