import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '@/Config/Api';
import Navbar from '@/components/Navbar';
import UsersTable from '@/components/UserTable';
// import UserFormModal from '@/components/UserForm';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
}

const AdminUsersProfile = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/customers/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user
  const handleAddUser = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/customers`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUsers();
      setIsModalOpen(false);
      alert('User added successfully!');
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.message || 'Failed to add user');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit user
  const handleEditUser = async (data: { name: string; email: string; phone: string; password?: string }) => {
    if (!editingUser) return;
    
    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/customers/${editingUser.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users Profile</h1>
          <p className="text-gray-600">Manage your registered users</p>
        </div>

        <UsersTable
          users={users}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
          onAdd={handleOpenAddModal}
          loading={loading}
        />
      </div>

      {/* <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleEditUser : handleAddUser}
        initialData={editingUser}
        loading={formLoading}
      /> */}
    </div>
  );
};

export default AdminUsersProfile;