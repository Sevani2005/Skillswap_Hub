import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Socket.io real-time chat handler
 */
export const initSocket = (io) => {
  // Track online users and typing state
  const onlineUsers = new Map();
  const typingUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user:online', { userId, isOnline: true });

    // Join personal room for direct messages
    socket.join(userId);

    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content,
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');

        io.to(receiverId).emit('message:receive', populated);
        socket.emit('message:sent', populated);
      } catch (err) {
        socket.emit('message:error', { message: err.message });
      }
    });

    socket.on('typing:start', ({ receiverId }) => {
      io.to(receiverId).emit('typing:start', { userId, name: socket.user.name });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      io.to(receiverId).emit('typing:stop', { userId });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:online', { userId, isOnline: false });
    });
  });
};
