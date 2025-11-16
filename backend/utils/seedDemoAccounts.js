// Seed demo accounts for testing
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const demoAccounts = [
  {
    name: 'Admin User',
    email: 'admin@hackathon.com',
    password: 'admin123',
    role: 'admin',
    college: 'Demo University',
    phone: '1234567890',
    skills: ['Management', 'Organization'],
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@student.com',
    password: 'john123',
    role: 'participant',
    college: 'Demo College',
    phone: '9876543210',
    skills: ['Web Development', 'JavaScript'],
    isVerified: true
  }
];

// Fix existing accounts with potentially double-hashed passwords
const fixExistingAccounts = async () => {
  try {
    console.log('🔧 Checking and fixing existing demo accounts...');
    
    for (const account of demoAccounts) {
      const existingUser = await User.findOne({ email: account.email }).select('+password');
      
      if (existingUser) {
        // Test if the stored password works with the plain password
        const isPasswordValid = await bcrypt.compare(account.password, existingUser.password);
        
        if (!isPasswordValid) {
          // Password doesn't match - likely double-hashed, fix it
          console.log(`🔧 Fixing password for ${account.email}...`);
          const correctlyHashedPassword = await bcrypt.hash(account.password, 12);
          
          // Update using collection directly to bypass all Mongoose hooks
          await User.collection.updateOne(
            { email: account.email },
            { $set: { password: correctlyHashedPassword } }
          );
          
          console.log(`✅ Fixed password for ${account.email}`);
        } else {
          console.log(`✅ Password for ${account.email} is already correct`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error fixing existing accounts:', error);
  }
};

const seedDemoAccounts = async () => {
  try {
    console.log('🌱 Seeding demo accounts...');
    
    // First, fix any existing accounts with double-hashed passwords
    await fixExistingAccounts();
    
    for (const account of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: account.email });
      
      if (existingUser) {
        console.log(`✅ Account ${account.email} already exists`);
        continue;
      }
      
      // Create user with plain password - User model's pre-save hook will hash it
      // This ensures single hashing for new accounts
      await User.create(account);
      
      console.log(`✅ Created demo account: ${account.email} (${account.role})`);
    }
    
    console.log('✨ Demo accounts seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
  }
};

module.exports = seedDemoAccounts;

