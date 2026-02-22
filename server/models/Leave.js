const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ['Sick', 'Casual', 'Family Emergency', 'Paternal', 'Maternal', 'Other'],
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    halfDay: {
        type: Boolean,
        default: false,
    },
    attachmentUrl: {
        type: String,
        default: '',
    },
    decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    decidedAt: {
        type: Date,
        default: null,
    },
    decisionNote: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Leave', leaveSchema);
