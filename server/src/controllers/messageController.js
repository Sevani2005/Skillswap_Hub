import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat list (unique conversations)
// @route   GET /api/messages
export const getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name avatar isOnline')
      .populate('receiver', 'name avatar isOnline')
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const partnerId =
        msg.sender._id.toString() === req.user._id.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversationMap.has(partnerId)) {
        const partner =
          msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unread: 0,
        });
      }
    });

    // Count unread per partner
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          read: false,
        },
      },
      { $group: { _id: '$sender', count: { $sum: 1 } } },
    ]);

    unreadCounts.forEach(({ _id, count }) => {
      const conv = conversationMap.get(_id.toString());
      if (conv) conv.unread = count;
    });

    res.json({
      success: true,
      data: Array.from(conversationMap.values()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (REST fallback)
// @route   POST /api/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
