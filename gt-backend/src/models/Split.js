import mongoose from 'mongoose'

const splitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

splitSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    title: this.title,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Split = mongoose.model('Split', splitSchema)
