import mongoose from 'mongoose'

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Split',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
)

workoutSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    splitId: this.splitId.toString(),
    title: this.title,
    done: !!this.done,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Workout = mongoose.model('Workout', workoutSchema)
