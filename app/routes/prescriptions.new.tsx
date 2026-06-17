import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, Form, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { ClinicInput } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const preselectedPatientId = url.searchParams.get("patientId") ?? "";
  const cookie = request.headers.get("cookie") ?? "";

  try {
    const patientsRes = await fetch(`${url.origin}/api/patients?limit=200`, { headers: { cookie } });
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

  // Parse medication items from dynamic fields
  const itemsRaw = String(formData.get("items") ?? "[]");
  let items: any[] = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    items = [];
  }

  const body = {
    patientId: String(formData.get("patientId") ?? ""),
    doctorName: String(formData.get("doctorName") ?? ""),
    date: String(formData.get("date") ?? ""),
    diagnosis: String(formData.get("diagnosis") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    items,
    status: "active",
  };

  if (!body.patientId || !body.doctorName || !body.date) {
    return { error: "Patient, doctor, and date are required" };
  }
  if (items.length === 0) {
    return { error: "At least one medication is required" };
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const res = await fetch(`${baseUrl}/api/prescriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message ?? "Failed to create prescription" };
    return redirect(`/prescriptions/${json.data._id}`);
  } catch (error: any) {
    return { error: error.message ?? "Failed to create prescription" };
  }
}

type MedItem = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

function newItem(): MedItem {
  return {
    id: Math.random().toString(36).slice(2),
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  };
}

export default function NewPrescriptionPage() {
  const { patients, preselectedPatientId, today } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [items, setItems] = useState<MedItem[]>([newItem()]);

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof MedItem, value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  return (
    <AppLayout
      breadcrumb={[
        { label: "Prescriptions", href: "/prescriptions" },
        { label: "New Prescription" },
      ]}
    >
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/prescriptions"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">New Prescription</h1>
            <p className="text-sm text-slate-500">Issue a prescription for a patient</p>
          </div>
        </div>

        {actionData && "error" in actionData && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-5">
          {/* Serialize items as JSON hidden field */}
          <input type="hidden" name="items" value={JSON.stringify(items.map(({ id, ...rest }) => rest))} />

          {/* Header info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Prescription Header
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
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="Prescribing Doctor"
                name="doctorName"
                required
                placeholder="Dr. Emily Clarke"
              />
              <ClinicInput
                label="Date"
                name="date"
                type="date"
                required
                defaultValue={today}
              />
            </div>

            <ClinicInput
              label="Diagnosis"
              name="diagnosis"
              placeholder="Essential Hypertension, Type 2 Diabetes..."
            />
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Medications
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Plus size={13} />
                Add medication
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Medication #{index + 1}
                    </p>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput
                      label="Medication name"
                      value={item.medication}
                      onChange={(e) => updateItem(item.id, "medication", e.target.value)}
                      placeholder="Amlodipine"
                      required
                    />
                    <ClinicInput
                      label="Dosage"
                      value={item.dosage}
                      onChange={(e) => updateItem(item.id, "dosage", e.target.value)}
                      placeholder="5mg"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ClinicInput
                      label="Frequency"
                      value={item.frequency}
                      onChange={(e) => updateItem(item.id, "frequency", e.target.value)}
                      placeholder="Once daily"
                      required
                    />
                    <ClinicInput
                      label="Duration"
                      value={item.duration}
                      onChange={(e) => updateItem(item.id, "duration", e.target.value)}
                      placeholder="30 days"
                    />
                  </div>
                  <ClinicInput
                    label="Instructions"
                    value={item.instructions}
                    onChange={(e) => updateItem(item.id, "instructions", e.target.value)}
                    placeholder="Take in the morning with food"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <Textarea
              label="Clinical Notes"
              name="notes"
              rows={3}
              placeholder="Additional clinical observations, follow-up instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/prescriptions"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              <FileText size={16} />
              Issue Prescription
            </button>
          </div>
        </Form>
      </div>
    </AppLayout>
  );
}
