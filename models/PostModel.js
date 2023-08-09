import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    isEducated:
    {
      type: Boolean,
      required : false
    },
    isImmune:
    {
      type: Boolean,
      required : false
    },
    isCastrated:
    {
      type: Boolean,
      required : false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  }
);

postSchema.index({ name: "text" }); // Create a text index on the 'name' field

const Post = mongoose.model("Post", postSchema);

export default Post;
