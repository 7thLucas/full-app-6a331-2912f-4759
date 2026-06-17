import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { useActionData, Form, Link } from "react-router";
import { Activity, ArrowLeft } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await AuthService.forgotPassword(String(formData.get("email") ?? ""));
  } catch {}
  return {
    success: true,
    message: "If that email exists, a reset link has been sent. Check your inbox.",
  };
}

export default function ForgotPasswordRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg mb-4">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinic Coordinator</h1>
          <p className="text-sm text-slate-500 mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 mb-5 font-medium"
          >
            <ArrowLeft size={15} /> Back to login
          </Link>

          <h2 className="text-lg font-bold text-slate-900 mb-2">Forgot password?</h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter your email address and we'll send you a reset link.
          </p>

          {actionData?.success && (
            <div className="mb-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700">
              {actionData.message}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@clinic.example"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              Send reset link
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
