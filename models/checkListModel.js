const mongoose = require('mongoose');
/////////////////////////////////////////////
const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'You must enter your name'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    task: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task',
    },
    doneBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);
const Check = mongoose.model('Check', listSchema);
module.exports = Check;
