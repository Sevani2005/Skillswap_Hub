import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getApiErrorMessage } from '../utils/apiError';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8">
          <h2 className="font-display text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Sign in to continue swapping skills</p>

          {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 dark:border dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input-field w-full pr-10" 
                  required 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Register</Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Demo: alex@skillswap.demo / demo1234</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
