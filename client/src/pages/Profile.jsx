import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiGithub, FiLinkedin, FiGlobe, FiSend, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../utils/apiError';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getAvatarUrl } from '../utils/avatar';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ offeredSkill: '', wantedSkill: '', message: '' });
  const [requestError, setRequestError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const profileId = id === 'me' ? currentUser?._id : id;
  const isOwnProfile = currentUser?._id === profile?._id;

  useEffect(() => {
    if (id === 'me' && !currentUser) {
      setLoading(false);
      return;
    }
    if (!profileId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [userRes, reviewsRes] = await Promise.all([
          api.get(`/users/${profileId}`),
          api.get(`/reviews/${profileId}`),
        ]);
        setProfile(userRes.data.data);
        setReviews(reviewsRes.data.data);
        setLoadError('');
      } catch (err) {
        setLoadError(getApiErrorMessage(err, 'Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profileId, id, currentUser]);

  const sendRequest = async (e) => {
    e.preventDefault();
    setRequestError('');
    try {
      await api.post('/requests', {
        receiverId: profile._id,
        ...requestForm,
      });
      alert('Request sent successfully!');
      setShowRequest(false);
      setRequestForm({ offeredSkill: '', wantedSkill: '', message: '' });
    } catch (err) {
      setRequestError(getApiErrorMessage(err, 'Failed to send request'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center text-gray-600 dark:text-gray-400">
          {loadError || 'Profile not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {currentUser && <Sidebar />}
        <main className="flex-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img src={getAvatarUrl(profile)} alt="" className="w-32 h-32 rounded-2xl object-cover ring-4 ring-primary-200" />
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-amber-500">
                  <FiStar className="fill-current" />
                  <span className="font-semibold">{profile.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500 text-sm">({profile.reviewCount || 0} reviews)</span>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{profile.bio || 'No bio yet'}</p>
                <div className="flex gap-4 mt-4">
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github} className="text-gray-500 hover:text-primary-600"><FiGithub size={20} /></a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} className="text-gray-500 hover:text-primary-600"><FiLinkedin size={20} /></a>
                  )}
                  {profile.socialLinks?.website && (
                    <a href={profile.socialLinks.website} className="text-gray-500 hover:text-primary-600"><FiGlobe size={20} /></a>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  {isOwnProfile ? (
                    <Link to="/profile/edit" className="btn-secondary text-sm py-2 px-4">
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowRequest(true)}
                        className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"
                      >
                        <FiSend size={16} /> Send Skill Request
                      </button>
                      <Link
                        to="/chat"
                        state={{ partner: profile }}
                        className="btn-secondary text-sm py-2 px-5 inline-flex items-center gap-2"
                      >
                        <FiMessageSquare size={16} /> Message
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="font-semibold text-primary-600 mb-3">Skills Offered</h3>
                <div className="space-y-2">
                  {profile.skillsOffered?.map((s, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-xl bg-primary-50 dark:bg-gray-700 dark:border dark:border-gray-600">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{s.level} · {s.category}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">None listed</p>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-accent-600 mb-3">Skills Wanted</h3>
                <div className="space-y-2">
                  {profile.skillsWanted?.map((s, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-xl bg-accent-50 dark:bg-gray-700 dark:border dark:border-gray-600">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{s.level} · {s.category}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">None listed</p>}
                </div>
              </div>
            </div>
          </motion.div>

          <section className="mt-6">
            <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={getAvatarUrl(r.reviewer)} alt="" className="w-8 h-8 rounded-full" />
                    <span className="font-medium text-sm">{r.reviewer?.name}</span>
                    <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet</p>}
            </div>
          </section>
        </main>
      </div>

      {showRequest && !isOwnProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
              Send request to {profile.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Offer a skill you teach and request one they offer.
            </p>
            {requestError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 dark:border dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm">
                {requestError}
              </div>
            )}
            <form onSubmit={sendRequest} className="space-y-4">
              <div>
                <label className="form-label">Skill you offer</label>
                <input
                  placeholder="e.g. React, Guitar"
                  value={requestForm.offeredSkill}
                  onChange={(e) => setRequestForm({ ...requestForm, offeredSkill: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Skill you want from them</label>
                <input
                  placeholder="e.g. UI/UX Design"
                  value={requestForm.wantedSkill}
                  onChange={(e) => setRequestForm({ ...requestForm, wantedSkill: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Message (optional)</label>
                <textarea
                  placeholder="Hi! I'd love to swap skills..."
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowRequest(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Send Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
