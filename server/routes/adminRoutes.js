const express = require('express');
const { getUsers, updateUserRole, updateUserManager } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/users', [protect, authorize('Admin')], getUsers);

router.patch('/users/:id/role', [
    protect,
    authorize('Admin'),
    body('role').isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role'),
    validate
], updateUserRole);

router.patch('/users/:id/manager', [
    protect,
    authorize('Admin'),
    validate
], updateUserManager);

module.exports = router;
