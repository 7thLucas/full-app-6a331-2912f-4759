import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link, Form, useNavigation } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const page = url.searchParams.get("page") ?? "1";

  try {
    const baseUrl = url.origin;
    const params = new URLSearchParams({ page, limit: "20" });
    if (search) params.set("search", search);

    const res = await fetch(`${baseUrl}/api/patients?${params}`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const json = await res.json();
    return { patients: json.data ?? [], total: json.total ?? 0, search, page: parseInt(page) };
  } catch {
    return { patients: [], total: 0, search, page: 1 };
  }
}

type Patient = {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  allergies?: string[];
  bloodType?: string;
};

function getAge(dob?: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  return `${age}y`;
}

export default function PatientsPage() {
  const { patients, total, search, page } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <AppLayout
      breadcrumb={[{ label: "Patients" }]}
    >
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Patients</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} registered patient{total !== 1 ? "s" : ""}</p>
          </div>
          <Link
            to="/patients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} />
            New Patient
          </Link>
        </div>

        {/* Search */}
        <Form method="get" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, phone, or email..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-400"
          />
        </Form>

        {/* Patient list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-r-transparent" />
              <p className="mt-3 text-sm text-slate-500">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                {search ? `No patients matching "${search}"` : "No patients yet"}
              </p>
              {!search && (
                <Link
                  to="/patients/new"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                  <Plus size={14} /> Add first patient
                </Link>
              )}
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Patient</span>
                <span>Contact</span>
                <span>Age</span>
                <span>Blood</span>
                <span></span>
              </div>

              {/* Rows */}
              {(patients as Patient[]).map((patient) => (
                <Link
                  key={patient._id}
                  to={`/patients/${patient._id}`}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:gap-4 sm:items-center px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-teal-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-bold uppercase shrink-0">
                      {patient.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      {patient.allergies && patient.allergies.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle size={11} />
                          {patient.allergies.length} allerg{patient.allergies.length === 1 ? "y" : "ies"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 sm:mt-0 ml-12 sm:ml-0 space-y-0.5">
                    {patient.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} className="shrink-0" />
                        {patient.phone}
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate max-w-48">{patient.email}</span>
                      </div>
                    )}
                  </div>

                  <span className="hidden sm:block text-sm text-slate-600 font-medium">
                    {getAge(patient.dateOfBirth)}
                  </span>

                  <span className="hidden sm:block text-sm font-bold text-slate-700">
                    {patient.bloodType || "—"}
                  </span>

                  <ChevronRight
                    size={16}
                    className="hidden sm:block text-slate-300 group-hover:text-teal-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  to={`/patients?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page * 20 < total && (
                <Link
                  to={`/patients?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
