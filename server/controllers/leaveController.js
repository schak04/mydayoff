const Leave = require('../models/Leave');
const User = require('../models/User');

const createLeave = async (req, res) => {
    const { startDate, endDate, type, reason, halfDay, attachmentUrl } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        return res.status(400).json({ message: 'Start date must be before or equal to end date' });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const maxDays = parseInt(process.env.MAX_LEAVE_DAYS) || 10;

    if (diffDays > maxDays) {
        return res.status(400).json({ message: `Maximum leave days per request is ${maxDays}` });
    }

    try {
        // Prevent overlapping leave requests when existing status is Pending or Approved
        const overlapping = await Leave.findOne({
            employeeId: req.user._id,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ message: 'You already have a pending or approved leave request for these dates' });
        }

        const leave = await Leave.create({
            employeeId: req.user._id,
            startDate,
            endDate,
            type,
            reason,
            halfDay,
            attachmentUrl,
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (leave.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this leave' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending leave requests' });
        }

        await Leave.findByIdAndDelete(req.params.id);
        res.json({ message: 'Leave cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeamLeaves = async (req, res) => {
    try {
        let query = {};
        const isAdmin = req.user && req.user.role === 'Admin';

        if (isAdmin) {
            query = {}; // Admins get everything
        } else {
            const teamMembers = await User.find({ managerId: req.user._id });
            const teamMemberIds = teamMembers.map(member => member._id);
            query = { employeeId: { $in: teamMemberIds } };
        }

        const leaves = await Leave.find(query)
            .populate('employeeId', 'name email role managerId')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveLeave = async (req, res) => {
    const { decisionNote } = req.body;
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId');
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (!leave.employeeId) {
            return res.status(400).json({ message: 'Employee associated with this leave not found' });
        }

        const isManager = leave.employeeId.managerId && leave.employeeId.managerId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';

        if (!isManager && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to approve leaves for this employee' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave is already processed' });
        }

        leave.status = 'Approved';
        leave.decidedBy = req.user._id;
        leave.decidedAt = new Date();
        leave.decisionNote = decisionNote || '';
        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectLeave = async (req, res) => {
    const { decisionNote } = req.body;
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId');
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (!leave.employeeId) {
            return res.status(400).json({ message: 'Employee associated with this leave not found' });
        }

        const isManager = leave.employeeId.managerId && leave.employeeId.managerId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';

        if (!isManager && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to reject leaves for this employee' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave is already processed' });
        }

        leave.status = 'Rejected';
        leave.decidedBy = req.user._id;
        leave.decidedAt = new Date();
        leave.decisionNote = decisionNote || '';
        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLeave,
    getMyLeaves,
    cancelLeave,
    getTeamLeaves,
    approveLeave,
    rejectLeave,
};
