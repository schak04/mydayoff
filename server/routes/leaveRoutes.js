const express = require('express');
const {
    createLeave,
    getMyLeaves,
    cancelLeave,
    getTeamLeaves,
    approveLeave,
    rejectLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', [
    protect,
    authorize('Employee', 'Manager', 'Admin'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('type').isIn(['Sick', 'Casual', 'Family Emergency', 'Paternal', 'Maternal', 'Other']).withMessage('Invalid leave type'),
    body('reason').notEmpty().withMessage('Reason is required'),
    validate
], createLeave);

router.get('/my', protect, getMyLeaves);

router.delete('/:id', protect, cancelLeave);

router.get('/team', [protect, authorize('Manager', 'Admin')], getTeamLeaves);

router.patch('/:id/approve', [protect, authorize('Manager', 'Admin')], approveLeave);

router.patch('/:id/reject', [protect, authorize('Manager', 'Admin')], rejectLeave);


module.exports = router;
