import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RequestCard from '../components/RequestCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiErrorMessage } from '../utils/apiError';

const Requests = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [loadError, setLoadError] = useState('');

  const fetchRequests = async () => {
    try {
      const { data } = await api.get(`/requests?type=${tab}`);
      setRequests(data.data);
      setLoadError('');
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load requests'));
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const handleAccept = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'accepted' });
      fetchRequests();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to accept request'));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}`, { status: 'rejected' });
      fetchRequests();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to reject request'));
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/requests/${id}/complete`);
      fetchRequests();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to complete request'));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-6">Skill Requests</h1>

          <div className="flex gap-2 mb-6">
            {['received', 'sent'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                  tab === t
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loadError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {loadError}
            </div>
          )}

          <div className="space-y-4">
            {requests.map((r) => (
              <RequestCard
                key={r._id}
                request={r}
                isReceived={tab === 'received'}
                currentUserId={user?._id}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onReview={openReview}
                onRefresh={fetchRequests}
              />
            ))}
            {requests.length === 0 && (
              <p className="text-center text-gray-500 py-12 glass-card">No {tab} requests</p>
            )}
          </div>
        </main>
      </div>

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              Review {reviewTarget.partner?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              After your skill swap: {reviewTarget.request.offeredSkill} ↔ {reviewTarget.request.wantedSkill}
            </p>
            {reviewError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 dark:border dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm">
                {reviewError}
              </div>
            )}
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="form-label">Rating</label>
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
              </div>
              <div>
                <label className="form-label">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="How was the skill exchange?"
                />
              </div>
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

export default Requests;
