import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link, Form } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { Badge } from "~/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  ChevronRight,
  Pill,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "all";
  const search = url.searchParams.get("search") ?? "";
  const page = url.searchParams.get("page") ?? "1";

  try {
    const params = new URLSearchParams({ page, limit: "20" });
    if (status !== "all") params.set("status", status);

    const res = await fetch(`${url.origin}/api/prescriptions?${params}`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const json = await res.json();
    let data = json.data ?? [];

    // Client-side filter by search (patient name match)
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((rx: any) => {
        const patient = rx.patientId;
        if (!patient) return false;
        return (
          patient.firstName?.toLowerCase().includes(q) ||
          patient.lastName?.toLowerCase().includes(q)
        );
      });
    }

    return {
      prescriptions: data,
      total: json.total ?? 0,
      status,
      search,
      page: parseInt(page),
    };
  } catch {
    return { prescriptions: [], total: 0, status, search, page: 1 };
  }
}

type Prescription = {
  _id: string;
  date: string;
  diagnosis?: string;
  status: string;
  doctorName: string;
  items?: Array<{ medication: string; dosage: string }>;
  patientId: { _id: string; firstName: string; lastName: string } | null;
};

export default function PrescriptionsPage() {
  const { prescriptions, total, status, search, page } = useLoaderData<typeof loader>();

  return (
    <AppLayout breadcrumb={[{ label: "Prescriptions" }]}>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Prescriptions</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} prescription{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link
            to="/prescriptions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} />
            New Prescription
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Form method="get" className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by patient name..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-400"
            />
            <input type="hidden" name="status" value={status} />
          </Form>

          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
            {["all", "active", "completed", "cancelled"].map((s) => (
              <Link
                key={s}
                to={`/prescriptions?status=${s}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  status === s
                    ? "bg-teal-600 text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {(prescriptions as Prescription[]).length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                {search ? `No prescriptions matching "${search}"` : "No prescriptions yet"}
              </p>
              {!search && (
                <Link
                  to="/prescriptions/new"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                  <Plus size={14} /> Issue first prescription
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Patient</span>
                <span>Diagnosis</span>
                <span>Date</span>
                <span>Meds</span>
                <span>Status</span>
              </div>

              {(prescriptions as Prescription[]).map((rx) => (
                <Link
                  key={rx._id}
                  to={`/prescriptions/${rx._id}`}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:gap-4 sm:items-center px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-teal-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-sm font-bold uppercase shrink-0">
                      {rx.patientId?.firstName?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {rx.patientId ? `${rx.patientId.firstName} ${rx.patientId.lastName}` : "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">{rx.doctorName}</p>
                    </div>
                  </div>

                  <p className="mt-1 sm:mt-0 ml-11 sm:ml-0 text-sm text-slate-600 truncate">
                    {rx.diagnosis || "—"}
                  </p>

                  <span className="hidden sm:block text-sm text-slate-500 tabular-nums">
                    {rx.date}
                  </span>

                  <div className="hidden sm:flex items-center gap-1 text-sm text-slate-600 font-medium">
                    <Pill size={13} className="text-slate-400" />
                    {rx.items?.length ?? 0}
                  </div>

                  <div className="mt-2 sm:mt-0 ml-11 sm:ml-0 flex items-center gap-2">
                    <Badge variant={rx.status as any}>{rx.status}</Badge>
                    <ChevronRight
                      size={14}
                      className="hidden sm:block text-slate-300 group-hover:text-teal-500 transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
