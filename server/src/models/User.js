import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["pending_verification", "active", "invited", "disabled"], default: "pending_verification" },
    emailVerified: { type: Boolean, default: false },
    emailVerificationCodeHash: { type: String, default: "" },
    emailVerificationExpiresAt: { type: Date, default: null },
    emailVerifiedAt: { type: Date, default: null },
    onboardingComplete: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
