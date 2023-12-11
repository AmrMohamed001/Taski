const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const apiFeatures = require('../utils/apiFeatures');
const User = require('../models/usermodel');
const Task = require('../models/taskModel');
const multer = require('multer');
const sharp = require('sharp');
///////////////////////////////////////////////////
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(next(new appError('accept only images', 400)), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `userPhoto-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);
  next();
});
///////////////////////////////////////////////////
exports.getUsers = catchAsync(async (req, res, next) => {
  const apif = new apiFeatures(User.find(), req.query)
    .filtering()
    .sorting()
    .projection();
  const users = await apif.query;
  //console.log(req.user);
  res.status(200).json({
    status: 'success',
    Result: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('tasks');
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

const filterObj = (body, ...wanted) => {
  /* [name,email,bith,gender] [name,email] */
  const filtered = {};
  Object.keys(body).forEach((ele) => {
    if (wanted.includes(ele)) filtered[ele] = body[ele];
  });
  return filtered;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new appError(
        'if you want to update password use /update-password ENDPOINT with PATCH request',
        400
      )
    );
  const filterBody = filterObj(req.body, 'name', 'email', 'phone', 'photo');
  //console.log(filterBody);
  if (req.file) filterBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  //console.log(user)
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    message: null,
  });
});
