const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['Medical', 'Travel', 'Meal', 'Equipment', 'Training', 'Other'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be at least 1'],
    },
    currency: {
        type: String,
        default: 'INR',
    },
    description: {
        type: String,
        required: true,
    },
    receiptUrl: {
        type: String,
        default: '',
    },
    expenseDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
        default: 'Pending',
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
    paidAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
