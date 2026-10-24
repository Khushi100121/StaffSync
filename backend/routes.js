import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
    User,
    Employee,
    Leave,
    Attendance,
    Announcement,
    Training,
} from './models.js';

// Initialize router
const router = Router();

// ========================================
// Helper Functions
// ========================================

// JWT secret key
const getSecret = () => {
    return process.env.JWT_SECRET || 'dev_only_change_me';
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        getSecret(),
        { expiresIn: '7d' }
    );
};

// Return safe user details
const safeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

// ========================================
// Authentication Middleware
// ========================================

// Verify JWT token and identify the logged-in user
const authenticate = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization || '';

        if (!authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Login required',
            });
        }

        const payload = jwt.verify(
            authorization.slice(7),
            getSecret()
        );

        req.user = await User.findById(payload.id)
            .select('-passwordHash');

        if (!req.user) {
            return res.status(401).json({
                message: 'User not found',
            });
        }

        next();
    } catch {
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
};

// Check whether the user has the required role
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            message: 'Permission denied',
        });
    };
};

// ========================================
// Authentication Routes
// ========================================

// Register a new user
router.post('/auth/register', async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role = 'employee',
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, password required',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters',
            });
        }

        if (!['hr', 'manager', 'employee'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid role',
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered',
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role,
        });

        return res.status(201).json({
            token: generateToken(user),
            user: safeUser(user),
        });
    } catch (error) {
        next(error);
    }
});

// Log in an existing user
router.post('/auth/login', async (req, res, next) => {
    try {
        const email = (req.body.email || '').toLowerCase();
        const password = req.body.password || '';

        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        return res.json({
            token: generateToken(user),
            user: safeUser(user),
        });
    } catch (error) {
        next(error);
    }
});

// Get the currently logged-in user's details
router.get('/auth/me', authenticate, (req, res) => {
    res.json({
        user: req.user,
    });
});

// ========================================
// Employee Management Routes
// ========================================

// Get all employees (HR and Manager)
router.get(
    '/employees',
    authenticate,
    allowRoles('hr', 'manager'),
    async (_req, res) => {
        const employees = await Employee.find()
            .sort({ createdAt: -1 });

        res.json(employees);
    }
);

// Add a new employee (HR only)
router.post(
    '/employees',
    authenticate,
    allowRoles('hr'),
    async (req, res) => {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email required',
            });
        }

        const employee = await Employee.create(req.body);

        res.status(201).json(employee);
    }
);

// Delete an employee (HR only)
router.delete(
    '/employees/:id',
    authenticate,
    allowRoles('hr'),
    async (req, res) => {
        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        res.json({
            message: 'Employee deleted',
        });
    }
);

// ========================================
// Leave Management Routes
// ========================================

// Get leave requests
// HR and Manager can view all; Employees see their own
router.get('/leaves', authenticate, async (req, res) => {
    const filter = ['hr', 'manager'].includes(req.user.role)
        ? {}
        : { employee: req.user._id };

    const leaves = await Leave.find(filter)
        .sort({ createdAt: -1 });

    res.json(leaves);
});

// Submit a leave request
router.post('/leaves', authenticate, async (req, res) => {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
        return res.status(400).json({
            message: 'All leave fields are required',
        });
    }

    if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({
            message: 'End date must be on/after start date',
        });
    }

    const leave = await Leave.create({
        employee: req.user._id,
        employeeName: req.user.name,
        startDate,
        endDate,
        reason,
    });

    res.status(201).json(leave);
});

// Approve or reject a leave request (HR and Manager)
router.patch(
    '/leaves/:id/status',
    authenticate,
    allowRoles('hr', 'manager'),
    async (req, res) => {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be approved or rejected',
            });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            {
                status,
                reviewedBy: req.user._id,
            },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({
                message: 'Leave not found',
            });
        }

        res.json(leave);
    }
);

// ========================================
// Attendance Management Routes
// ========================================

// Get attendance records
router.get('/attendance', authenticate, async (req, res) => {
    const filter = req.user.role === 'hr'
        ? {}
        : { employee: req.user._id };

    const attendance = await Attendance.find(filter)
        .sort({ date: -1 });

    res.json(attendance);
});

// Add an attendance record (HR only)
router.post(
    '/attendance',
    authenticate,
    allowRoles('hr'),
    async (req, res) => {
        const attendance = await Attendance.create(req.body);

        res.status(201).json(attendance);
    }
);

// ========================================
// Announcement Routes
// ========================================

// Get all announcements
router.get('/announcements', authenticate, async (_req, res) => {
    const announcements = await Announcement.find()
        .sort({ createdAt: -1 });

    res.json(announcements);
});

// Create an announcement (HR only)
router.post(
    '/announcements',
    authenticate,
    allowRoles('hr'),
    async (req, res) => {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: 'Title and message required',
            });
        }

        const announcement = await Announcement.create({
            ...req.body,
            createdBy: req.user._id,
        });

        res.status(201).json(announcement);
    }
);

// ========================================
// Training Management Routes
// ========================================

// Get all training programs
router.get('/trainings', authenticate, async (_req, res) => {
    const trainings = await Training.find()
        .sort({ createdAt: -1 });

    res.json(trainings);
});

// Add a training program (HR and Manager)
router.post(
    '/trainings',
    authenticate,
    allowRoles('hr', 'manager'),
    async (req, res) => {
        if (!req.body.title) {
            return res.status(400).json({
                message: 'Title required',
            });
        }

        const training = await Training.create(req.body);

        res.status(201).json(training);
    }
);

// Export router
export default router;
