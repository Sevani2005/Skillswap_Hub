import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkshopById, joinWorkshop, leaveWorkshop } from '../api/workshopApi';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaUsers, FaVideo, FaArrowLeft, FaCheck } from 'react-icons/fa';

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkshop = async () => {
    try {
      const res = await getWorkshopById(id);
      setWorkshop(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workshop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshop();
  }, [id]);

  const handleJoin = async () => {
    try {
      await joinWorkshop(id);
      fetchWorkshop();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    try {
      if (window.confirm('Are you sure you want to leave this workshop?')) {
        await leaveWorkshop(id);
        fetchWorkshop();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading workshop...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!workshop) return null;

  const isHost = workshop.host?._id === user?._id;
  const isAttending = workshop.attendees?.some(a => a._id === user?._id);
  const isFull = workshop.attendees?.length >= workshop.maxAttendees;
  const isPast = new Date(workshop.date) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/workshops')}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition"
      >
        <FaArrowLeft /> Back to Workshops
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold mb-4">
              {workshop.skillCategory}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{workshop.title}</h1>
            <p className="text-gray-700 text-lg whitespace-pre-wrap mb-8">{workshop.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm"><FaCalendarAlt className="text-indigo-600 text-xl" /></div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-900">{new Date(workshop.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm"><FaClock className="text-indigo-600 text-xl" /></div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">{workshop.duration} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm"><FaUsers className="text-indigo-600 text-xl" /></div>
                <div>
                  <p className="text-sm text-gray-500">Attendees</p>
                  <p className="font-semibold text-gray-900">{workshop.attendees?.length || 0} / {workshop.maxAttendees}</p>
                </div>
              </div>
              {(isHost || isAttending) && (
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-full shadow-sm"><FaVideo className="text-green-600 text-xl" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Meeting Link</p>
                    <a href={workshop.meetLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline">
                      Join Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-72 bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Hosted By</h3>
            <img 
              src={workshop.host?.avatar || 'https://via.placeholder.com/100'} 
              alt="host" 
              className="w-24 h-24 rounded-full mb-4 shadow-md object-cover border-4 border-white"
            />
            <h4 className="text-xl font-bold text-gray-900">{workshop.host?.name}</h4>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{workshop.host?.bio}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-200">
              {isPast ? (
                <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-xl font-semibold">
                  Workshop Ended
                </button>
              ) : isHost ? (
                <button disabled className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold">
                  You are hosting
                </button>
              ) : isAttending ? (
                <button onClick={handleLeave} className="w-full py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-xl font-semibold transition">
                  Leave Workshop
                </button>
              ) : isFull ? (
                <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-xl font-semibold">
                  Class Full
                </button>
              ) : (
                <button onClick={handleJoin} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition">
                  Join Workshop
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Attendees ({workshop.attendees?.length || 0})</h3>
          {workshop.attendees?.length === 0 ? (
            <p className="text-gray-500 italic">No attendees yet. Be the first to join!</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {workshop.attendees.map(user => (
                <div key={user._id} className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                  <img src={user.avatar || 'https://via.placeholder.com/40'} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;
