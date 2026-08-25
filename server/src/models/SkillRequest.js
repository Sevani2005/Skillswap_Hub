import mongoose from 'mongoose';

const classSessionSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    status: {
      type: String,
      enum: ['open', 'proposed', 'confirmed', 'completed'],
      default: 'open',
    },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    proposedWhen: { type: String, default: '' },
    meetLink: { type: String, default: '' },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const skillRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offeredSkill: { type: String },
    wantedSkill: { type: String },
    message: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    /** Classes per skill (sender teaches offeredSkill; receiver teaches wantedSkill). */
    plannedSessionsPerSkill: { type: Number, default: 6, min: 1, max: 24 },
    /** Sender teaches offeredSkill — one skill per class, learner confirms time. */
    offeredSkillSessions: [classSessionSchema],
    /** Receiver teaches wantedSkill — separate from offered track. */
    wantedSkillSessions: [classSessionSchema],
    senderAvailability: { type: String, default: '' },
    receiverAvailability: { type: String, default: '' },
    // legacy — migrated on read
    plannedSessions: { type: Number },
    sessions: [classSessionSchema],
  },
  { timestamps: true }
);

skillRequestSchema.index(
  { sender: 1, receiver: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export const buildEmptySessions = (count) =>
  Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    status: 'open',
    proposedWhen: '',
    meetLink: '',
  }));

const SkillRequest = mongoose.model('SkillRequest', skillRequestSchema);
export default SkillRequest;
