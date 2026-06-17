import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { PatientModel } from "./models/patient.model";
import { AppointmentModel } from "./models/appointment.model";
import { PrescriptionModel } from "./models/prescription.model";

const router = Router();

// ─── PATIENTS ──────────────────────────────────────────────────────────────

router.get("/api/patients", requireAuth, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { isActive: true };
    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    const [patients, total] = await Promise.all([
      PatientModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      PatientModel.countDocuments(query),
    ]);

    res.json({ success: true, data: patients, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/api/patients/:id", requireAuth, async (req, res) => {
  try {
    const patient = await PatientModel.findById(req.params.id).lean();
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/api/patients", requireAuth, async (req, res) => {
  try {
    const patient = await PatientModel.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/api/patients/:id", requireAuth, async (req, res) => {
  try {
    const patient = await PatientModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/api/patients/:id", requireAuth, async (req, res) => {
  try {
    await PatientModel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Patient archived" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── APPOINTMENTS ───────────────────────────────────────────────────────────

router.get("/api/appointments", requireAuth, async (req, res) => {
  try {
    const { date, status, patientId, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(200, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {};
    if (date) query.date = String(date);
    if (status && status !== "all") query.status = String(status);
    if (patientId) query.patientId = String(patientId);

    const [appointments, total] = await Promise.all([
      AppointmentModel.find(query)
        .populate("patientId", "firstName lastName phone")
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AppointmentModel.countDocuments(query),
    ]);

    res.json({ success: true, data: appointments, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/api/appointments/:id", requireAuth, async (req, res) => {
  try {
    const appointment = await AppointmentModel.findById(req.params.id)
      .populate("patientId")
      .lean();
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/api/appointments", requireAuth, async (req, res) => {
  try {
    // Conflict check: same doctor, same date+time
    const existing = await AppointmentModel.findOne({
      doctorName: req.body.doctorName,
      date: req.body.date,
      time: req.body.time,
      status: { $nin: ["cancelled"] },
    });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "This time slot is already booked for this doctor",
      });
      return;
    }
    const appointment = await AppointmentModel.create(req.body);
    const populated = await AppointmentModel.findById(appointment._id)
      .populate("patientId", "firstName lastName phone")
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/api/appointments/:id", requireAuth, async (req, res) => {
  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("patientId", "firstName lastName phone")
      .lean();
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await AppointmentModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("patientId", "firstName lastName phone")
      .lean();
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/api/appointments/:id", requireAuth, async (req, res) => {
  try {
    await AppointmentModel.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PRESCRIPTIONS ─────────────────────────────────────────────────────────

router.get("/api/prescriptions", requireAuth, async (req, res) => {
  try {
    const { patientId, status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {};
    if (patientId) query.patientId = String(patientId);
    if (status && status !== "all") query.status = String(status);

    const [prescriptions, total] = await Promise.all([
      PrescriptionModel.find(query)
        .populate("patientId", "firstName lastName")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PrescriptionModel.countDocuments(query),
    ]);

    res.json({ success: true, data: prescriptions, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/api/prescriptions/:id", requireAuth, async (req, res) => {
  try {
    const prescription = await PrescriptionModel.findById(req.params.id)
      .populate("patientId")
      .lean();
    if (!prescription) {
      res.status(404).json({ success: false, message: "Prescription not found" });
      return;
    }
    res.json({ success: true, data: prescription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/api/prescriptions", requireAuth, async (req, res) => {
  try {
    const prescription = await PrescriptionModel.create(req.body);
    const populated = await PrescriptionModel.findById(prescription._id)
      .populate("patientId", "firstName lastName")
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/api/prescriptions/:id", requireAuth, async (req, res) => {
  try {
    const prescription = await PrescriptionModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("patientId", "firstName lastName")
      .lean();
    if (!prescription) {
      res.status(404).json({ success: false, message: "Prescription not found" });
      return;
    }
    res.json({ success: true, data: prescription });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/api/prescriptions/:id", requireAuth, async (req, res) => {
  try {
    await PrescriptionModel.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    res.json({ success: true, message: "Prescription cancelled" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DASHBOARD ─────────────────────────────────────────────────────────────

router.get("/api/dashboard/today", requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [todayAppointments, totalPatients, pendingAppointments] = await Promise.all([
      AppointmentModel.find({ date: today })
        .populate("patientId", "firstName lastName phone")
        .sort({ time: 1 })
        .lean(),
      PatientModel.countDocuments({ isActive: true }),
      AppointmentModel.countDocuments({ date: today, status: { $in: ["waiting", "in-consultation"] } }),
    ]);

    const stats = {
      total: todayAppointments.length,
      waiting: todayAppointments.filter((a) => a.status === "waiting").length,
      inConsultation: todayAppointments.filter((a) => a.status === "in-consultation").length,
      done: todayAppointments.filter((a) => a.status === "done").length,
      cancelled: todayAppointments.filter((a) => a.status === "cancelled").length,
      urgent: todayAppointments.filter((a) => a.isUrgent).length,
    };

    res.json({
      success: true,
      data: {
        appointments: todayAppointments,
        stats,
        totalPatients,
        pendingAppointments,
        date: today,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
