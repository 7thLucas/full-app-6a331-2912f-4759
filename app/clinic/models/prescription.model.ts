import {
  prop,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export class PrescriptionItem {
  @prop({ type: String, required: true })
  medication!: string;

  @prop({ type: String, required: true })
  dosage!: string;

  @prop({ type: String, required: true })
  frequency!: string;

  @prop({ type: String, required: false, default: "" })
  duration?: string;

  @prop({ type: String, required: false, default: "" })
  instructions?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_prescriptions",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
})
export class Prescription extends CommonTypegooseEntity {
  @prop({ type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true })
  patientId!: mongoose.Types.ObjectId;

  @prop({ type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: false })
  appointmentId?: mongoose.Types.ObjectId;

  @prop({ type: String, required: true, trim: true })
  doctorName!: string;

  @prop({ type: String, required: true })
  date!: string;

  @prop({ type: () => [PrescriptionItem], default: [] })
  items!: PrescriptionItem[];

  @prop({ type: String, required: false, trim: true, default: "" })
  diagnosis?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  notes?: string;

  @prop({ type: String, enum: ["active", "completed", "cancelled"], default: "active" })
  status!: string;
}

export const PrescriptionModel = getModelForClass(Prescription);
