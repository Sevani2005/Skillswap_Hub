import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getAvatarUrl } from '../utils/avatar';

const ChatWindow = ({ partner, onBack }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!partner) return;
    const load = async () => {
      const { data } = await api.get(`/messages/${partner._id}`);
      setMessages(data.data);
    };
    load();
  }, [partner?._id]);

  useEffect(() => {
    if (!socket || !partner) return;

    const onReceive = (msg) => {
      const partnerId = String(partner._id);
      const senderId = String(msg.sender?._id ?? msg.sender);
      const receiverId = String(msg.receiver?._id ?? msg.receiver);
      if (senderId === partnerId || receiverId === partnerId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const onSent = (msg) => setMessages((prev) => [...prev, msg]);
    const onTypingStart = ({ userId }) => {
      if (userId === partner._id) setTyping(true);
    };
    const onTypingStop = ({ userId }) => {
      if (userId === partner._id) setTyping(false);
    };

    socket.on('message:receive', onReceive);
    socket.on('message:sent', onSent);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:receive', onReceive);
      socket.off('message:sent', onSent);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, partner?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('message:send', { receiverId: partner._id, content: input.trim() });
    setInput('');
    socket.emit('typing:stop', { receiverId: partner._id });
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing:start', { receiverId: partner._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing:stop', { receiverId: partner._id });
      }, 2000);
    }
  };

  const isOnline = onlineUsers[partner?._id] ?? partner?.isOnline;

  return (
    <div className="flex flex-col h-full min-h-0 glass-card overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        {onBack && (
          <button onClick={onBack} className="lg:hidden text-primary-600 text-sm font-medium">
            ← Back
          </button>
        )}
        <div className="relative">
          <img src={getAvatarUrl(partner)} alt="" className="w-10 h-10 rounded-full object-cover" />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{partner?.name}</p>
          <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.map((msg) => {
          const isMine = msg.sender._id === user._id || msg.sender._id === user._id?.toString();
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
        {typing && (
          <p className="text-xs text-gray-500 italic">{partner?.name} is typing...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={handleInput}
          placeholder="Type a message..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary p-3">
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
