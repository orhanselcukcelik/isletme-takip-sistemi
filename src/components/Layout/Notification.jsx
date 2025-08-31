// components/Layout/Notification.jsx
import React from 'react';

const Notification = ({ notification }) => {
  // Eğer notification gösterilmeyecekse hiçbir şey render etme
  if (!notification || !notification.show) {
    return null;
  }

  return (
    <div className="notification">
      <div className="notification-content">
        <span>{notification.message}</span>
      </div>
    </div>
  );
};

export default Notification;