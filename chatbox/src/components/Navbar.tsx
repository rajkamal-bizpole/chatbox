// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import  http from "../api/http";
// Define User interface
interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

interface AuthFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const Navbar: React.FC = () => {
  const menuItems = [
    'Incorporation',
    'IPR',
    'Taxes',
    'Compliances Package',
    'Blog'
  ];

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [authForm, setAuthForm] = useState<AuthFormData>({
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in by verifying the cookie
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await http.get('/api/auth/verify');
      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await http.post('/api/auth/logout');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await http.post('/api/auth/login', {
        email: authForm.email,
        password: authForm.password
      });

      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
        setShowLoginModal(false);
        setAuthForm({ username: '', email: '', phone: '', password: '' });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await http.post('/api/auth/signup', {
        username: authForm.username,
        email: authForm.email,
        phone: authForm.phone,
        password: authForm.password
      });

      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.user);
        setShowSignupModal(false);
        setAuthForm({ username: '', email: '', phone: '', password: '' });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setError('');
    setAuthForm({ username: '', email: '', phone: '', password: '' });
  };



  return (
    <>
      <nav className="flex justify-between items-center py-6">
        {/* Logo */}
        <div className="flex items-center h-[150px] w-[150px]">
          <span className="text-2xl font-bold text-gray-800">
            <img src="logo.png" alt="Logo" />
          </span>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8">
          {menuItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-gray-600 hover:text-accent font-medium transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-gray-600 block">Welcome, {user?.username}</span>
              
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-accent font-medium transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowSignupModal(true);
                  setError('');
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign Up</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={authForm.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={authForm.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="+1 (555) 123-4567 (optional)"
                  pattern="[\+\d\s\-\(\)]{10,}"
                  title="Please enter a valid phone number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Include country code (e.g., +1 for US)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                onClick={() => {
                  setShowSignupModal(false);
                  setShowLoginModal(true);
                  setError('');
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;