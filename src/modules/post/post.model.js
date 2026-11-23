import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    },
    isMain: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const locationSchema = new mongoose.Schema(
  {
    country: { type: String, default: 'USA' },
    state: { type: String, default: 'California' },
    city: { type: String, default: 'Norwalk' },
    address: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    formattedLocation: { type: String, default: 'USA > California > Norwalk' }
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    phone: { type: String, default: '(408) 403-1569' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    disclaimer: {
      type: String,
      default: 'When you contact me, please be sure to say you saw my ad on PrivateDelights. This is important!'
    }
  },
  { _id: false }
);

const attributesSchema = new mongoose.Schema(
  {
    eyes: { type: String, default: 'Brown' },
    hair: { type: String, default: 'White' },
    hairLength: { type: String, default: 'To butt' },
    grooming: { type: String, default: 'Bald' },
    chest: { type: String, default: '30 - 32 DD' },
    piercings: { type: Boolean, default: false },
    tattoos: { type: Boolean, default: false },
    smoke: { type: Boolean, default: false },
    // Fully extensible key-value list for non-hardcoded attributes
    customAttributes: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true }
      }
    ]
  },
  { _id: false }
);

const aboutSectionSchema = new mongoose.Schema(
  {
    notice: {
      type: String,
      default: "🚗💨 OUTCALLS require 60 Deposit 🚗💨 I'll make the drive if you make the deposit!! ❤️"
    },
    warnings: {
      type: String,
      default: '⚠️ 🚫No Gpe 🚫No service 🚫No gfe 🚫No bbbi 🚫No Bare ⚠️'
    },
    noList: {
      type: [String],
      default: ['BBBJ', 'DFK', 'COF', 'FOV', 'CIM', 'LFK', 'RIV', 'DATY']
    },
    content: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const scheduleSectionSchema = new mongoose.Schema(
  {
    workingHours: { type: String, default: '10:00 AM - 11:00 PM' },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    notice: { type: String, default: 'Available today. Advance booking recommended.' },
    customSchedule: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const screeningSectionSchema = new mongoose.Schema(
  {
    requirements: {
      type: String,
      default: 'Two provider references or verified employment ID required.'
    },
    depositRequired: { type: Boolean, default: true },
    depositAmount: { type: String, default: '$60 for outcalls' },
    instructions: {
      type: String,
      default: 'Please text your name, reference details, and desired date/time.'
    }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    category: {
      type: String,
      default: 'Escort'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    favoritesCount: {
      type: Number,
      default: 0
    },

    // Image Gallery
    mainImage: {
      type: String,
      default: ''
    },
    images: {
      type: [galleryImageSchema],
      default: []
    },

    // Profile summary details
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    bumpedAt: {
      type: Date,
      default: Date.now
    },
    age: {
      type: Number,
      default: 25
    },
    gender: {
      type: String,
      default: 'Female'
    },
    ethnicity: {
      type: String,
      default: 'White'
    },
    height: {
      type: String,
      default: '5 ft 7 in'
    },
    bodyType: {
      type: String,
      default: 'Curvy'
    },
    serviceType: {
      type: [String],
      default: ['Incall', 'Outcall']
    },

    // Location & Contact
    location: {
      type: locationSchema,
      default: () => ({})
    },
    contact: {
      type: contactSchema,
      default: () => ({})
    },

    // Donations & Payments
    donations: {
      type: String,
      default: 'Ask'
    },
    paymentMethods: {
      type: [String],
      default: ['Cash', 'Paypal', 'Zelle', 'Apple Pay']
    },

    // Physical / dynamic attributes
    attributes: {
      type: attributesSchema,
      default: () => ({})
    },

    // Dynamic Tab Sections
    aboutSection: {
      type: aboutSectionSchema,
      default: () => ({})
    },
    scheduleSection: {
      type: scheduleSectionSchema,
      default: () => ({})
    },
    screeningSection: {
      type: screeningSectionSchema,
      default: () => ({})
    },

    // Ratings & Reviews stats (aggregated automatically from approved comments)
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Auto set mainImage if not explicitly set
postSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    const main = this.images.find((img) => img.isMain);
    if (main) {
      this.mainImage = main.url;
    } else if (!this.mainImage) {
      this.mainImage = this.images[0].url;
      this.images[0].isMain = true;
    }
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
