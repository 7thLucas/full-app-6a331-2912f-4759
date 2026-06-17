import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { Badge } from "~/components/ui/badge";
import { ClinicInput } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CalendarClock,
  FileText,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const baseUrl = new URL(request.url).origin;
  const cookie = request.headers.get("cookie") ?? "";

  const [patientRes, appointmentsRes, prescriptionsRes] = await Promise.all([
    fetch(`${baseUrl}/api/patients/${params.id}`, { headers: { cookie } }),
    fetch(`${baseUrl}/api/appointments?patientId=${params.id}&limit=5`, { headers: { cookie } }),
    fetch(`${baseUrl}/api/prescriptions?patientId=${params.id}&limit=5`, { headers: { cookie } }),
  ]);

  if (!patientRes.ok) throw new Response("Patient not found", { status: 404 });

  const [patientJson, appointmentsJson, prescriptionsJson] = await Promise.all([
    patientRes.json(),
    appointmentsRes.json(),
    prescriptionsRes.json(),
  ]);

  return {
    patient: patientJson.data,
    appointments: appointmentsJson.data ?? [],
    prescriptions: prescriptionsJson.data ?? [],
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("_intent") ?? "update");

  if (intent === "delete") {
    const baseUrl = new URL(request.url).origin;
    await fetch(`${baseUrl}/api/patients/${params.id}`, {
      method: "DELETE",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    return redirect("/patients");
  }

  const allergiesRaw = String(formData.get("allergies") ?? "");
  const allergies = allergiesRaw
    ? allergiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  const body = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    bloodType: String(formData.get("bloodType") ?? ""),
    allergies,
    medicalHistory: String(formData.get("medicalHistory") ?? ""),
    emergencyContactName: String(formData.get("emergencyContactName") ?? ""),
    emergencyContactPhone: String(formData.get("emergencyContactPhone") ?? ""),
  };

  try {
    const baseUrl = new URL(request.url).origin;
    const res = await fetch(`${baseUrl}/api/patients/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message ?? "Failed to update patient" };
    return { success: true };
  } catch (error: any) {
    return { error: error.message ?? "Failed to update patient" };
  }
}

function getAge(dob?: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} years old`;
}

export default function PatientDetailPage() {
  const { patient, appointments, prescriptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [editing, setEditing] = useState(false);

  return (
    <AppLayout
      breadcrumb={[
        { label: "Patients", href: "/patients" },
        { label: `${patient.firstName} ${patient.lastName}` },
      ]}
    >
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 truncate">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-slate-500">
              {getAge(patient.dateOfBirth)}
              {patient.gender ? ` · ${patient.gender}` : ""}
              {patient.bloodType ? ` · Blood type ${patient.bloodType}` : ""}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {actionData && "error" in actionData && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {actionData.error}
          </div>
        )}
        {actionData && "success" in actionData && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700">
            Patient record updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {/* Profile + edit form */}
            {editing ? (
              <Form method="post" className="space-y-5">
                <input type="hidden" name="_intent" value="update" />

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Edit Patient
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput
                      label="First Name"
                      name="firstName"
                      defaultValue={patient.firstName}
                      required
                    />
                    <ClinicInput
                      label="Last Name"
                      name="lastName"
                      defaultValue={patient.lastName}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      defaultValue={patient.dateOfBirth}
                    />
                    <Select label="Gender" name="gender" defaultValue={patient.gender}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput label="Phone" name="phone" type="tel" defaultValue={patient.phone} />
                    <ClinicInput label="Email" name="email" type="email" defaultValue={patient.email} />
                  </div>
                  <ClinicInput label="Address" name="address" defaultValue={patient.address} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Blood Type" name="bloodType" defaultValue={patient.bloodType}>
                      <option value="">Unknown</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </Select>
                    <ClinicInput
                      label="Allergies"
                      name="allergies"
                      defaultValue={(patient.allergies ?? []).join(", ")}
                      placeholder="Comma-separated"
                    />
                  </div>
                  <Textarea
                    label="Medical History"
                    name="medicalHistory"
                    rows={3}
                    defaultValue={patient.medicalHistory}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput
                      label="Emergency Contact"
                      name="emergencyContactName"
                      defaultValue={patient.emergencyContactName}
                    />
                    <ClinicInput
                      label="Emergency Phone"
                      name="emergencyContactPhone"
                      defaultValue={patient.emergencyContactPhone}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </div>
              </Form>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Patient Information
                </h2>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone size={13} className="text-slate-400" />
                      {patient.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Email</p>
                    <div className="flex items-center gap-1.5 text-slate-700 truncate">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{patient.email || "—"}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Address</p>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      {patient.address || "—"}
                    </div>
                  </div>
                </div>

                {patient.medicalHistory && (
                  <div className="border-t border-slate-50 pt-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">Medical History</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{patient.medicalHistory}</p>
                  </div>
                )}

                {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                  <div className="border-t border-slate-50 pt-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">Emergency Contact</p>
                    <p className="text-sm text-slate-700 font-medium">{patient.emergencyContactName}</p>
                    <p className="text-sm text-slate-500">{patient.emergencyContactPhone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Appointments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <CalendarClock size={15} className="text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">Appointments</h3>
                </div>
                <Link
                  to={`/appointments/new?patientId=${patient._id}`}
                  className="text-xs font-medium text-teal-600 hover:text-teal-800"
                >
                  + Book
                </Link>
              </div>
              <div className="px-5">
                {appointments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No appointments</p>
                ) : (
                  appointments.map((appt: any) => (
                    <div key={appt._id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                      <div className="text-xs font-bold text-slate-500 w-20 shrink-0">
                        {appt.date} {appt.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{appt.reason || "Consultation"}</p>
                        <p className="text-xs text-slate-400">{appt.doctorName}</p>
                      </div>
                      <Badge variant={appt.status as any}>{appt.status.replace("-", " ")}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-900">Prescriptions</h3>
                </div>
                <Link
                  to={`/prescriptions/new?patientId=${patient._id}`}
                  className="text-xs font-medium text-teal-600 hover:text-teal-800"
                >
                  + Prescribe
                </Link>
              </div>
              <div className="px-5">
                {prescriptions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No prescriptions</p>
                ) : (
                  prescriptions.map((rx: any) => (
                    <Link
                      key={rx._id}
                      to={`/prescriptions/${rx._id}`}
                      className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-5 px-5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {rx.diagnosis || "Prescription"}
                        </p>
                        <p className="text-xs text-slate-400">{rx.date} · {rx.items?.length ?? 0} medication{rx.items?.length !== 1 ? "s" : ""}</p>
                      </div>
                      <Badge variant={rx.status as any}>{rx.status}</Badge>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Allergy alerts */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                    Allergies
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((a: string) => (
                    <span
                      key={a}
                      className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Overview</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Appointments</span>
                <span className="font-bold text-slate-900">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Prescriptions</span>
                <span className="font-bold text-slate-900">{prescriptions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Blood Type</span>
                <span className="font-bold text-slate-900">{patient.bloodType || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge variant="active">Active</Badge>
              </div>
            </div>

            {/* Archive patient */}
            {!editing && (
              <Form method="post">
                <input type="hidden" name="_intent" value="delete" />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Archive this patient record? This action can be undone by an admin.")) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  Archive Patient
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
