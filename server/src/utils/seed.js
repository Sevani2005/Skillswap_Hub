import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import SkillRequest from '../models/SkillRequest.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Alex Chen',
    email: 'alex@skillswap.demo',
    password: 'demo1234',
    bio: 'Full-stack developer passionate about teaching React and learning design.',
    skillsOffered: [
      { name: 'React', category: 'Technology', level: 'Expert' },
      { name: 'Node.js', category: 'Technology', level: 'Advanced' },
    ],
    skillsWanted: [
      { name: 'UI/UX Design', category: 'Design', level: 'Intermediate' },
      { name: 'Figma', category: 'Design', level: 'Beginner' },
    ],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Maria Garcia',
    email: 'maria@skillswap.demo',
    password: 'demo1234',
    bio: 'Graphic designer offering creative skills. Want to learn coding!',
    skillsOffered: [
      { name: 'UI/UX Design', category: 'Design', level: 'Expert' },
      { name: 'Figma', category: 'Design', level: 'Expert' },
    ],
    skillsWanted: [
      { name: 'React', category: 'Technology', level: 'Beginner' },
      { name: 'JavaScript', category: 'Technology', level: 'Beginner' },
    ],
  },
  {
    name: 'James Wilson',
    email: 'james@skillswap.demo',
    password: 'demo1234',
    bio: 'Spanish tutor and language enthusiast. Exchange languages!',
    skillsOffered: [
      { name: 'Spanish', category: 'Languages', level: 'Expert' },
      { name: 'Public Speaking', category: 'Business', level: 'Advanced' },
    ],
    skillsWanted: [
      { name: 'Photography', category: 'Creative', level: 'Intermediate' },
      { name: 'Guitar', category: 'Music', level: 'Beginner' },
    ],
  },
  {
    name: 'Priya Sharma',
    email: 'priya@skillswap.demo',
    password: 'demo1234',
    bio: 'Data scientist who loves yoga and wants to learn guitar.',
    skillsOffered: [
      { name: 'Python', category: 'Technology', level: 'Expert' },
      { name: 'Machine Learning', category: 'Technology', level: 'Advanced' },
    ],
    skillsWanted: [
      { name: 'Guitar', category: 'Music', level: 'Beginner' },
      { name: 'Spanish', category: 'Languages', level: 'Beginner' },
    ],
  },
];

export const seedDatabase = async (shouldExit = true) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.error('Refusing to seed: NODE_ENV is production');
      if (shouldExit) process.exit(1);
      return;
    }

    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      SkillRequest.deleteMany({}),
      Message.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('Database cleared');

    const users = await User.create(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create sample requests
    const requests = await SkillRequest.create([
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        offeredSkill: 'React',
        wantedSkill: 'UI/UX Design',
        message: 'Would love to exchange React tutoring for design feedback!',
        status: 'pending',
      },
      {
        sender: users[2]._id,
        receiver: users[3]._id,
        offeredSkill: 'Spanish',
        wantedSkill: 'Python',
        message: 'Happy to teach Spanish basics for Python intro sessions.',
        status: 'completed',
      },
    ]);

    // Sample messages
    await Message.create([
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        content: 'Hi Maria! I saw your design portfolio — amazing work!',
      },
      {
        sender: users[1]._id,
        receiver: users[0]._id,
        content: 'Thanks Alex! I would love to learn React from you.',
      },
    ]);

    // Sample review (linked to completed exchange)
    await Review.create({
      reviewer: users[3]._id,
      reviewee: users[2]._id,
      skillRequest: requests[1]._id,
      rating: 5,
      comment: 'James is an incredible teacher. Very patient and knowledgeable!',
    });

    await User.findByIdAndUpdate(users[2]._id, { averageRating: 5, reviewCount: 1 });

    console.log('Seed data created successfully!');
    console.log('\nDemo accounts (password: demo1234):');
    sampleUsers.forEach((u) => console.log(`  - ${u.email}`));

    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed error:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

if (process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed'))) {
  seedDatabase(true);
}
