import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import api from '../api/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { getAvatarUrl } from '../utils/avatar';

const Chat = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/messages');
        setConversations(data.data);
        setLoadError('');
      } catch (err) {
        setLoadError(getApiErrorMessage(err, 'Failed to load conversations'));
      }
    };
    load();
  }, []);

  useEffect(() => {
    const partnerId = location.state?.partnerId;
    const partner = location.state?.partner;

    if (partner) {
      setSelected(partner);
      setConversations((prev) => {
        if (prev.some((c) => String(c.partner._id) === String(partner._id))) return prev;
        return [{ partner, lastMessage: null, unread: 0 }, ...prev];
      });
      return;
    }

    if (!partnerId || !conversations.length) return;
    const match = conversations.find((c) => String(c.partner._id) === String(partnerId));
    if (match) setSelected(match.partner);
  }, [conversations, location.state]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1 flex gap-4 h-[calc(100vh-140px)]">
          <div className={`w-full lg:w-80 glass-card overflow-hidden flex flex-col ${selected ? 'hidden lg:flex' : ''}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadError && (
                <p className="p-4 text-sm text-red-600 dark:text-red-400">{loadError}</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.partner._id}
                  onClick={() => setSelected(conv.partner)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selected?._id === conv.partner._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="relative">
                    <img src={getAvatarUrl(conv.partner)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    {conv.partner.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{conv.partner.name}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="p-6 text-center text-gray-500 text-sm">No conversations yet</p>
              )}
            </div>
          </div>

          <div className={`flex-1 ${!selected ? 'hidden lg:flex items-center justify-center' : ''}`}>
            {selected ? (
              <ChatWindow partner={selected} onBack={() => setSelected(null)} />
            ) : (
              <div className="glass-card p-12 text-center text-gray-500 w-full">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
