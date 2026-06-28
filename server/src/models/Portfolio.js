import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    title: { type: String, default: "Portfolio Content" },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Portfolio", portfolioSchema);
