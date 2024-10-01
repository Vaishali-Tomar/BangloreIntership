import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css'; // Import your CSS file

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching user data');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>All Users</h2>
      {message && <p>{message}</p>}
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Gender</th>
              <th>Destination</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>{user.gender}</td>
                <td>{user.destination}</td>
                <td>
                  {user.image && (
                    <img
                      src={`/uploads/${user.image}`}
                      alt="User"
                      width="50"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UserList;
