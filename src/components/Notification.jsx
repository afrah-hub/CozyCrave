import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Notification = () => {
  const { notifications, removeNotification } = useContext(AppContext);

  return (
    <div className="notifications-container">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`notification notification-${notif.type}`}
          onClick={() => removeNotification(notif.id)}
        >
          {notif.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
