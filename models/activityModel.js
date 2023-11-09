const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    type: {
      type: String, // E.g., 'completed' or 'deleted'
    },
    details: String, // Additional information about the activity
    checklistItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Checklist',
    },
    task: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task',
    },
  },
  {
    timestamps: true,
  }
);
activitySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email photo',
  });
  next();
});
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
