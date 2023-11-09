const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const Email = require('../utils/sendMails');
const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const utils = require('util');
const crypto = require('crypto');
/////////////////////////////////////////////////////////
const signJwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN,
  });
};
const sendResWithJwt = (user, statusCode, res) => {
  const token = signJwt(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
};
/////////////////////////////////////////////////////////
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  try {
    await new Email(user).sendWelcome();
  } catch (err) {
    console.log(err);
  }
  sendResWithJwt(user, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  //get the email and pass
  const { email, password } = req.body;
  if (!email || !password)
    return next(new appError('enter email or password', 400));
  // check if they are correct
  const user = await User.findOne({
    $or: [
      {
        email: email,
      },
      {
        phone: email,
      },
      {
        name: email,
      },
    ],
  }).select('+password');
  if (!user || !(await user.comparePasswords(password, user.password)))
    return next(new appError('username or password are not correct', 401));
  // send res
  sendResWithJwt(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  //get the token and check for it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  if (!token) return next(new appError('you are not logged in', 401));
  //get the user
  const decoded = await utils.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user) return next(new appError('token of user not exist', 401));
  // check if the user changed pass after the token released
  if (user.checkPasswordChanged(decoded.iat))
    return next(new appError('user changed password,try again !', 401));

  req.user = user;
  next();
});

exports.giveAccessTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new appError('You are not authorized', 401));
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new appError('user is not found', 400));
  const verifyCode = user.createRandomVerifyCode();
  await user.save({ validateBeforeSave: false });

  // send mail
  try {
    await new Email(user).sendResetPassword(verifyCode);
    res.status(200).json({
      status: 'success',
      message: 'email sent',
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpireIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('error sending the mail', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const code = req.params.code;
  const hashedCode = crypto
    .createHash('sha256')
    .update(`${code}`)
    .digest('hex');
  const user = await User.findOne({
    passwordResetCode: hashedCode,
    passwordResetExpireIn: { $gt: Date.now() },
  });
  if (!user) return next(new appError('Token has expired', 400));
  user.password = req.body.password;
  user.passwordResetCode = undefined;
  user.passwordResetExpireIn = undefined;
  await user.save();
  sendResWithJwt(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  /*
  password
  newPassword
  */
  // 1)get the user and compare password
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePasswords(req.body.password, user.password)))
    return next(new appError('Password is not correct', 400));
  // 2) update the password
  user.password = req.body.newPassword;
  await user.save();
  // 3) send the token
  sendResWithJwt(user, 200, res);
});
