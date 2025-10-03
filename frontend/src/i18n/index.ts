import ru from "./ru.json";

const LOCALES: Record<string, Record<string, unknown>> = {
  ru,
};

export const currentLocale = "ru";

export function t(key: string, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let node: Record<string, unknown> | string | undefined = LOCALES[currentLocale];
  for (const part of parts) {
    if (!node || typeof node === "string") {
      node = undefined;
      break;
    }
    node = node[part] as Record<string, unknown> | string | undefined;
  }
  let value = typeof node === "string" ? node : key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(vars[k]));
    });
  }
  return value;
}

export default t;
