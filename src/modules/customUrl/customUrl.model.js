import mongoose from 'mongoose';

const customUrlSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
      index: true
    },
    country: {
      type: String,
      required: [true, 'Country segment is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State segment is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City segment is required'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username / short title segment is required'],
      trim: true
    },
    normalizedPath: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    shortTitle: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const CustomUrl = mongoose.model('CustomUrl', customUrlSchema);

export default CustomUrl;
