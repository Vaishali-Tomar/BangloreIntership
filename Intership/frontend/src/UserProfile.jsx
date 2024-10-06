import React, { useState, useEffect } from 'react';
import axios from 'axios';


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const userId = 1; // Hardcoded for example, should be dynamic or passed as props

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]); // Added dependency on userId

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
    </div>
  );
};

export default UserProfile;
