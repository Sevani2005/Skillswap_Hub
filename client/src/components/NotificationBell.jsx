import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import api from '../api/axios';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/requests?type=received&status=pending');
        setNotifications(
          data.data.map((r) => ({
            id: r._id,
            text: `${r.sender?.name} wants to exchange ${r.offeredSkill} for ${r.wantedSkill}`,
            link: '/requests',
          }))
        );
      } catch {
        /* ignore */
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600"
      >
        <FiBell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 glass-card p-3 shadow-xl z-50">
          <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Notifications</p>
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No new notifications</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link}
                    onClick={() => setOpen(false)}
                    className="block text-xs p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300"
                  >
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
