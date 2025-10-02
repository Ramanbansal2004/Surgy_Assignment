import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Use Redis or a database in production for a scalable OTP store
const otpStore = {};

export const sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
        console.log({
            body: `Your verification code is ${otp}`,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:+91${phone}`
        }); // For development, replaces actual SMS
        await twilioClient.messages.create({
            body: `Your verification code is ${otp}`,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${phone}`
        });
        
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);
        
        otpStore[phone] = { otp: hashedOtp, expires };

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
};

export const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone and OTP are required.' });
    }

    const otpData = otpStore[phone];

    if (!otpData || otpData.expires < Date.now()) {
        return res.status(400).json({ message: 'OTP expired or invalid.' });
    }

    const isValid = await bcrypt.compare(otp, otpData.otp);
    if (!isValid) {
        return res.status(400).json({ message: 'Invalid OTP.' });
    }

    delete otpStore[phone]; // OTP is used, so delete it

    try {
        const user = await User.findOne({ phone });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.status(200).json({
                message: 'Login successful.',
                token,
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
                isNewUser: false
            });
        } else {
            res.status(200).json({ message: 'OTP verified. Please complete registration.', isNewUser: true });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        user = new User({ name, email, phone });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};