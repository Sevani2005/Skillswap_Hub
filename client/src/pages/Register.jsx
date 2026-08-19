import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getApiErrorMessage } from '../utils/apiError';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8">
          <h2 className="font-display text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Join SkillSwap Hub</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Create your free account today</p>

          {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-950 dark:border dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input 
                  name="password" autoComplete="new-password" 
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={handleChange} 
                  className="input-field w-full pr-10" 
                  minLength={6} 
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
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input 
                  name="confirm" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={form.confirm} 
                  onChange={handleChange} 
                  className="input-field w-full pr-10" 
                  required 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
