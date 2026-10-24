import mongoose from 'mongoose';

// 1. User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['hr', 'manager', 'employee'],
            default: 'employee',
        },
    },
    { timestamps: true }
);

// 2. Employee Schema
const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        department: String,
        position: String,
        phone: String,
        status: {
            type: String,
            default: 'active',
        },
    },
    { timestamps: true }
);

// 3. Leave Schema
const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        employeeName: String,
        startDate: Date,
        endDate: Date,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true }
);

// 4. Attendance Schema
const attendanceSchema = new mongoose.Schema(
    {
        employee: mongoose.Schema.Types.ObjectId,
        employeeName: String,
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            default: 'present',
        },
        note: String,
    },
    { timestamps: true }
);

// 5. Announcement Schema
const announcementSchema = new mongoose.Schema(
    {
        title: String,
        message: String,
        createdBy: mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true }
);

// 6. Training Schema
const trainingSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        trainer: String,
        date: Date,
    },
    { timestamps: true }
);

// Export all models
export const User = mongoose.model('User', userSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const Leave = mongoose.model('Leave', leaveSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Training = mongoose.model('Training', trainingSchema);

