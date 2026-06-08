import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers, FiMessageCircle, FiStar } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  { icon: FiUsers, title: 'Skill Matching', desc: 'Find people who offer what you need and want what you teach.' },
  { icon: FiMessageCircle, title: 'Real-Time Chat', desc: 'Connect instantly with typing indicators and online status.' },
  { icon: FiStar, title: 'Ratings & Reviews', desc: 'Build trust through community reviews after each session.' },
];

const Landing = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950 flex flex-col">
    <Navbar />

    <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
          Peer-to-peer skill exchange
        </span>
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 bg-clip-text text-transparent">
            Exchange Skills,
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">Not Money</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          SkillSwap Hub connects learners and teachers worldwide. Teach what you know, learn what you need — completely free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
            Start Swapping <FiArrowRight />
          </Link>
          <Link to="/browse" className="btn-secondary inline-flex items-center justify-center text-lg">
            Browse Skills
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full"
      >
        {features.map((f, i) => (
          <div key={i} className="glass-card p-8 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white mb-4">
              <f.icon size={24} />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </section>

    <Footer />
  </div>
);

export default Landing;
