import mongoose from 'mongoose';

const connectDB = async (dbUrl: string) => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

export { connectDB };