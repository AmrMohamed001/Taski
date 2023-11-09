const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const Activity = require('../models/activityModel');
exports.getActivity = catchAsync(async (req, res, next) => {
  const activites = await Activity.find();
  res.status(200).json({
    status: 'success',
    data: {
      activites,
    },
  });
});
