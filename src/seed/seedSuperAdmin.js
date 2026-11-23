import mongoose from 'mongoose';
import config from '../config/index.js';
import User from '../modules/user/user.model.js';

const seedSuperAdmin = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.databaseUrl);
    console.log('[Seed] Connected to database.');

    // Check if any admin already exists in the system
    const existingAdmin = await User.findOne({
      $or: [{ role: 'admin' }, { email: config.superAdmin.email }]
    });

    if (existingAdmin) {
      console.log('----------------------------------------------------');
      console.log('ℹ️  Super Admin already exists in the database.');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log('   Creation skipped to enforce single-admin constraint.');
      console.log('----------------------------------------------------');
      process.exit(0);
    }

    // Create the one and only Super Admin
    const superAdmin = await User.create({
      name: config.superAdmin.name,
      email: config.superAdmin.email,
      password: config.superAdmin.password,
      role: 'admin',
      isBlock: false
    });

    console.log('====================================================');
    console.log('✅ Super Admin created successfully!');
    console.log(`   Name:     ${superAdmin.name}`);
    console.log(`   Email:    ${superAdmin.email}`);
    console.log(`   Password: ${config.superAdmin.password}`);
    console.log(`   Role:     ${superAdmin.role}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
