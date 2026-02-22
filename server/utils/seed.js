const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User');
const Leave = require('../models/Leave');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Clear existing data
        await User.deleteMany();
        await Leave.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@mydayoff.com',
            passwordHash,
            role: 'Admin',
        });

        // Create Manager
        const manager = await User.create({
            name: 'Manager User',
            email: 'manager@mydayoff.com',
            passwordHash,
            role: 'Manager',
        });

        // Create Employees assigned to that Manager
        await User.create([
            {
                name: 'Employee One',
                email: 'employee1@mydayoff.com',
                passwordHash,
                role: 'Employee',
                managerId: manager._id,
            },
            {
                name: 'Employee Two',
                email: 'employee2@mydayoff.com',
                passwordHash,
                role: 'Employee',
                managerId: manager._id,
            },
        ]);

        // console.log('Data Seeded Successfully');
        process.exit();
    } catch (error) {
        // console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seed();
