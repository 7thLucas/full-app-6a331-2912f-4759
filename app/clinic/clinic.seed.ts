import { createLogger } from "~/lib/logger";
import { PatientModel } from "./models/patient.model";
import { AppointmentModel } from "./models/appointment.model";
import { PrescriptionModel } from "./models/prescription.model";

const logger = createLogger("ClinicSeed");

export async function seedClinicData(): Promise<void> {
  const existingPatients = await PatientModel.countDocuments();
  if (existingPatients > 0) {
    logger.info("Clinic data already seeded. Skipping.");
    return;
  }

  logger.info("Seeding clinic demo data...");

  const today = new Date().toISOString().split("T")[0];

  // Create demo patients
  const patients = await PatientModel.insertMany([
    {
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "1985-03-15",
      gender: "Female",
      phone: "+1 555-0101",
      email: "sarah.johnson@example.com",
      address: "12 Oak Street, Springfield",
      bloodType: "A+",
      allergies: ["Penicillin"],
      medicalHistory: "Hypertension (controlled). Annual check-ups required.",
      emergencyContactName: "Tom Johnson",
      emergencyContactPhone: "+1 555-0102",
      isActive: true,
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      dateOfBirth: "1972-07-22",
      gender: "Male",
      phone: "+1 555-0201",
      email: "michael.chen@example.com",
      address: "45 Maple Ave, Springfield",
      bloodType: "O+",
      allergies: ["Sulfa drugs", "Latex"],
      medicalHistory: "Type 2 Diabetes. Regular HbA1c monitoring.",
      emergencyContactName: "Lisa Chen",
      emergencyContactPhone: "+1 555-0202",
      isActive: true,
    },
    {
      firstName: "Emma",
      lastName: "Williams",
      dateOfBirth: "1995-11-30",
      gender: "Female",
      phone: "+1 555-0301",
      email: "emma.williams@example.com",
      address: "78 Pine Road, Springfield",
      bloodType: "B-",
      allergies: [],
      medicalHistory: "Asthma (mild). Uses Salbutamol inhaler as needed.",
      emergencyContactName: "James Williams",
      emergencyContactPhone: "+1 555-0302",
      isActive: true,
    },
    {
      firstName: "Robert",
      lastName: "Davis",
      dateOfBirth: "1960-04-08",
      gender: "Male",
      phone: "+1 555-0401",
      email: "robert.davis@example.com",
      address: "23 Elm Street, Springfield",
      bloodType: "AB+",
      allergies: ["Aspirin"],
      medicalHistory: "Post-cardiac surgery (2019). On anticoagulant therapy.",
      emergencyContactName: "Mary Davis",
      emergencyContactPhone: "+1 555-0402",
      isActive: true,
    },
    {
      firstName: "Aisha",
      lastName: "Patel",
      dateOfBirth: "1990-08-14",
      gender: "Female",
      phone: "+1 555-0501",
      email: "aisha.patel@example.com",
      address: "56 Cedar Lane, Springfield",
      bloodType: "A-",
      allergies: ["Ibuprofen"],
      medicalHistory: "Migraine disorder. Monthly preventive medication.",
      emergencyContactName: "Raj Patel",
      emergencyContactPhone: "+1 555-0502",
      isActive: true,
    },
    {
      firstName: "Carlos",
      lastName: "Martinez",
      dateOfBirth: "1978-12-03",
      gender: "Male",
      phone: "+1 555-0601",
      email: "carlos.martinez@example.com",
      address: "90 Birch Blvd, Springfield",
      bloodType: "O-",
      allergies: [],
      medicalHistory: "Lower back pain. Physical therapy ongoing.",
      emergencyContactName: "Maria Martinez",
      emergencyContactPhone: "+1 555-0602",
      isActive: true,
    },
  ]);

  // Create today's appointments
  const appointments = await AppointmentModel.insertMany([
    {
      patientId: patients[0]._id,
      doctorName: "Dr. Emily Clarke",
      date: today,
      time: "09:00",
      reason: "Blood pressure check-up",
      status: "done",
      isUrgent: false,
    },
    {
      patientId: patients[1]._id,
      doctorName: "Dr. James Wong",
      date: today,
      time: "09:30",
      reason: "Diabetes follow-up and HbA1c review",
      status: "in-consultation",
      isUrgent: false,
    },
    {
      patientId: patients[2]._id,
      doctorName: "Dr. Emily Clarke",
      date: today,
      time: "10:00",
      reason: "Asthma management",
      status: "waiting",
      isUrgent: false,
    },
    {
      patientId: patients[3]._id,
      doctorName: "Dr. James Wong",
      date: today,
      time: "10:30",
      reason: "Cardiac review — anticoagulant levels",
      status: "waiting",
      isUrgent: true,
    },
    {
      patientId: patients[4]._id,
      doctorName: "Dr. Emily Clarke",
      date: today,
      time: "11:00",
      reason: "Migraine medication review",
      status: "waiting",
      isUrgent: false,
    },
    {
      patientId: patients[5]._id,
      doctorName: "Dr. James Wong",
      date: today,
      time: "11:30",
      reason: "Back pain follow-up",
      status: "waiting",
      isUrgent: false,
    },
  ]);

  // Create sample prescriptions
  await PrescriptionModel.insertMany([
    {
      patientId: patients[0]._id,
      appointmentId: appointments[0]._id,
      doctorName: "Dr. Emily Clarke",
      date: today,
      diagnosis: "Essential Hypertension",
      items: [
        {
          medication: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take in the morning with or without food",
        },
        {
          medication: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Monitor blood pressure weekly",
        },
      ],
      notes: "Blood pressure well-controlled. Continue current regimen.",
      status: "active",
    },
    {
      patientId: patients[1]._id,
      doctorName: "Dr. James Wong",
      date: today,
      diagnosis: "Type 2 Diabetes Mellitus",
      items: [
        {
          medication: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "90 days",
          instructions: "Take with meals to reduce GI side effects",
        },
        {
          medication: "Gliclazide",
          dosage: "80mg",
          frequency: "Once daily",
          duration: "90 days",
          instructions: "Take before breakfast",
        },
      ],
      notes: "HbA1c target: below 7%. Dietary counselling recommended.",
      status: "active",
    },
  ]);

  logger.info("Clinic demo data seeded successfully.");
}
