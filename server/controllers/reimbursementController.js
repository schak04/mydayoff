const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');

// POST /api/reimbursements - Employee submits a claim
const submitClaim = async (req, res) => {
    const { category, amount, description, receiptUrl, expenseDate } = req.body;

    try {
        const claim = await Reimbursement.create({
            employeeId: req.user._id,
            category,
            amount,
            description,
            receiptUrl: receiptUrl || '',
            expenseDate,
        });

        res.status(201).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reimbursements/my - Employee sees their own claims
const getMyClaims = async (req, res) => {
    try {
        const claims = await Reimbursement.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/reimbursements/:id - Employee cancels a pending claim
const cancelClaim = async (req, res) => {
    try {
        const claim = await Reimbursement.findById(req.params.id);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        if (claim.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this claim' });
        }

        if (claim.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending claims can be cancelled' });
        }

        await Reimbursement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Claim cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reimbursements/team - Manager/Admin sees team/all claims
const getTeamClaims = async (req, res) => {
    try {
        let query = {};
        const isAdmin = req.user && req.user.role === 'Admin';

        if (!isAdmin) {
            const teamMembers = await User.find({ managerId: req.user._id });
            const teamMemberIds = teamMembers.map(m => m._id);
            query = { employeeId: { $in: teamMemberIds } };
        }

        const claims = await Reimbursement.find(query)
            .populate('employeeId', 'name email role')
            .populate('decidedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/reimbursements/:id/approve - Manager/Admin approves a claim
const approveClaim = async (req, res) => {
    const { decisionNote } = req.body;
    try {
        const claim = await Reimbursement.findById(req.params.id).populate('employeeId');
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const isManager = claim.employeeId.managerId &&
            claim.employeeId.managerId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';

        if (!isManager && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to approve this claim' });
        }

        if (claim.status !== 'Pending') {
            return res.status(400).json({ message: 'Claim is already processed' });
        }

        claim.status = 'Approved';
        claim.decidedBy = req.user._id;
        claim.decidedAt = new Date();
        claim.decisionNote = decisionNote || '';
        await claim.save();

        res.json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/reimbursements/:id/reject - Manager/Admin rejects a claim
const rejectClaim = async (req, res) => {
    const { decisionNote } = req.body;
    try {
        const claim = await Reimbursement.findById(req.params.id).populate('employeeId');
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const isManager = claim.employeeId.managerId &&
            claim.employeeId.managerId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';

        if (!isManager && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to reject this claim' });
        }

        if (claim.status !== 'Pending') {
            return res.status(400).json({ message: 'Claim is already processed' });
        }

        claim.status = 'Rejected';
        claim.decidedBy = req.user._id;
        claim.decidedAt = new Date();
        claim.decisionNote = decisionNote || '';
        await claim.save();

        res.json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/reimbursements/:id/pay - Admin marks an approved claim as Paid
const markAsPaid = async (req, res) => {
    try {
        const claim = await Reimbursement.findById(req.params.id);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        if (claim.status !== 'Approved') {
            return res.status(400).json({ message: 'Only approved claims can be marked as paid' });
        }

        claim.status = 'Paid';
        claim.paidAt = new Date();
        await claim.save();

        res.json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reimbursements/admin/approved-unpaid - Admin sees all approved-but-unpaid claims
const getApprovedUnpaid = async (req, res) => {
    try {
        const claims = await Reimbursement.find({ status: 'Approved' })
            .populate('employeeId', 'name email role')
            .populate('decidedBy', 'name')
            .sort({ decidedAt: 1 }); // oldest first to process

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitClaim,
    getMyClaims,
    cancelClaim,
    getTeamClaims,
    approveClaim,
    rejectClaim,
    markAsPaid,
    getApprovedUnpaid,
};
