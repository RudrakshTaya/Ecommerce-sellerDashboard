import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../lib/store';

const Notification: React.FC = () => {
  const { notification, hideNotification } = useUIStore();

  useEffect(() => {
    if (notification?.isVisible) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification?.isVisible, hideNotification]);

  if (!notification?.isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const Icon = icons[notification.type];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`
          ${colors[notification.type]}
          border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out
          ${notification.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${iconColors[notification.type]} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={hideNotification}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
