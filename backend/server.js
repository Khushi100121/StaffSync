import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import routes from './routes.js';

// ========================================
// Initialize Environment Variables
// ========================================

dotenv.config();

// ========================================
// Initialize Express Application
// ========================================

const app = express();
const PORT = process.env.PORT || 4000;

// ========================================
// Middleware Configuration
// ========================================

// Enable CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
);

// Parse incoming JSON requests
app.use(express.json());

// ========================================
// Health Check Route
// ========================================

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        app: 'StaffSync',
    });
});

// ========================================
// Application Routes
// ========================================

app.use('/api', routes);

// ========================================
// Global Error Handling Middleware
// ========================================

app.use((err, _req, res, _next) => {
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || 'Server error',
    });
});

// ========================================
// Connect to MongoDB and Start Server
// ========================================

mongoose
    .connect(
        process.env.MONGO_URI ||
        'mongodb://127.0.0.1:27017/staffsync'
    )
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `StaffSync API running on port ${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            'MongoDB connection failed:',
            error.message
        );

        process.exit(1);
    });
