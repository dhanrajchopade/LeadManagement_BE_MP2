import mongoose from 'mongoose';

// Comment Schema
const commentSchema = new mongoose.Schema({
 
  commentText: {
    type: String,
    required: [true, 'Comment text is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set the creation time
  }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment
