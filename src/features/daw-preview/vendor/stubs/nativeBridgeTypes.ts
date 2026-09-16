// Source: the `BuiltInParamDescriptor` interface from OpenStudio
// frontend/src/services/NativeBridge.ts @ d2056151222fefcede123ef614ec38c6893cbfd5.
// Only the type is needed here; the native bridge itself never runs on the website.
export interface BuiltInParamDescriptor {
  id: string;
  label: string;
  type: "continuous" | "enum" | "toggle" | "meter" | "curve" | string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  unit?: string;
  automatable?: boolean;
  graphRole?: string;
  enumOptions?: Array<{ value: number; label: string }>;
}
