import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, Form, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppLayout } from "~/components/layout/AppLayout";
import { ClinicInput } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
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
    const res = await fetch(`${baseUrl}/api/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.message ?? "Failed to create patient" };
    return redirect(`/patients/${json.data._id}`);
  } catch (error: any) {
    return { error: error.message ?? "Failed to create patient" };
  }
}

export default function NewPatientPage() {
  const actionData = useActionData<typeof action>();

  return (
    <AppLayout
      breadcrumb={[
        { label: "Patients", href: "/patients" },
        { label: "New Patient" },
      ]}
    >
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">New Patient</h1>
            <p className="text-sm text-slate-500">Register a new patient record</p>
          </div>
        </div>

        {actionData && "error" in actionData && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-5">
          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="First Name"
                name="firstName"
                required
                placeholder="Sarah"
              />
              <ClinicInput
                label="Last Name"
                name="lastName"
                required
                placeholder="Johnson"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
              />
              <Select label="Gender" name="gender">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <ClinicInput
              label="Address"
              name="address"
              placeholder="123 Main Street, City"
            />
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="Phone"
                name="phone"
                type="tel"
                placeholder="+1 555-0000"
              />
              <ClinicInput
                label="Email"
                name="email"
                type="email"
                placeholder="patient@example.com"
              />
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Medical Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Blood Type" name="bloodType">
                <option value="">Unknown</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </Select>
              <ClinicInput
                label="Allergies"
                name="allergies"
                placeholder="Penicillin, Sulfa (comma-separated)"
              />
            </div>
            <Textarea
              label="Medical History"
              name="medicalHistory"
              rows={3}
              placeholder="Relevant medical conditions, previous surgeries, chronic illnesses..."
            />
          </div>

          {/* Emergency contact */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <ClinicInput
                label="Contact Name"
                name="emergencyContactName"
                placeholder="John Doe"
              />
              <ClinicInput
                label="Contact Phone"
                name="emergencyContactPhone"
                type="tel"
                placeholder="+1 555-0001"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/patients"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              <UserPlus size={16} />
              Register Patient
            </button>
          </div>
        </Form>
      </div>
    </AppLayout>
  );
}
