import mongoose from 'mongoose';

const connection = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/Loop-Lap-Database', {
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connection;