import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('token', res.token);
      onLogin();
      navigate('/upload', { replace: true });
    } else {
      alert(res.message || "Login failed");
    }
  };

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black relative overflow-hidden">
        {/* Subtle shield/arrow watermark background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
        </div>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 w-full relative z-10 flex flex-col items-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900 dark:text-white">Login</h2>
          <input
            className="border border-blue-200 dark:border-gray-700 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="border border-blue-200 dark:border-gray-700 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <span className="text-blue-700 dark:text-blue-300 cursor-pointer font-semibold" onClick={() => navigate('/register')}>Signup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
