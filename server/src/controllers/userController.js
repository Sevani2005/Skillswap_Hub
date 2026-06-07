import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all users (browse)
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (req.user?._id) {
      filter._id = { $ne: req.user._id };
    }

    const conditions = [];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { 'skillsOffered.name': { $regex: search, $options: 'i' } },
          { 'skillsWanted.name': { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (category) {
      conditions.push({
        $or: [
          { 'skillsOffered.category': category },
          { 'skillsWanted.category': category },
        ],
      });
    }

    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$and = conditions;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ averageRating: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const fields = [
      'name',
      'bio',
      'skillsOffered',
      'skillsWanted',
      'socialLinks',
      'avatar',
    ];
    const updates = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Check if Cloudinary credentials are configured
const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return (
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  );
};

// @desc    Upload avatar (Cloudinary if configured, else store locally as base64)
// @route   POST /api/users/avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    let avatarUrl = req.body.image;

    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: 'skillswap/avatars',
        width: 400,
        height: 400,
        crop: 'fill',
      });
      avatarUrl = result.secure_url;
    } else {
      // Dev fallback: save image directly (skip Cloudinary setup)
      if (req.body.image.length > 600000) {
        return res.status(400).json({
          success: false,
          message: 'Image too large. Use a photo under 500KB or configure Cloudinary.',
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard
export const getTeacherBadge = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const SkillRequest = (await import('../models/SkillRequest.js')).default;
    const completed = await SkillRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'completed',
    });
    const user = await User.findById(userId).select('averageRating');
    const rating = user?.averageRating ?? 0;
    let badge = 'Starter';
    if (completed >= 20 && rating >= 4.5) badge = 'Expert';
    else if (completed >= 5 && rating >= 3.5) badge = 'Experienced';
    res.json({ success: true, data: { badge, completed, rating } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const SkillRequest = (await import('../models/SkillRequest.js')).default;
    const Message = (await import('../models/Message.js')).default;

    const userId = req.user._id;

    const [received, sent, recentMessages, conversationStats] = await Promise.all([
      SkillRequest.find({ receiver: userId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5),
      SkillRequest.find({ sender: userId })
        .populate('receiver', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5),
      Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
        .populate('sender', 'name avatar isOnline meetingLink')
        .populate('receiver', 'name avatar isOnline meetingLink')
        .sort({ createdAt: -1 })
        .limit(10),
      // Count unique people (conversations), not total messages
      Message.aggregate([
        { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
        {
          $project: {
            partner: {
              $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
            },
          },
        },
        { $group: { _id: '$partner' } },
        { $count: 'total' },
      ]),
    ]);

    const chatCount = conversationStats[0]?.total ?? 0;

    res.json({
      success: true,
      data: {
        user: req.user,
        requestsReceived: received,
        requestsSent: sent,
        chatCount,
        recentMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};
