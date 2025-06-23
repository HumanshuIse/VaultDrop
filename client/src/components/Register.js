import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendRegisterOtp, register } from '../api';

const Register = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    const res = await sendRegisterOtp(email);
    setLoading(false);
    alert(res.message);
    if (res.message && res.message.toLowerCase().includes('otp sent')) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const res = await register(firstName, lastName, email, password, otp);
    setLoading(false);
    alert(res.message);
    if (res.token) {
      localStorage.setItem('token', res.token);
      if (onLogin) onLogin();
      navigate('/upload');
      return;
    }
    if (res.message && res.message.toLowerCase().includes('success')) {
      setStep(1);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setOtp('');
    }
  };

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white relative overflow-hidden">
        {/* Subtle shield/arrow watermark background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
        </div>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 w-full relative z-10 flex flex-col items-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900 dark:text-white">Register</h2>
          {step === 1 && (
            <>
              <input
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
              <input
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button
                className="w-full bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                onClick={handleSendOtp}
                disabled={loading || !email || !firstName || !lastName}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <span className="text-blue-700 dark:text-blue-300 cursor-pointer font-semibold" onClick={() => navigate('/login')}>Login</span>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <input
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg bg-blue-50"
                placeholder="Email"
                value={email}
                disabled
              />
              <input
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                placeholder="OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <input
                type="password"
                className="border border-blue-200 p-2 mb-4 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                onClick={handleRegister}
                disabled={loading || !otp || !password}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <span className="text-blue-700 dark:text-blue-300 cursor-pointer font-semibold" onClick={() => navigate('/login')}>Login</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
