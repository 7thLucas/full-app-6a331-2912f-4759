import {
  prop,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import mongoose from "mongoose";

export type AppointmentStatus = "waiting" | "in-consultation" | "done" | "cancelled";

@modelOptions({
  schemaOptions: {
    collection: "tbl_appointments",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
})
export class Appointment extends CommonTypegooseEntity {
  @prop({ type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true })
  patientId!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true, trim: true })
  doctorName!: string;

  @prop({ type: String, required: true })
  date!: string;

  @prop({ type: String, required: true })
  time!: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  reason?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  notes?: string;

  @prop({
    type: String,
    enum: ["waiting", "in-consultation", "done", "cancelled"],
    default: "waiting",
  })
  status!: AppointmentStatus;

  @prop({ type: Boolean, default: false })
  isUrgent!: boolean;
}

export const AppointmentModel = getModelForClass(Appointment);
