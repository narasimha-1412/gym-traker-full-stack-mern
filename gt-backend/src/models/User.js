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
    weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
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
    weightUnit: this.weightUnit || 'kg',
  }
}

export const User = mongoose.model('User', userSchema)
