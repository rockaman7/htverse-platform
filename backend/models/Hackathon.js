const mongoose = require("mongoose");

// Hackathon Schema Definition
const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide hackathon title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide hackathon description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide end date"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Please provide registration deadline"],
    },
    maxTeamSize: {
      type: Number,
      required: [true, "Please provide maximum team size"],
      min: [1, "Team size must be at least 1"],
      max: [10, "Team size cannot exceed 10"],
    },
    prizePool: {
      type: Number,
      required: [true, "Please provide prize pool amount"],
      min: [0, "Prize pool cannot be negative"],
    },
    categories: [
      {
        type: String,
        required: true,
        enum: [
          "Web Development",
          "Mobile Development",
          "AI/ML",
          "Blockchain",
          "IoT",
          "Game Development",
          "Data Science",
          "Cybersecurity",
          "Cloud Computing",
          "Other",
        ],
      },
    ],
    organizer: {
      // Reference to User model
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    maxParticipants: {
      type: Number,
      default: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerImage: {
      type: String,
      default: "",
    },
    rules: [
      {
        type: String,
      },
    ],
    judgesCriteria: [
      {
        criterion: {
          type: String,
          required: true,
        },
        weightage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Database Indexes for Performance Optimization
hackathonSchema.index({ status: 1 }); // For status filtering
hackathonSchema.index({ categories: 1 }); // For category filtering
hackathonSchema.index({ registrationDeadline: 1 }); // For deadline sorting
hackathonSchema.index({ createdAt: -1 }); // For newest/oldest sorting
hackathonSchema.index({ prizePool: -1 }); // For prize sorting
hackathonSchema.index({ isActive: 1 }); // For active hackathons
hackathonSchema.index({ organizer: 1 }); // For organizer queries
hackathonSchema.index({ participants: 1 }); // For participant queries

// Compound indexes for common query patterns
hackathonSchema.index({ status: 1, isActive: 1 }); // Status + active filtering
hackathonSchema.index({ categories: 1, status: 1 }); // Category + status filtering

// Virtual for registration count
hackathonSchema.virtual("registrationCount").get(function () {
  return this.participants.length;
});

// Virtual for spots remaining
hackathonSchema.virtual("spotsRemaining").get(function () {
  return this.maxParticipants - this.participants.length;
});

// Virtual for registration status
hackathonSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  return (
    now < this.registrationDeadline &&
    this.participants.length < this.maxParticipants
  );
});

// Validate dates
hackathonSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }
  if (this.registrationDeadline >= this.startDate) {
    next(new Error("Registration deadline must be before start date"));
  }
  next();
});

module.exports = mongoose.model("Hackathon", hackathonSchema);
