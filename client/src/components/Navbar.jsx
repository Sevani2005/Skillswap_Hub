import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { getAvatarUrl } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between"
    >
      <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
        <span className="font-display font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          SkillSwap Hub
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/browse" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Browse
            </Link>
            <Link to="/requests" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Requests
            </Link>
            <Link to="/chat" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Chat
            </Link>
            <Link to="/workshops" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Workshops
            </Link>
            <NotificationBell />
            <Link to={`/profile/${user._id}`}>
              <img
                src={getAvatarUrl(user)}
                alt={user.name}
                className="w-9 h-9 rounded-full ring-2 ring-primary-400 object-cover"
              />
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
              <FiLogOut size={20} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
