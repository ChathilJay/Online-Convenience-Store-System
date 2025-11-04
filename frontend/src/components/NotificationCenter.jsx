import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Package, CreditCard, FileText, CheckCircle, AlertTriangle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const eventSourceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      connectSSE();
      loadPersistedNotifications();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPersistedNotifications = () => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsedNotifications = JSON.parse(stored);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
    }
  };

  const persistNotifications = (newNotifications) => {
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const connectSSE = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const eventSource = new EventSource(
        `http://127.0.0.1:5000/api/sse/notifications?token=${token}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            console.log('SSE connected:', data.message);
            return;
          }

          const notification = {
            id: Date.now(),
            type: data.type,
            message: formatNotificationMessage(data),
            data: data.data,
            timestamp: new Date(data.timestamp * 1000).toISOString(),
            read: false
          };

          setNotifications(prev => {
            const updated = [notification, ...prev].slice(0, 50); // Keep last 50
            persistNotifications(updated);
            return updated;
          });
          setUnreadCount(prev => prev + 1);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        // Retry connection after 5 seconds
        setTimeout(() => {
          if (isAuthenticated) {
            connectSSE();
          }
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error connecting to SSE:', error);
    }
  };

  const formatNotificationMessage = (data) => {
    switch (data.type) {
      case 'order_status_update':
        return `Order #${data.data.order_id} status changed from ${data.data.old_status} to ${data.data.new_status}`;
      case 'payment_update':
        return `Payment for Order #${data.data.order_id} is ${data.data.payment_status}`;
      case 'invoice_generated':
        return `Invoice ${data.data.invoice_number} generated for Order #${data.data.order_id}`;
      case 'order_created':
        return `Order #${data.data.order_id} created successfully! Total: $${data.data.total_amount.toFixed(2)}`;
      case 'payment_failed':
        return `Payment failed for Order #${data.data.order_id}: ${data.data.reason}`;
      case 'low_stock_alert':
        return `⚠️ Low stock alert: ${data.data.product_name} only has ${data.data.stock} items left`;
      default:
        return 'New notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_status_update':
        return <Package size={18} className="text-blue-600" />;
      case 'payment_update':
        return <CreditCard size={18} className="text-green-600" />;
      case 'invoice_generated':
        return <FileText size={18} className="text-purple-600" />;
      case 'order_created':
        return <ShoppingBag size={18} className="text-emerald-600" />;
      case 'payment_failed':
        return <AlertTriangle size={18} className="text-red-600" />;
      case 'low_stock_alert':
        return <AlertTriangle size={18} className="text-orange-600" />;
      default:
        return <CheckCircle size={18} className="text-gray-600" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persistNotifications(updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const updated = prev.filter(n => n.id !== id);
      persistNotifications(updated);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
