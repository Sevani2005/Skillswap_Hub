import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-6xl font-bold text-primary-600 mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">This page does not exist.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
