const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for cookies over HTTPS (required for Render)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// NoSQL Injection Protection
// app.use(mongoSanitize());

// HTTP Parameter Pollution Protection
app.use(hpp());

// Body parser
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP',
});

// Implementation of general limiter for all routes
app.use('/api/', generalLimiter);

// CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reimbursements', require('./routes/reimbursementRoutes'));

// Root endpoint
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

