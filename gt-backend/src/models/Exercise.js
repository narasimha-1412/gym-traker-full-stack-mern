import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    weight: { type: String, default: '' },
    description: { type: String, default: '' },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
)

exerciseSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    workoutId: this.workoutId.toString(),
    name: this.name,
    weight: this.weight || '',
    description: this.description || '',
    done: !!this.done,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Exercise = mongoose.model('Exercise', exerciseSchema)
