const express = require('express');
const {
    submitClaim,
    getMyClaims,
    cancelClaim,
    getTeamClaims,
    approveClaim,
    rejectClaim,
    markAsPaid,
    getApprovedUnpaid,
} = require('../controllers/reimbursementController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Employee: submit a new claim
router.post('/', [
    protect,
    body('category').isIn(['Medical', 'Travel', 'Meal', 'Equipment', 'Training', 'Other']).withMessage('Invalid category'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('description').notEmpty().withMessage('Description is required'),
    body('expenseDate').isISO8601().withMessage('Valid expense date is required'),
    validate,
], submitClaim);

// Employee: view their own claims
router.get('/my', protect, getMyClaims);

// Employee: cancel a pending claim
router.delete('/:id', protect, cancelClaim);

// Manager/Admin: view team or all claims
router.get('/team', [protect, authorize('Manager', 'Admin')], getTeamClaims);

// Admin: view approved-but-unpaid claims
router.get('/admin/approved-unpaid', [protect, authorize('Admin')], getApprovedUnpaid);

// Manager/Admin: approve a claim
router.patch('/:id/approve', [protect, authorize('Manager', 'Admin')], approveClaim);

// Manager/Admin: reject a claim
router.patch('/:id/reject', [protect, authorize('Manager', 'Admin')], rejectClaim);

// Admin only: mark an approved claim as paid
router.patch('/:id/pay', [protect, authorize('Admin')], markAsPaid);

module.exports = router;
