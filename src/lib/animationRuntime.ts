let runtime: Promise<{ gsap: typeof import("gsap").gsap }> | undefined;

/** Illustration timelines need GSAP core; no scroll plugin is loaded. */
export function loadGsap() {
  runtime ??= import("gsap").then(({ gsap }) => ({ gsap })).catch((error: unknown) => {
    runtime = undefined;
    throw error;
  });
  return runtime;
}
