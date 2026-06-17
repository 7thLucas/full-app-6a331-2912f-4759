import {
  prop,
  getModelForClass,
  modelOptions,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_patients",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
})
export class Patient extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  firstName!: string;

  @prop({ type: String, required: true, trim: true })
  lastName!: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  dateOfBirth?: string;

  @prop({ type: String, required: false, enum: ["Male", "Female", "Other"], default: "Other" })
  gender?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  phone?: string;

  @prop({ type: String, required: false, trim: true, lowercase: true, default: "" })
  email?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  address?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  bloodType?: string;

  @prop({ type: [String], required: false, default: [] })
  allergies?: string[];

  @prop({ type: String, required: false, trim: true, default: "" })
  medicalHistory?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  emergencyContactName?: string;

  @prop({ type: String, required: false, trim: true, default: "" })
  emergencyContactPhone?: string;

  @prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const PatientModel = getModelForClass(Patient);
