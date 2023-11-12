/* const catchAsync = require('../utils/catchAsync');
const Check = require('../models/checkListModel');
const Activity = require('../models/activityModel');
const appError = require('../utils/appError');
///////////////////////////////////////////////////
exports.getAllChecks = catchAsync(async (req, res, next) => {
  const checks = await Check.find();
  res.status(200).json({
    status: 'success',
    data: {
      checks,
    },
  });
});
exports.getCheckForTask = catchAsync(async (req, res, next) => {
  const check = await Check.find({ task: req.params.id });
  res.status(200).json({
    status: 'success',
    data: {
      check,
    },
  });
});
exports.addCheck = catchAsync(async (req, res, next) => {
  const check = await Check.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      check,
    },
  });
});
exports.updateCheck = catchAsync(async (req, res, next) => {
  const check = await Check.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      check,
    },
  });
});
exports.deleteCheck = catchAsync(async (req, res, next) => {
  const check = await Check.findById(req.params.id);
  if (!check) return next(new appError('Check item is not found', 400));
  const activity = await Activity.create({
    user: req.user.id,
    type: 'deleted',
    details: `Deleted checklist item: ${check.name}`,
    checklistItem: check._id,
    task: check.task,
  });
  await check.deleteOne();
  //send notification
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.markCompleted = catchAsync(async (req, res, next) => {
  const check = await Check.findById(req.params.checklistItemId);
  if (!check) return next(new appError('Check item is not found', 400));

  check.completed = true;
  await check.save();

  const activity = await Activity.create({
    user: req.user.id, // Assuming you have user information in the request
    type: 'completed',
    details: `Completed checklist item: ${check.name}`,
    checklistItem: check._id,
    task: check.task,
  });
  // send notification
  res
    .status(200)
    .json({ message: 'Checklist item completed and activity logged' });
});
 */
