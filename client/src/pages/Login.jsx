import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const api = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
            setError('Please enter a valid phone number with country code (e.g., +919876543210).');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/send-otp', { phone });
            setShowOtpInput(true);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/verify-otp', { phone, otp });
            console.log(data.isNewUser);
            if (data.isNewUser) {
                // Navigate to registration page with phone number
                navigate('/register', { state: { phone } });
            } else {
                // Login successful, save token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP.');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">Login or Sign Up</h2>
                {!showOtpInput ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="text-sm font-medium text-gray-400">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+919876543210"
                                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center"
                        >
                            {loading ? <Spinner /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="text-sm font-medium text-gray-400">
                                One-Time Password (OTP)
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength="6"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center"
                        >
                            {loading ? <Spinner /> : 'Verify OTP'}
                        </button>
                    </form>
                )}
                {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default Login;