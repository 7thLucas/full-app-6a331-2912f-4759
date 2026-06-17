/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "clinicName",
      type: "string",
      required: false,
      label: "Clinic Name",
    },
    {
      fieldName: "clinicTagline",
      type: "string",
      required: false,
      label: "Clinic Tagline",
    },
    {
      fieldName: "clinicAddress",
      type: "string",
      required: false,
      label: "Clinic Address",
    },
    {
      fieldName: "clinicPhone",
      type: "string",
      required: false,
      label: "Clinic Phone",
    },
    {
      fieldName: "clinicEmail",
      type: "string",
      required: false,
      label: "Clinic Email",
    },
    {
      fieldName: "appointmentSlotDurationMinutes",
      type: "number",
      required: false,
      label: "Appointment Slot Duration (minutes)",
      min: 10,
      max: 120,
    },
    {
      fieldName: "workingHoursStart",
      type: "string",
      required: false,
      label: "Working Hours Start (e.g. 08:00)",
    },
    {
      fieldName: "workingHoursEnd",
      type: "string",
      required: false,
      label: "Working Hours End (e.g. 17:00)",
    },
    {
      fieldName: "enablePrescriptions",
      type: "boolean",
      required: false,
      label: "Enable Prescription Management",
    },
    {
      fieldName: "dashboardWelcomeMessage",
      type: "string",
      required: false,
      label: "Dashboard Welcome Message",
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
    },
  ],
};
