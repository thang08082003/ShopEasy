const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    
    // Set up event listeners for connection issues
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err.message}`.red);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected'.yellow);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination'.yellow);
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red);
    
    // Implement retry logic
    if (retries > 0) {
      console.log(`Retrying connection (${retries} attempts left)...`.yellow);
      setTimeout(() => connectDB(retries - 1), 5000); // Wait 5s before retrying
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts'.red.bold);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
