import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { Badge, StatusDot } from "~/components/ui/badge";
import {
  Users,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  try {
    const baseUrl = new URL(request.url).origin;
    const res = await fetch(`${baseUrl}/api/dashboard/today`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (!res.ok) return { dashboard: null };
    const json = await res.json();
    return { dashboard: json.data };
  } catch {
    return { dashboard: null };
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type Appointment = {
  _id: string;
  time: string;
  reason?: string;
  status: string;
  isUrgent: boolean;
  doctorName: string;
  patientId: { firstName: string; lastName: string; phone?: string } | null;
};

function AppointmentRow({ appt }: { appt: Appointment }) {
  const patientName = appt.patientId
    ? `${appt.patientId.firstName} ${appt.patientId.lastName}`
    : "Unknown Patient";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="text-sm font-bold text-slate-500 w-12 shrink-0 tabular-nums">
        {appt.time}
      </div>
      <StatusDot status={appt.isUrgent ? "urgent" : appt.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">{patientName}</p>
          {appt.isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700">
              Urgent
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{appt.reason || "General consultation"}</p>
      </div>
      <div className="text-right shrink-0">
        <Badge variant={appt.status as any}>{appt.status.replace("-", " ")}</Badge>
        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-28">{appt.doctorName}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { dashboard } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();

  const welcomeMessage = loading
    ? "Welcome to Clinic Coordinator"
    : config?.dashboardWelcomeMessage ?? "Good morning! Here's your clinic overview for today.";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const stats = dashboard?.stats ?? {
    total: 0,
    waiting: 0,
    inConsultation: 0,
    done: 0,
    cancelled: 0,
    urgent: 0,
  };
  const appointments: Appointment[] = dashboard?.appointments ?? [];
  const totalPatients: number = dashboard?.totalPatients ?? 0;

  const activeAppointments = appointments.filter((a) => a.status !== "cancelled");
  const urgentAppointments = appointments.filter((a) => a.isUrgent);

  return (
    <AppLayout
      title="Dashboard"
      breadcrumb={[{ label: "Dashboard" }]}
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-1">{today}</p>
              <h2 className="text-xl font-black leading-tight">{welcomeMessage}</h2>
              {stats.urgent > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-400/30 px-3 py-1.5 text-sm font-semibold text-white">
                  <AlertTriangle size={14} />
                  {stats.urgent} urgent patient{stats.urgent > 1 ? "s" : ""} need attention
                </div>
              )}
            </div>
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Today's Appointments"
            value={stats.total}
            icon={CalendarClock}
            color="bg-teal-600"
            sub={`${stats.done} completed`}
          />
          <StatCard
            label="Waiting"
            value={stats.waiting}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            label="In Consultation"
            value={stats.inConsultation}
            icon={Stethoscope}
            color="bg-blue-500"
          />
          <StatCard
            label="Total Patients"
            value={totalPatients}
            icon={Users}
            color="bg-violet-500"
            sub="Registered"
          />
        </div>

        {/* Urgent alert */}
        {urgentAppointments.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                Urgent Patients
              </h3>
            </div>
            <div className="space-y-2">
              {urgentAppointments.map((appt) => (
                <div key={appt._id} className="flex items-center gap-3 rounded-xl bg-red-100 px-3 py-2.5">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-900 truncate">
                      {appt.patientId
                        ? `${appt.patientId.firstName} ${appt.patientId.lastName}`
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-red-700 truncate">
                      {appt.time} · {appt.reason || "Urgent consultation"}
                    </p>
                  </div>
                  <Badge variant="urgent">Urgent</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-base font-bold text-slate-900">Today's Schedule</h3>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="px-6">
            {activeAppointments.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarClock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No appointments today</p>
                <p className="text-xs text-slate-400 mt-1">
                  <Link to="/appointments" className="text-teal-600 hover:underline">
                    Schedule an appointment
                  </Link>
                </p>
              </div>
            ) : (
              <div>
                {activeAppointments.slice(0, 8).map((appt) => (
                  <AppointmentRow key={appt._id} appt={appt} />
                ))}
                {activeAppointments.length > 8 && (
                  <div className="py-3 text-center">
                    <Link
                      to="/appointments"
                      className="text-sm font-medium text-teal-600 hover:text-teal-800"
                    >
                      +{activeAppointments.length - 8} more appointments →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/patients/new"
            className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 hover:border-teal-200 hover:bg-teal-50 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 group-hover:bg-teal-200 transition-colors shrink-0">
              <Users size={18} className="text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">New Patient</p>
              <p className="text-xs text-slate-500">Register a patient</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors" />
          </Link>

          <Link
            to="/appointments/new"
            className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 hover:border-teal-200 hover:bg-teal-50 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors shrink-0">
              <CalendarClock size={18} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Book Appointment</p>
              <p className="text-xs text-slate-500">Schedule a slot</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Link>

          <Link
            to="/prescriptions/new"
            className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm px-5 py-4 hover:border-teal-200 hover:bg-teal-50 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors shrink-0">
              <TrendingUp size={18} className="text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">New Prescription</p>
              <p className="text-xs text-slate-500">Issue a prescription</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-violet-500 transition-colors" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
