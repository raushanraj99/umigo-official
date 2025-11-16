import React, { useState, useEffect } from 'react';
import { FiX, FiClock, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';

// Format date groups like "Today", "Yesterday", or "Aug 14, 2023"
const formatDateGroup = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const input = new Date(date);

  if (input.toDateString() === today.toDateString()) return "Today";
  if (input.toDateString() === yesterday.toDateString()) return "Yesterday";

  return input.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

const NotificationItem = ({ notification, onDelete }) => {
  const id = notification.id || notification._id;
  const [isRead, setIsRead] = useState(notification.read || false);

  // Backend returns UNIX seconds
  const rawTime = notification.created_at
    ? new Date(notification.created_at * 1000)
    : new Date(notification.timestamp || Date.now());

  const title = notification.title || notification.name || "Notification";
  const message = notification.message || notification.text || "No message available";

  // Mark as read when clicking notification
  const handleRead = async () => {
    if (isRead) return;
    setIsRead(true);

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  return (
    <div
      onClick={handleRead}
      className={`relative p-4 rounded-xl mb-3 transition-all ${isRead ? "bg-white/60" : "bg-white shadow-md"
        }`}
    >
      <div className="flex items-start relative">
        {/* Avatar bubble */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 
          flex items-center justify-center text-white font-bold">
          {title.charAt(0).toUpperCase()}
        </div>

        {/* Text */}
        <div className="ml-3 flex flex-col items-start justify-start">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
        {/* Time */}
        <p className="absolute bottom-0 right-0 text-[10px] text-gray-500 flex items-center mt-1">
          <FiClock className="mr-1" size={12} />
          {formatTime(rawTime)}
        </p>
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute right-0 top-0 text-gray-400 hover:text-red-500 p-1"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Unread badge */}
      {!isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full" />
      )}
    </div>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.list();
        setNotifications(res.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);

        // fallback sample for dev
        setNotifications([
          {
            id: "sample1",
            title: "Test Notification",
            message: "This is a fallback message",
            created_at: Math.floor(Date.now() / 1000)
          }
        ]);
      }
    };

    fetchNotifications();
  }, []);

  // DELETE
  const deleteNotification = async (id) => {
    try {
      await notificationService.remove(id);
      setNotifications(notifications.filter(n => (n.id || n._id) !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  // CLEAR ALL → mark all as read
  const clearAllNotifications = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  // GROUP BY DATE
  const grouped = {};
  notifications.forEach(n => {
    const time = n.created_at
      ? new Date(n.created_at * 1000)
      : new Date();

    const dateKey = time.toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(n);
  });

  const sortedGroups = Object.entries(grouped).sort(
    ([d1], [d2]) => new Date(d2) - new Date(d1)
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="sticky top-0 bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold text-black">Notifications</h1>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FiBell size={30} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 text-sm">You're all caught up!</p>
        </div>
      )}

      {/* Notifications list */}
      <div className="p-4">
        {sortedGroups.map(([date, items]) => (
          <div key={date} className="mb-6">

            <p className="text-gray-500 text-sm mb-2">
              {formatDateGroup(date)}
            </p>

            <div className="space-y-2">
              {items.map(n => (
                <NotificationItem
                  key={n.id || n._id}
                  notification={n}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}