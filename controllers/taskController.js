const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const appError = require('../utils/appError');
const Task = require('../models/taskModel');
const User = require('../models/usermodel');
const multer = require('multer');
///////////////////////////////////////////////////
// To uplaod file
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/uploadedFiles`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.endsWith('pdf')) cb(null, true);
  else cb(new appError('only pdf files please', 400), false);
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTaskFile = upload.single('file');
///////////////////////////////////////////////////
exports.getTasks = catchAsync(async (req, res, next) => {
  const allTasks = await Task.find().count();
  const queryFeatures = new ApiFeatures(
    Task.find({ createdBy: req.user.id }),
    req.query
  )
    .filtering()
    .sorting()
    .projection()
    .pagination();
  const tasks = await queryFeatures.query;

  res.status(200).json({
    status: 'success',
    RequiredTime: req.requiredIn,
    Result: allTasks,
    data: {
      currentPage: req.query.page * 1 || 1,
      noPages: Math.ceil(allTasks / 10),
      resultPage: tasks.length * 1 || 10,
      tasks,
    },
  });
});
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});
exports.addTask = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user;

  const task = await Task.create(req.body);
  if (req.file) task.file = req.file.filename;
  const user = req.user;
  user.tasks.push(task._id);
  await user.save();
  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});
exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});
exports.deleteTask = catchAsync(async (req, res, next) => {
  await Task.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const stats = await Task.aggregate([
    {
      $match: {
        createdAt: {
          $gt: new Date(`${req.params.year}-1-1`),
          $lt: new Date(`${req.params.year}-12-30`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        number_tasks: { $sum: 1 },
        tasks_name: { $push: '$name' },
        tasks_id: { $push: '$_id' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      ForYear: req.params.year,
      No_months_exists: stats.length,
      stats,
    },
  });
});

exports.tasksStatus = catchAsync(async (req, res, next) => {
  const countTasks = await Task.find().count();
  const stats = await Task.aggregate([
    {
      $group: {
        _id: '$done',
        number_tasks: { $sum: 1 },
        task_id: { $push: '$_id' },
      },
    },
    {
      $addFields: { Done: '$_id' },
    },
    {
      $project: {
        _id: 0,
        Done: 1,
        task_id: 1,
        percentage: {
          $multiply: [
            100,
            {
              $divide: ['$number_tasks', countTasks],
            },
          ],
        },
      },
    },

    {
      $sort: { Done: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
