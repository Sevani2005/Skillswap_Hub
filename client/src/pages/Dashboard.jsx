import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiInbox, FiSend, FiMessageSquare } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { getAvatarUrl } from '../utils/avatar';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [loadError, setLoadError] = useState('');

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/users/dashboard');
      setData(res.data);
      setLoadError('');
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAccept = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'accepted' });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'rejected' });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/requests/${id}/complete`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete request');
    }
  };

  const openReview = (request) => {
    const partner =
      String(request.sender?._id) === String(user?._id) ? request.receiver : request.sender;
    setReviewTarget({ request, partner });
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setReviewError('');
    try {
      await api.post('/reviews', {
        revieweeId: reviewTarget.partner._id,
        skillRequestId: reviewTarget.request._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      alert('Review submitted!');
      setReviewTarget(null);
    } catch (err) {
      setReviewError(getApiErrorMessage(err, 'Failed to submit review'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 dark:text-red-400">{loadError}</p>
        <button type="button" onClick={() => { setLoading(true); fetchDashboard(); }} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {data?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your skill exchanges.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: FiInbox, label: 'Received', count: data?.requestsReceived?.length, color: 'from-primary-500 to-purple-500' },
              { icon: FiSend, label: 'Sent', count: data?.requestsSent?.length, color: 'from-accent-500 to-blue-500' },
              { icon: FiMessageSquare, label: 'Chats', count: data?.chatCount, color: 'from-green-500 to-teal-500' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count || 0}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Requests Received</h2>
              <Link to="/requests" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {data?.requestsReceived?.length ? (
                data.requestsReceived.map((r) => (
                  <RequestCard
                    key={r._id}
                    request={r}
                    isReceived
                    currentUserId={user?._id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onComplete={handleComplete}
                    onReview={openReview}
                    onRefresh={fetchDashboard}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm glass-card p-6 text-center">No pending requests</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="glass-card p-4 space-y-2">
              {data?.recentMessages?.length ? (
                data.recentMessages.slice(0, 5).map((msg, i) => {
                  const partner =
                    String(msg.sender._id) === String(data.user._id) ? msg.receiver : msg.sender;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <img src={getAvatarUrl(partner)} alt="" className="w-8 h-8 rounded-full" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{msg.content}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent messages</p>
              )}
            </div>
          </section>
        </main>
      </div>

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Review {reviewTarget.partner?.name}
            </h3>
            {reviewError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 dark:border dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm">
                {reviewError}
              </div>
            )}
            <form onSubmit={submitReview} className="space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                    className={`text-2xl ${n <= reviewForm.rating ? 'text-amber-400' : 'text-gray-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="How was the skill exchange?"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setReviewTarget(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
