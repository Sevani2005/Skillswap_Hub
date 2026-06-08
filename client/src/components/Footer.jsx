import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => (
  <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-display font-bold text-lg">SkillSwap Hub</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
            Exchange skills, not money. Connect with talented people worldwide and grow together through peer-to-peer learning.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link to="/browse" className="hover:text-primary-600">Browse Skills</Link></li>
            <li><Link to="/register" className="hover:text-primary-600">Sign Up</Link></li>
            <li><Link to="/login" className="hover:text-primary-600">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Connect</h4>
          <div className="flex gap-4 text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-primary-600"><FiGithub size={20} /></a>
            <a href="#" className="hover:text-primary-600"><FiTwitter size={20} /></a>
            <a href="#" className="hover:text-primary-600"><FiLinkedin size={20} /></a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SkillSwap Hub. Built with passion for peer learning.
      </div>
    </div>
  </footer>
);

export default Footer;
