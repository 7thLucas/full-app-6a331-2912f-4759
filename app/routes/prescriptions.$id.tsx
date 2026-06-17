import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Pill, User, Stethoscope, FileText, X } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const baseUrl = new URL(request.url).origin;
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${baseUrl}/api/prescriptions/${params.id}`, { headers: { cookie } });
  if (!res.ok) throw new Response("Prescription not found", { status: 404 });

  const json = await res.json();
  return { prescription: json.data };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("_intent") ?? "cancel");

  const newStatus = intent === "complete" ? "completed" : "cancelled";

  try {
    const baseUrl = new URL(request.url).origin;
    await fetch(`${baseUrl}/api/prescriptions/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

type PrescriptionItem = {
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
};

export default function PrescriptionDetailPage() {
  const { prescription } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const patient = prescription.patientId;

  return (
    <AppLayout
      breadcrumb={[
        { label: "Prescriptions", href: "/prescriptions" },
        { label: prescription.diagnosis || "Prescription" },
      ]}
    >
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/prescriptions"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 truncate">
              {prescription.diagnosis || "Prescription"}
            </h1>
            <p className="text-sm text-slate-500">
              Issued on {prescription.date} by {prescription.doctorName}
            </p>
          </div>
          <Badge variant={prescription.status as any}>{prescription.status}</Badge>
        </div>

        {actionData && "error" in actionData && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {actionData.error}
          </div>
        )}
        {actionData && "success" in actionData && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700">
            Prescription status updated.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {/* Patient info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={15} className="text-teal-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Patient</h2>
              </div>
              {patient ? (
                <Link
                  to={`/patients/${patient._id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-bold uppercase shrink-0">
                    {patient.firstName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-slate-500">View patient record →</p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-slate-500">Patient information unavailable</p>
              )}
            </div>

            {/* Medications */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={15} className="text-violet-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Medications ({prescription.items?.length ?? 0})
                </h2>
              </div>

              <div className="space-y-3">
                {(prescription.items as PrescriptionItem[])?.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.medication}</p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {item.dosage} · {item.frequency}
                          {item.duration ? ` · ${item.duration}` : ""}
                        </p>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                    </div>
                    {item.instructions && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={15} className="text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Clinical Notes</h2>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{prescription.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-900 text-right max-w-32 truncate">{prescription.doctorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{prescription.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Medications</span>
                <span className="font-bold text-slate-900">{prescription.items?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Status</span>
                <Badge variant={prescription.status as any}>{prescription.status}</Badge>
              </div>
            </div>

            {prescription.status === "active" && (
              <div className="space-y-2">
                <Form method="post">
                  <input type="hidden" name="_intent" value="complete" />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="_intent" value="cancel" />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!confirm("Cancel this prescription?")) e.preventDefault();
                    }}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Cancel Prescription
                  </button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
