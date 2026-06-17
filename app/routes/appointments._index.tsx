import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form, Link, useSubmit } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { Badge } from "~/components/ui/badge";
import {
  CalendarClock,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Stethoscope,
  CheckCircle2,
  Filter,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const today = new Date().toISOString().split("T")[0];
  const date = url.searchParams.get("date") ?? today;
  const status = url.searchParams.get("status") ?? "all";

  try {
    const params = new URLSearchParams({ date, limit: "100" });
    if (status !== "all") params.set("status", status);

    const res = await fetch(`${url.origin}/api/appointments?${params}`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const json = await res.json();
    return { appointments: json.data ?? [], date, status };
  } catch {
    return { appointments: [], date, status };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const id = String(formData.get("id"));
  const newStatus = String(formData.get("status"));

  try {
    const baseUrl = new URL(request.url).origin;
    await fetch(`${baseUrl}/api/appointments/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

type Appointment = {
  _id: string;
  time: string;
  reason?: string;
  status: string;
  isUrgent: boolean;
  doctorName: string;
  notes?: string;
  patientId: { _id: string; firstName: string; lastName: string; phone?: string } | null;
};

const statusOptions = [
  { value: "all", label: "All", icon: Filter },
  { value: "waiting", label: "Waiting", icon: Clock },
  { value: "in-consultation", label: "In Consult", icon: Stethoscope },
  { value: "done", label: "Done", icon: CheckCircle2 },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  if (dateStr === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const statusTransitions: Record<string, string[]> = {
  waiting: ["in-consultation", "cancelled"],
  "in-consultation": ["done", "waiting"],
  done: [],
  cancelled: [],
};

export default function AppointmentsPage() {
  const { appointments, date, status } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const stats = {
    waiting: (appointments as Appointment[]).filter((a) => a.status === "waiting").length,
    inConsultation: (appointments as Appointment[]).filter((a) => a.status === "in-consultation").length,
    done: (appointments as Appointment[]).filter((a) => a.status === "done").length,
    urgent: (appointments as Appointment[]).filter((a) => a.isUrgent && a.status !== "cancelled").length,
  };

  function handleStatusChange(id: string, newStatus: string) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", newStatus);
    submit(formData, { method: "post" });
  }

  return (
    <AppLayout breadcrumb={[{ label: "Appointments" }]}>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Appointments</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {(appointments as Appointment[]).length} appointment{(appointments as Appointment[]).length !== 1 ? "s" : ""} on {formatDateDisplay(date)}
            </p>
          </div>
          <Link
            to="/appointments/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} />
            Book Appointment
          </Link>
        </div>

        {/* Date navigator + status filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date navigator */}
          <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
            <Link
              to={`/appointments?date=${addDays(date, -1)}&status=${status}`}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </Link>
            <span className="text-sm font-bold text-slate-900 px-2 min-w-28 text-center">
              {formatDateDisplay(date)}
            </span>
            <Link
              to={`/appointments?date=${addDays(date, 1)}&status=${status}`}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </Link>
            <Link
              to={`/appointments?date=${new Date().toISOString().split("T")[0]}&status=${status}`}
              className="ml-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
            >
              Today
            </Link>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
            {statusOptions.map(({ value, label }) => (
              <Link
                key={value}
                to={`/appointments?date=${date}&status=${value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  status === value
                    ? "bg-teal-600 text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Waiting", value: stats.waiting, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
            { label: "In Consult", value: stats.inConsultation, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            { label: "Done", value: stats.done, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Urgent", value: stats.urgent, color: "text-red-600", bg: "bg-red-50 border-red-200" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 text-center ${bg}`}>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className={`text-xs font-bold uppercase tracking-wide mt-0.5 ${color} opacity-80`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Appointments list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {(appointments as Appointment[]).length === 0 ? (
            <div className="py-16 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">No appointments for this day</p>
              <Link
                to="/appointments/new"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                <Plus size={14} /> Book an appointment
              </Link>
            </div>
          ) : (
            <div>
              {(appointments as Appointment[]).map((appt) => (
                <div
                  key={appt._id}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${
                    appt.isUrgent ? "bg-red-50/30 border-l-4 border-l-red-400" : ""
                  }`}
                >
                  {/* Time */}
                  <div className="text-sm font-bold text-slate-500 w-12 shrink-0 tabular-nums pt-0.5">
                    {appt.time}
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/patients/${appt.patientId?._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                      >
                        {appt.patientId
                          ? `${appt.patientId.firstName} ${appt.patientId.lastName}`
                          : "Unknown Patient"}
                      </Link>
                      {appt.isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-700">
                          <AlertTriangle size={10} /> Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {appt.reason || "General consultation"} · {appt.doctorName}
                    </p>
                    {appt.patientId?.phone && (
                      <p className="text-xs text-slate-400 mt-0.5">{appt.patientId.phone}</p>
                    )}
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={appt.status as any}>{appt.status.replace("-", " ")}</Badge>

                    {/* Status transition buttons */}
                    {statusTransitions[appt.status]?.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusChange(appt._id, nextStatus)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors border ${
                          nextStatus === "cancelled"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : nextStatus === "done"
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : nextStatus === "in-consultation"
                            ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {nextStatus === "in-consultation"
                          ? "Start"
                          : nextStatus === "done"
                          ? "Done"
                          : nextStatus === "waiting"
                          ? "Re-queue"
                          : "Cancel"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
