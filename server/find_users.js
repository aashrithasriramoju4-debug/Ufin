const mongoose = require('mongoose');

const findRecentUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ufin');
    const db = mongoose.connection.db;
    
    // Find the 3 most recently created users
    const recentUsers = await db.collection('users').find().sort({ _id: -1 }).limit(3).toArray();
    console.log("RECENT USERS:");
    recentUsers.forEach(u => console.log(u.email, u._id.toString()));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
findRecentUsers();
