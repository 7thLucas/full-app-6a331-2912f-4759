/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  clinicName?: string;
  clinicTagline?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  appointmentSlotDurationMinutes?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  enablePrescriptions?: boolean;
  dashboardWelcomeMessage?: string;
  footerText?: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Clinic Coordinator",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#0f766e",
    secondary: "#14b8a6",
    accent: "#f0fdfa",
  },
  clinicName: "Clinic Coordinator",
  clinicTagline: "Streamlined care, simplified workflows",
  clinicAddress: "123 Health Street, Medical District",
  clinicPhone: "+1 (555) 000-0000",
  clinicEmail: "admin@clinic.example",
  appointmentSlotDurationMinutes: 30,
  workingHoursStart: "08:00",
  workingHoursEnd: "17:00",
  enablePrescriptions: true,
  dashboardWelcomeMessage: "Good morning! Here's your clinic overview for today.",
  footerText: "© 2026 Clinic Coordinator. All rights reserved.",
};
