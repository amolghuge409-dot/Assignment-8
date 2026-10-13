import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [80, "Name must be 80 characters or fewer."],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required."],
      trim: true,
      uppercase: true,
      minlength: [1, "Roll number is required."],
      maxlength: [30, "Roll number must be 30 characters or fewer."],
    },
    department: {
      type: String,
      required: [true, "Department is required."],
      trim: true,
      minlength: [2, "Department must be at least 2 characters."],
      maxlength: [80, "Department must be 80 characters or fewer."],
    },
    marks: {
      type: Number,
      required: [true, "Marks are required."],
      min: [0, "Marks cannot be below 0."],
      max: [100, "Marks cannot be above 100."],
    },
  },
  { timestamps: true, versionKey: false },
);

studentSchema.index({ rollNumber: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
