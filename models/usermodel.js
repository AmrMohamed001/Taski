const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
///////////////////////////////////////////
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'You must enter your name'],
      lower: true,
      trim: true,
      //unique: true,
      minLength: [3, 'your name must be greater than 3 chars'],
      maxLength: [20, 'your name must be less than 20 chars'],
      //validate: [validator.isAlpha, 'Enter Valid name please'],
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'enter valid mail'],
      required: [true, 'enter your mail'],
      unique: true,
      lowerCase: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: [true, 'enter password'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'enter your phone number'],
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    dateBirth: Date,
    photo: {
      type: String,
      default: 'default.jpg',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpireIn: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
////////////////////////////////////////////////
userSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'user',
  localField: '_id',
});
////////////////////////////////////////////////
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') && this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
////////////////////////////////////////////////
userSchema.methods.comparePasswords = async function (input, stored) {
  return await bcrypt.compare(input, stored);
};
userSchema.methods.checkPasswordChanged = function (jwtIat) {
  if (this.passwordChangedAt) {
    const passChangeInMS = this.passwordChangedAt.getTime() / 1000;
    // console.log(passChangeInMS, jwtIat);
    return jwtIat < passChangeInMS;
  }
  return false;
};
userSchema.methods.createRandomVerifyCode = function () {
  const code = crypto.randomInt(100000, 999999);
  this.passwordResetCode = crypto
    .createHash('sha256')
    .update(`${code}`)
    .digest('hex');
  this.passwordResetExpireIn = Date.now() + 3 * 60 * 1000; // 2-min
  return code;
};
////////////////////////////////////////////////

////////////////////////////////////////////////
const User = mongoose.model('User', userSchema);
module.exports = User;
