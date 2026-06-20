import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiSearch,
  FiMessageSquare,
  FiInbox,
  FiUser,
  FiEdit3,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const links = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/browse', icon: FiSearch, label: 'Browse Skills' },
  { to: '/requests', icon: FiInbox, label: 'Requests' },
  { to: '/chat', icon: FiMessageSquare, label: 'Messages' },
  { to: '/profile/me', icon: FiUser, label: 'My Profile' },
  { to: '/profile/edit', icon: FiEdit3, label: 'Edit Profile' },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex flex-col w-64 shrink-0 glass-card p-4 h-fit sticky top-24"
    >
      <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-primary-50 dark:bg-gray-700 dark:border dark:border-gray-600">
        <img src={getAvatarUrl(user)} alt="" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
