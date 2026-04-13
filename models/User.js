// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['client', 'partner', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  businessName: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Partner specific fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Only enforce uniqueness if value exists
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  
  // Client specific fields
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  
  // Metadata
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==================== INDEXES ====================
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ role: 1 });

// ==================== PRE-SAVE MIDDLEWARE ====================
// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate referral code for partners
userSchema.pre('save', function() {
  if (this.role === 'partner' && !this.referralCode) {
    this.referralCode = generateReferralCode(this.name);
  }
});

// ==================== INSTANCE METHODS ====================

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  
  return token;
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    businessName: this.businessName,
    phone: this.phone,
    isEmailVerified: this.isEmailVerified,
    referralCode: this.referralCode,
    totalEarnings: this.totalEarnings,
    createdAt: this.createdAt
  };
};

// ==================== STATIC METHODS ====================

// Find by credentials (for login)
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact support.');
  }
  
  // Update last login
  user.lastLogin = Date.now();
  await user.save();
  
  return user;
};

// ==================== HELPER FUNCTIONS ====================

function generateReferralCode(name) {
  const cleanName = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${randomString}`;
}

// ==================== VIRTUAL PROPERTIES ====================

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
  return this.businessName || this.name;
});

// Virtual for referral count
userSchema.virtual('referralCount').get(function() {
  return this.referrals ? this.referrals.length : 0;
});

// Virtual for project count
userSchema.virtual('projectCount').get(function() {
  return this.projects ? this.projects.length : 0;
});

// Enable virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);