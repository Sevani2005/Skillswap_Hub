import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SkillCard from '../components/SkillCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiErrorMessage } from '../utils/apiError';

const CATEGORIES = ['All', 'Technology', 'Design', 'Languages', 'Business', 'Creative', 'Music'];

const BrowseSkills = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [requestModal, setRequestModal] = useState(null);
  const [form, setForm] = useState({ offeredSkill: '', wantedSkill: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const { data } = await api.get('/users', { params });
      setUsers(data.data);
      setLoadError('');
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  const openRequest = (targetUser) => {
    if (!user) {
      navigate('/login', { state: { from: '/browse' } });
      return;
    }
    setRequestModal(targetUser);
  };

  useEffect(() => {
    fetchUsers();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        receiverId: requestModal._id,
        ...form,
      });
      alert('Request sent successfully!');
      setRequestModal(null);
      setForm({ offeredSkill: '', wantedSkill: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {user && <Sidebar />}
        <main className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-6">Browse Skills</h1>

          <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by skill or name..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Search</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === 'All' ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    (category === cat || (!category && cat === 'All'))
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((u, i) => (
                  <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <SkillCard user={u} onRequest={openRequest} />
                  </motion.div>
                ))}
              </div>

              {users.length === 0 && !loadError && (
                <p className="text-center text-gray-500 py-12">No users found. Try a different search.</p>
              )}
            </>
          )}
        </main>
      </div>

      {requestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Send request to {requestModal.name}</h3>
            <form onSubmit={sendRequest} className="space-y-4">
              <input
                placeholder="Skill you offer"
                value={form.offeredSkill}
                onChange={(e) => setForm({ ...form, offeredSkill: e.target.value })}
                className="input-field"
              />
                <input
                  placeholder="Skill you want"
                  value={form.wantedSkill}
                  onChange={(e) => setForm({ ...form, wantedSkill: e.target.value })}
                  className="input-field"
                />
              <textarea
                placeholder="Message (optional)"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field"
                rows={3}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setRequestModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Send Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BrowseSkills;
