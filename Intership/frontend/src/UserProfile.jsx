import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateUserForm from './UpdateUserForm'; // Import the UpdateUserForm component

const UserProfile = () => {
  const [user, setUser] = useState(null); // Initialize state to store user data
  const userId = 1; // Assume the user ID is 1 for this example

  useEffect(() => {
    // Fetch the current user's data from the backend using axios
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`); // Replace userId with actual ID
        setUser(response.data); // Store the fetched user data in the state
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []); // Ensure this effect runs once on mount

  if (!user) {
    return <div>Loading...</div>; // Show a loading state while user data is being fetched
  }

  return (
    <div>
      <h1>User Profile</h1>
      {/* Pass the fetched user data as props to UpdateUserForm */}
      <UpdateUserForm user={user} />
    </div>
  );
};

export default UserProfile;
