import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {
        // Use correct environment variable name
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/elara_technologies';
        
        // Connect without deprecated options
        const conn = await mongoose.connect(mongoUri);

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return true;

    } catch (error) {
        logger.error(`❌ MongoDB Connection Failed: ${error.message}`);
        logger.warn('⚠️  Server will continue without MongoDB (API calls will fail gracefully)');
        logger.info('💡 To fix: Install MongoDB with "sudo apt install mongodb && sudo systemctl start mongodb"');
        return false;
    }
};

export default connectDB;




