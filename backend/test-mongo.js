// Test MongoDB Atlas connection
import mongoose from 'mongoose';

const testConnection = async () => {
    try {
        console.log('🔍 Testing MongoDB Atlas connection...');
        
        // Test different connection strings
        const connectionStrings = [
            'mongodb+srv://elaratech:password@elara-tech-cluster.m6v6cex.mongodb.net/elara_technologies?retryWrites=true&w=majority&appName=elara-tech-cluster',
            'mongodb+srv://elaratech:password@elara-tech-cluster.m6v6cex.mongodb.net/?retryWrites=true&w=majority&appName=elara-tech-cluster'
        ];
        
        for (let i = 0; i < connectionStrings.length; i++) {
            const uri = connectionStrings[i];
            console.log(`\n📡 Testing connection ${i + 1}:`);
            console.log(`URI: ${uri.replace(/password/g, '***')}`);
            
            try {
                await mongoose.connect(uri);
                console.log('✅ SUCCESS: MongoDB Atlas connected!');
                
                // Test creating a simple document
                const testSchema = new mongoose.Schema({ test: String });
                const TestModel = mongoose.model('Test', testSchema);
                
                const doc = new TestModel({ test: 'Hello MongoDB Atlas!' });
                await doc.save();
                console.log('✅ SUCCESS: Document created successfully!');
                
                await TestModel.deleteOne({ _id: doc._id });
                console.log('✅ SUCCESS: Document deleted successfully!');
                
                await mongoose.disconnect();
                console.log('✅ SUCCESS: Disconnected cleanly!');
                
                console.log('\n🎉 MongoDB Atlas is working perfectly!');
                process.exit(0);
                
            } catch (error) {
                console.log(`❌ FAILED: ${error.message}`);
                await mongoose.disconnect().catch(() => {});
            }
        }
        
        console.log('\n❌ All connection attempts failed.');
        console.log('\n🔧 Please check:');
        console.log('1. MongoDB Atlas password is correct');
        console.log('2. Network Access allows your IP (0.0.0.0/0)');
        console.log('3. Database user has read/write permissions');
        
        process.exit(1);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        process.exit(1);
    }
};

testConnection();
