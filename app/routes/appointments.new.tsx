import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, Form, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { ClinicInput } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { ArrowLeft, CalendarPlus } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const preselectedPatientId = url.searchParams.get("patientId") ?? "";

  const baseUrl = url.origin;
  const cookie = request.headers.get("cookie") ?? "";

  try {
    const [patientsRes] = await Promise.all([
      fetch(`${baseUrl}/api/patients?limit=200`, { headers: { cookie } }),
    ]);
    const patientsJson = await patientsRes.json();

    return {
      patients: patientsJson.data ?? [],
      preselectedPatientId,
      today: new Date().toISOString().split("T")[0],
    };
  } catch {
    return { patients: [], preselectedPatientId, today: new Date().toISOString().split("T")[0] };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();

  const body = {
    patientId: String(formData.get("patientId") ?? ""),
    doctorName: String(formData.get("doctorName") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    isUrgent: formData.get("isUrgent") === "on",
  };

  if (!body.patientId || !body.doctorName || !body.date || !body.time) {
    return { error: "Patient, doctor, date, and time are required" };
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const res = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message ?? "Failed to book appointment" };
    return redirect(`/appointments?date=${body.date}`);
  } catch (error: any) {
    return { error: error.message ?? "Failed to book appointment" };
  }
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function NewAppointmentPage() {
  const { patients, preselectedPatientId, today } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <AppLayout
      breadcrumb={[
        { label: "Appointments", href: "/appointments" },
        { label: "Book Appointment" },
      ]}
    >
      <div className="p-6 max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/appointments"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Book Appointment</h1>
            <p className="text-sm text-slate-500">Schedule a new patient appointment</p>
          </div>
        </div>

        {actionData && "error" in actionData && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Appointment Details
            </h2>

            <Select
              label="Patient"
              name="patientId"
              required
              defaultValue={preselectedPatientId}
            >
              <option value="">Select a patient...</option>
              {(patients as any[]).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName}
                  {p.phone ? ` — ${p.phone}` : ""}
                </option>
              ))}
            </Select>

            <ClinicInput
              label="Doctor / Practitioner"
              name="doctorName"
              required
              placeholder="Dr. Emily Clarke"
            />

            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="Date"
                name="date"
                type="date"
                required
                defaultValue={today}
                min={today}
              />
              <Select label="Time Slot" name="time" required>
                <option value="">Select time...</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>

            <ClinicInput
              label="Reason for Visit"
              name="reason"
              placeholder="Blood pressure check-up, follow-up, etc."
            />

            <Textarea
              label="Additional Notes"
              name="notes"
              rows={2}
              placeholder="Any special instructions or notes..."
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isUrgent"
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-slate-300 bg-white peer-checked:border-red-500 peer-checked:bg-red-500 transition-colors flex items-center justify-center">
                  <svg className="hidden peer-checked:block h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-700">Mark as urgent</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              to="/appointments"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              <CalendarPlus size={16} />
              Book Appointment
            </button>
          </div>
        </Form>
      </div>
    </AppLayout>
  );
}
