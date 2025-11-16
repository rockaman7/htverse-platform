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

const seedDemoAccounts = async () => {
  try {
    console.log('🌱 Seeding demo accounts...');
    
    for (const account of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: account.email });
      
      if (existingUser) {
        console.log(`✅ Account ${account.email} already exists`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 12);
      
      // Create user
      await User.create({
        ...account,
        password: hashedPassword
      });
      
      console.log(`✅ Created demo account: ${account.email} (${account.role})`);
    }
    
    console.log('✨ Demo accounts seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
  }
};

module.exports = seedDemoAccounts;

