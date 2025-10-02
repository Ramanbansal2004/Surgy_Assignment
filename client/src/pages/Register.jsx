import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.phone) {
            setFormData(prev => ({ ...prev, phone: location.state.phone }));
        } else {
            // If no phone number is passed, redirect to login
            navigate('/');
        }
    }, [location.state, navigate]);

    const { name, email, phone } = formData;
    const api = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL });

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/register', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">Complete Your Profile</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-gray-400">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={onChange}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-400">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={onChange}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="phone" className="text-sm font-medium text-gray-400">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={phone}
                            disabled
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-600 border border-gray-500 rounded-md cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center"
                    >
                        {loading ? <Spinner /> : 'Register'}
                    </button>
                </form>
                {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default Register;