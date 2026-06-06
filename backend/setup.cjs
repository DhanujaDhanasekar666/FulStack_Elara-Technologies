// Setup Test Accounts - CommonJS version
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.MONGO_URI = 'mongodb://localhost:27017/elara_technologies';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production-2024';
process.env.JWT_EXPIRE = '30d';

// Simple User Schema (since we can't import ES6 modules)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['employee', 'manager', 'admin', 'hr', 'ceo'],
        default: 'employee'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    position: {
        type: String,
        required: [true, 'Please add a position']
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.log(`❌ MongoDB Connection Failed: ${error.message}`);
        console.log('💡 Make sure MongoDB is installed and running:');
        console.log('   sudo apt install mongodb');
        console.log('   sudo systemctl start mongodb');
        return false;
    }
};

const createTestAccounts = async () => {
    try {
        console.log('🔧 Ensuring test accounts exist (upsert)...');

        // Do not clear; upsert below

        // Test accounts data
        const testAccounts = [
            {
                name: 'Alex Johnson',
                email: 'ceo@elaratech.com',
                password: 'Ceo@123456',
                role: 'ceo',
                employeeId: 'EMP001',
                department: 'Executive',
                position: 'Chief Executive Officer'
            },
            {
                name: 'Sarah Williams',
                email: 'hr@elaratech.com',
                password: 'Hr@123456',
                role: 'hr',
                employeeId: 'EMP002',
                department: 'Human Resources',
                position: 'HR Manager'
            },
            {
                name: 'IT Admin',
                email: 'admin@elaratech.com',
                password: 'Admin@123456',
                role: 'admin',
                employeeId: 'EMP003',
                department: 'IT',
                position: 'System Administrator'
            },
            {
                name: 'Michael Brown',
                email: 'manager@elaratech.com',
                password: 'Manager@123456',
                role: 'manager',
                employeeId: 'EMP004',
                department: 'Engineering',
                position: 'Project Manager'
            },
            {
                name: 'John Doe',
                email: 'employee@elaratech.com',
                password: 'Employee@123456',
                role: 'employee',
                employeeId: 'EMP005',
                department: 'Engineering',
                position: 'Software Engineer'
            }
        ];

        // Clear existing users to start clean and prevent unique index duplicate errors
        console.log('🧹 Clearing existing users to ensure clean seeding...');
        await User.deleteMany({});

        // Upsert users
        for (const account of testAccounts) {
            const existing = await User.findOne({ email: account.email });
            if (existing) {
                // Ensure essential fields are set
                existing.name = account.name;
                existing.role = account.role;
                existing.department = account.department;
                existing.position = account.position;
                existing.employeeId = existing.employeeId || account.employeeId;
                if (account.password && account.password.length >= 6) {
                    existing.password = account.password;
                }
                await existing.save();
                console.log(`🔁 Updated: ${account.name} (${account.email})`);
            } else {
                await User.create({
                    name: account.name,
                    email: account.email,
                    password: account.password,
                    role: account.role,
                    department: account.department,
                    position: account.position,
                    employeeId: account.employeeId
                });
                console.log(`✅ Created: ${account.name} (${account.email})`);
            }
        }

        console.log('\n🎉 All test accounts created successfully!');
        
        // Display account information
        console.log('\n📋 TEST ACCOUNTS FOR API:');
        console.log('========================');
        testAccounts.forEach(account => {
            console.log(`👤 ${account.role.toUpperCase()}: ${account.email} / ${account.password}`);
        });
        console.log('========================\n');

        return true;
    } catch (error) {
        console.error('❌ Error creating test accounts:', error.message);
        return false;
    }
};

const setupDatabase = async () => {
    console.log('🚀 Starting database setup...\n');

    // Try to connect to MongoDB
    const connected = await connectDB();
    
    if (!connected) {
        console.log('\n⚠️  MongoDB is not running. The backend will work in demo mode.');
        console.log('📝 To use real API with MongoDB:');
        console.log('   1. Install MongoDB: sudo apt install mongodb');
        console.log('   2. Start MongoDB: sudo systemctl start mongodb');
        console.log('   3. Run this setup again: node setup-accounts.js');
        console.log('\n🔄 Frontend will use demo mode for now...\n');
        return false;
    }

    // Create test accounts
    const accountsCreated = await createTestAccounts();
    
    if (accountsCreated) {
        console.log('✅ Database setup complete!');
        console.log('🌐 You can now start the backend server with: npm run dev');
        console.log('📊 API will be available at: http://localhost:3000');
        console.log('🔍 Health check: http://localhost:3000/api/v1/health');
        console.log('\n🎯 Frontend will now connect to real API instead of demo mode!');
    }

    return accountsCreated;
};

// Run setup
setupDatabase()
    .then(() => {
        console.log('\n✅ Setup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
