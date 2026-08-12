import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    /** Active training split for this user; null until they create/select one. */
    activeSplitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Split',
      default: null,
    },
    /** Current login session; new login replaces this and invalidates old tokens. */
    sessionId: { type: String, default: null },
  },
  { timestamps: true }
)

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    activeSplitId: this.activeSplitId ? this.activeSplitId.toString() : null,
  }
}

export const User = mongoose.model('User', userSchema)
