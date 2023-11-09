const mongoose = require('mongoose');
const validator = require('validator');
///////////////////////////////////////////
const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'You must enter task name'],
      lower: true,
      trim: true,
      minLength: [3, ' name must be greater than 3 chars'],
      maxLength: [20, ' name must be less than 20 chars'],
      //validate: [validator.isAlpha, 'Enter Valid name please'],
    },
    details: {
      type: String,
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
    },
    file: {
      type: String,
    },
    done: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

////////////////////////////////////////////////////////
taskSchema.index({ name: 1 });
////////////////////////////////////////////////////////
taskSchema.virtual('checkList', {
  ref: 'Check',
  foreignField: 'task',
  localField: '_id',
});
////////////////////////////////////////////////////////
taskSchema.pre(/^find/, function (next) {
  this.populate({ path: 'checkList', select: 'name completed' }).populate({
    path: 'members',
    select: 'name email photo',
  });
  next();
});

////////////////////////////////////////////////////////
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
