require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Mount routes
const hospitalRoutes = require('./routes/hospitals');
app.use('/', hospitalRoutes);

// Read env vars with defaults for development
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_default_secret_change_this';

// Connect to MongoDB (safe to skip if not available)
mongoose.connect(MONGO_URI)
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => console.warn('MongoDB connection error (if running locally, make sure MongoDB is running):', err.message));

app.get('/', (req, res) => res.send('Backend server is running'));

// A small endpoint that demonstrates using the JWT secret to sign a token
app.get('/token', (req, res) => {
	const payload = { user: 'test-user', ts: Date.now() };
	const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
	// DO NOT expose JWT_SECRET in production. This is a demo only.
	res.json({ token });
});

// Debug endpoint to show which env vars are configured (mask secrets in outputs)
app.get('/env', (req, res) => {
	const maskedSecret = JWT_SECRET ? (JWT_SECRET.length > 8 ? `${JWT_SECRET.slice(0, 6)}...${JWT_SECRET.slice(-2)}` : '*****') : 'not-set';
	const maskedUri = MONGO_URI ? (MONGO_URI.includes('@') ? MONGO_URI.replace(/:\/\/(.*)@/, '://****:****@') : MONGO_URI) : 'not-set';
	res.json({ PORT, MONGO_URI: maskedUri, JWT_SECRET: maskedSecret });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception thrown:', err);
});

