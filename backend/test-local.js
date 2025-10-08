// Test Local MongoDB Connection
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Force local connection
const MONGO_URI = 'mongodb://localhost:27017/elara_technologies';

console.log('🔍 Testing local MongoDB connection...');
console.log('URI:', MONGO_URI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return true;
    } catch (error) {
        console.log(`❌ MongoDB Connection Failed: ${error.message}`);
        return false;
    }
};

// Simple User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

const createTestUser = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Create test user
        const user = await User.create({
            name: 'Test CEO',
            email: 'ceo@elaratech.com',
            password: 'Ceo@123456',
            role: 'ceo'
        });

        console.log('✅ Created test user:', user.email);
        
        // Verify user exists
        const foundUser = await User.findOne({ email: 'ceo@elaratech.com' });
        console.log('🔍 Found user:', foundUser ? foundUser.email : 'Not found');
        
        return true;
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        return false;
    }
};

const runTest = async () => {
    const connected = await connectDB();
    if (connected) {
        await createTestUser();
    }
    mongoose.connection.close();
};

runTest();
