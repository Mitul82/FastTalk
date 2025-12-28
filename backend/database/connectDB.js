import mongoose from 'mongoose';

const connectDB = (url) => {
    mongoose.connection.on('connected', () => {
        console.log('Connected to the MongoDB Atlas Database');
    });
    return mongoose.connect(url);
}

export default connectDB;