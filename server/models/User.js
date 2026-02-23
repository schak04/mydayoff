const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Employee'],
        default: 'Employee',
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, {
    timestamps: true,
});

// Virtual for password
userSchema.virtual('password')
    .set(function (password) {
        this._password = password;
    });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Encrypt password using bcrypt
userSchema.pre('validate', async function () {
    if (this._password) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this._password, salt);
    }
});

module.exports = mongoose.model('User', userSchema);
