import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkshops, createWorkshop } from '../api/workshopApi';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaUsers, FaClock, FaCalendarAlt } from 'react-icons/fa';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillCategory: 'General',
    maxAttendees: 10,
    date: '',
    duration: 60,
    meetLink: ''
  });

  const fetchWorkshops = async () => {
    try {
      const res = await getWorkshops();
      setWorkshops(res.data);
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWorkshop(formData);
      setShowModal(false);
      fetchWorkshops();
    } catch (error) {
      console.error('Failed to create workshop:', error);
      alert(error.response?.data?.message || 'Failed to create workshop');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading workshops...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Masterclasses & Workshops</h1>
          <p className="text-gray-600 mt-2">Learn from experts in group sessions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <FaPlus /> Host a Workshop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map(w => (
          <div key={w._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">{w.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{w.description}</p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-500" />
                {new Date(w.date).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-indigo-500" />
                {w.duration} mins
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-indigo-500" />
                {w.attendees?.length || 0} / {w.maxAttendees} attendees
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <img src={w.host?.avatar || 'https://via.placeholder.com/40'} alt="host" className="w-8 h-8 rounded-full" />
                {w.host?.name}
              </div>
              <Link
                to={`/workshops/${w._id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        ))}
        {workshops.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No upcoming workshops found. Be the first to host one!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Host a Workshop</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Attendees</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="100"
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={formData.maxAttendees}
                    onChange={e => setFormData({...formData, maxAttendees: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skill Category</label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={formData.skillCategory}
                    onChange={e => setFormData({...formData, skillCategory: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Link (e.g. Zoom, Google Meet)</label>
                <input
                  type="url"
                  required
                  className="w-full mt-1 p-2 border rounded-lg"
                  value={formData.meetLink}
                  onChange={e => setFormData({...formData, meetLink: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workshops;
