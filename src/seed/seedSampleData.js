import mongoose from 'mongoose';
import config from '../config/index.js';
import User from '../modules/user/user.model.js';
import Post from '../modules/post/post.model.js';
import Comment from '../modules/comment/comment.model.js';

const seedSampleData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB for sample data...');
    await mongoose.connect(config.databaseUrl);
    console.log('[Seed] Connected.');

    // Find or create an owner user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: config.superAdmin.name,
        email: config.superAdmin.email,
        password: config.superAdmin.password,
        role: 'admin',
        isBlock: false
      });
      console.log('✅ Admin user created for post ownership.');
    }

    const postSlug = 'sexy-snow-bunny-cuckold-special-back-in-town';

    // Check if post already exists
    let post = await Post.findOne({ slug: postSlug });

    if (post) {
      console.log(`ℹ️ Post with slug "${postSlug}" already exists. Updating sample data.`);
    } else {
      post = new Post();
    }

    // Set full post details exactly as seen in reference screenshots
    post.title = 'Sexy snow bunny 🌸 CUCKOLD SPECIAL 🌸 Back in town 💦 🌸';
    post.slug = postSlug;
    post.description = 'When you contact me, please be sure to say you saw my ad on PrivateDelights. This is important!';
    post.user = admin._id;
    post.category = 'Escort';
    post.status = 'published';
    post.isFeatured = true;
    post.favoritesCount = 42;

    post.displayName = 'miaa_snow';
    post.joinedDate = new Date('2024-10-11');
    post.bumpedAt = new Date(); // 4 hours ago
    post.age = 25;
    post.gender = 'Female';
    post.ethnicity = 'White';
    post.height = '5 ft 7 in';
    post.bodyType = 'Curvy';
    post.serviceType = ['Incall', 'Outcall'];

    post.location = {
      country: 'USA',
      state: 'California',
      city: 'Norwalk',
      address: '',
      zipCode: '90650',
      formattedLocation: 'USA > California > Norwalk'
    };

    post.contact = {
      phone: '(408) 403-1569',
      email: 'miaa_snow@example.com',
      website: '',
      disclaimer: 'When you contact me, please be sure to say you saw my ad on PrivateDelights. This is important!'
    };

    post.donations = 'Ask';
    post.paymentMethods = ['Cash', 'Paypal', 'Zelle', 'Apple Pay'];

    // Gallery images
    post.mainImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
    post.images = [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        caption: 'Main hotel suite photo',
        order: 1,
        isMain: true
      },
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        caption: 'Mirror selfie',
        order: 2,
        isMain: false
      },
      {
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        caption: 'Lounge session',
        order: 3,
        isMain: false
      },
      {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        caption: 'Green outfit',
        order: 4,
        isMain: false
      },
      {
        url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
        caption: 'Bedroom view',
        order: 5,
        isMain: false
      },
      {
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        caption: 'Portrait',
        order: 6,
        isMain: false
      }
    ];

    // Attributes exactly as in screenshot 1
    post.attributes = {
      eyes: 'Brown',
      hair: 'White',
      hairLength: 'To butt',
      grooming: 'Bald',
      chest: '30 - 32 DD',
      piercings: false,
      tattoos: false,
      smoke: false,
      customAttributes: [
        { key: 'Build', value: 'Curvy & athletic' },
        { key: 'Language', value: 'English' }
      ]
    };

    // Tab 1: About
    post.aboutSection = {
      notice: "🚗💨 OUTCALLS require 60 Deposit 🚗💨 I'll make the drive if you make the deposit!! ❤️",
      warnings: '⚠️ 🚫No Gpe 🚫No service 🚫No gfe 🚫No bbbi 🚫No Bare ⚠️',
      noList: ['BBBJ', 'DFK', 'COF', 'FOV', 'CIM', 'LFK', 'RIV', 'DATY'],
      content: 'Independent and upscale provider. Serious inquiries only.'
    };

    // Tab 3: Schedule
    post.scheduleSection = {
      workingHours: '10:00 AM - 11:00 PM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      notice: 'Available today in Norwalk. Incall and Outcall available.',
      customSchedule: {}
    };

    // Tab 4: Screening
    post.screeningSection = {
      requirements: 'Two references from recognized providers or employment & LinkedIn verification.',
      depositRequired: true,
      depositAmount: '$60 for outcalls',
      instructions: 'Please text with your name, screening info, date, time and duration requested.'
    };

    post.averageRating = 5.0;
    post.totalReviews = 10;

    await post.save();
    console.log(`✅ Post saved: "${post.title}" (ID: ${post._id})`);

    // Remove old comments for this post if re-seeding
    await Comment.deleteMany({ post: post._id });

    // Seed the 10 reviews visible in Screenshot 2
    const sampleReviews = [
      {
        reviewerName: 'fast-lane',
        reviewerStats: '14 Reviews • Joined: September 15, 2020',
        visitDate: 'Visit Date: April 2025',
        rating: 5,
        comment: 'Thank you',
        isVerifiedMember: false
      },
      {
        reviewerName: 'Harry31',
        reviewerStats: '22 Reviews • Joined: January 4, 2021',
        visitDate: 'Visit Date: December 2024',
        rating: 5,
        comment: '2 name Private review',
        isVerifiedMember: false
      },
      {
        reviewerName: 'david-bronx',
        reviewerStats: '4 Reviews • Joined: May 12, 2021',
        visitDate: 'Visit Date: April 2025',
        rating: 5,
        comment: 'she was sweet and lots of fun! 🌸🔥',
        isVerifiedMember: true
      },
      {
        reviewerName: 'taboo',
        reviewerStats: '8 Reviews • Joined: November 3, 2020',
        visitDate: 'Visit Date: July 2023',
        rating: 5,
        comment: 'It was fun',
        isVerifiedMember: true
      },
      {
        reviewerName: 'bllm414me',
        reviewerStats: '5 Reviews • Joined: October 17, 2021',
        visitDate: 'Visit Date: August 2022',
        rating: 5,
        comment: 'Vey nice plan',
        isVerifiedMember: true
      },
      {
        reviewerName: 'andy-and-anand013',
        reviewerStats: '2 Reviews • Joined: June 13, 2024',
        visitDate: 'Visit Date: January 2025',
        rating: 5,
        comment: 'So yummy, beautiful eyes, and joy',
        isVerifiedMember: false
      },
      {
        reviewerName: 'ferzen',
        reviewerStats: '13 Reviews • Joined: July 19, 2021',
        visitDate: 'Visit Date: March 2024',
        rating: 5,
        comment: 'Good as always',
        isVerifiedMember: true
      },
      {
        reviewerName: 'Bryan-West',
        reviewerStats: '16 Reviews • Joined: June 20, 2021',
        visitDate: 'Visit Date: November 2022',
        rating: 5,
        comment: 'Fun times',
        isVerifiedMember: true
      },
      {
        reviewerName: 'Johnnie855',
        reviewerStats: '21 Reviews • Joined: June 15, 2022',
        visitDate: 'Visit Date: September 2023',
        rating: 5,
        comment: 'A sweet redhead',
        isVerifiedMember: true
      },
      {
        reviewerName: 'WD90',
        reviewerStats: '31 Reviews • Joined: April 21, 2020',
        visitDate: 'Visit Date: November 2022',
        rating: 5,
        comment: 'Amazing as well',
        isVerifiedMember: true
      }
    ];

    const commentsToInsert = sampleReviews.map((r) => ({
      post: post._id,
      user: null,
      reviewerName: r.reviewerName,
      reviewerStats: r.reviewerStats,
      visitDate: r.visitDate,
      rating: r.rating,
      comment: r.comment,
      isVerifiedMember: r.isVerifiedMember,
      isGenerated: false,
      isApproved: true,
      providerResponse: {
        text: 'Thank you so much for the kind words!',
        respondedAt: new Date()
      }
    }));

    await Comment.insertMany(commentsToInsert);
    console.log(`✅ Seeded ${commentsToInsert.length} approved reviews matching screenshot 2.`);

    console.log('====================================================');
    console.log('🎉 Sample data seeding completed successfully!');
    console.log(`   Post slug: /posts/${post.slug}`);
    console.log(`   API URL:   http://localhost:${config.port}/api/v1/posts/slug/${post.slug}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    process.exit(1);
  }
};

seedSampleData();
