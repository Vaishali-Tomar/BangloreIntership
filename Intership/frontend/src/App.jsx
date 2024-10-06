import React from 'react';
import Signup from './Signup';
import UserList from './UserList';
import UserProfile from './UserProfile';

const App = () => {
  return (
    <div>
      <h1>User Management System</h1>
      <Signup />
      <UserList />
      <UserProfile />
    </div>
  );
};

export default App;
