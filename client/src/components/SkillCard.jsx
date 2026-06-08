import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiSend, FiMessageSquare } from 'react-icons/fi';
import { getAvatarUrl } from '../utils/avatar';
import { useAuth } from '../context/AuthContext';

const SkillCard = ({ user, onRequest }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleMessage = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: '/browse' } });
      return;
    }
    navigate('/chat', { state: { partner: user } });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={getAvatarUrl(user)}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary-200 dark:ring-primary-800"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{user.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 text-sm mt-1">
            <FiStar className="fill-current" />
            <span>{user.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-400">({user.reviewCount || 0})</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
        {user.bio || 'No bio yet'}
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase mb-1">Offers</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsOffered?.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase mb-1">Wants</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsWanted?.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-accent-100 dark:bg-blue-900/40 text-accent-600 dark:text-accent-400">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link to={`/profile/${user._id}`} className="btn-secondary flex-1 text-center text-sm py-2">
          Profile
        </Link>
        <button
          onClick={handleMessage}
          className="btn-secondary px-3 py-2 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600"
          title="Message user"
        >
          <FiMessageSquare size={16} />
        </button>
        <button onClick={() => onRequest?.(user)} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1">
          <FiSend size={14} /> Request
        </button>
      </div>
    </motion.div>
  );
};

export default SkillCard;
