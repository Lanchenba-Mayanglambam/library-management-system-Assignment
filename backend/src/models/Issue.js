import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book is required"]
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"]
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["ISSUED", "RETURNED"],
      default: "ISSUED"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);
