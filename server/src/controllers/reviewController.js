import Review from '../models/Review.js';
import User from '../models/User.js';
import SkillRequest from '../models/SkillRequest.js';

// @desc    Create review
// @route   POST /api/reviews
export const createReview = async (req, res, next) => {
  try {
    const { revieweeId, skillRequestId, rating, comment } = req.body;

    if (!skillRequestId) {
      return res.status(400).json({ success: false, message: 'skillRequestId is required' });
    }

    const skillRequest = await SkillRequest.findById(skillRequestId);
    if (!skillRequest || skillRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a completed skill exchange',
      });
    }

    const reviewerId = String(req.user._id);
    const isParticipant =
      String(skillRequest.sender) === reviewerId ||
      String(skillRequest.receiver) === reviewerId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not part of this exchange' });
    }

    const expectedReviewee =
      String(skillRequest.sender) === reviewerId
        ? String(skillRequest.receiver)
        : String(skillRequest.sender);
    if (String(revieweeId) !== expectedReviewee) {
      return res.status(400).json({ success: false, message: 'Invalid reviewee for this exchange' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      skillRequest: skillRequestId,
      rating,
      comment,
    });

    // Update average rating
    const stats = await Review.aggregate([
      { $match: { reviewee: review.reviewee } },
      {
        $group: {
          _id: '$reviewee',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length) {
      await User.findByIdAndUpdate(revieweeId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this skill exchange',
      });
    }
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};
