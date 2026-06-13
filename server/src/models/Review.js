import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillRequest' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer: 1, skillRequest: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
