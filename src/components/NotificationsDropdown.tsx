import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Heart, MessageCircle, UserPlus, AtSign, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Notification, markNotificationAsRead, markAllNotificationsAsRead } from '../lib/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'mention':
      return <AtSign className="w-5 h-5 text-purple-500" />;
    default:
      return <Settings className="w-5 h-5 text-gray-500" />;
  }
};

export default function NotificationsDropdown({
  notifications,
  onClose,
  onMarkAllRead,
}: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type and reference
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.reference_id) {
          navigate(`/post/${notification.reference_id}`);
        }
        break;
      case 'follow':
      case 'mention':
        if (notification.reference_id) {
          navigate(`/profile/${notification.reference_id}`);
        }
        break;
      default:
        break;
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    await markAllNotificationsAsRead();
    onMarkAllRead();
    setIsMarkingRead(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-16 right-4 w-96 bg-white dark:bg-amoled rounded-xl shadow-xl z-50 border dark:border-gray-800"
    >
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">Notifications</h3>
          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.is_read) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllRead}
                disabled={isMarkingRead}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-full"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No notifications yet
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-amoled-light cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 