import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skillCategory: { type: String, default: 'General' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxAttendees: { type: Number, default: 10, min: 2, max: 100 },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // duration in minutes
    meetLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    }
  },
  { timestamps: true }
);

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;
