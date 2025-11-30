import mongoose from "mongoose";

const { Schema, model } = mongoose;

const metricSchema = new Schema(
  {
    kind: {
      type: String,
      enum: [
        "reminder_sent",      // recordatorio de tarea
        "performance_alert",  // notificación por rendimiento (para después)
      ],
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" }, // alumno afectado
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment" },
    reading: { type: Schema.Types.ObjectId, ref: "Reading" },
    // por si quieres guardar cosas extras sin esquema rígido
    meta: { type: Schema.Types.Mixed },
    source: { type: String, default: "n8n" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  }
);

export default model("Metric", metricSchema);
