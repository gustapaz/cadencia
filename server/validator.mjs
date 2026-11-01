import { inputSchema } from "./input-schema.mjs";
import { fail } from "./errors.mjs";
import * as R from "runtypes";
function convert(p) {
  if (p.enum) return R.Union(...p.enum.map((x) => R.Literal(x)));
  if (p.type === "object")
    return R.Object(
      Object.fromEntries(
        Object.entries(p.properties).map(([k, s]) => [k, convert(s)]),
      ),
    ).exact();
  if (p.type === "boolean") return R.Boolean;
  let r =
    p.type === "array"
      ? R.Array(convert(p.items))
      : p.type === "string"
        ? R.String
        : R.Number;
  return r.withConstraint((v) => {
    if (p.type === "integer" && !Number.isInteger(v)) return false;
    if ((p.type === "integer" || p.type === "number") && !Number.isFinite(v))
      return false;
    if (
      (p.minimum !== undefined && v < p.minimum) ||
      (p.maximum !== undefined && v > p.maximum)
    )
      return false;
    if (
      (p.minItems !== undefined && v.length < p.minItems) ||
      (p.maxItems !== undefined && v.length > p.maxItems)
    )
      return false;
    if (
      (p.minLength !== undefined && v.length < p.minLength) ||
      (p.maxLength !== undefined && v.length > p.maxLength)
    )
      return false;
    if (p.pattern && !new RegExp(p.pattern).test(v)) return false;
    return !p.uniqueItems || new Set(v).size === v.length;
  });
}
const schema = convert(inputSchema);
export function validateInput(input) {
  try {
    return schema.check(input);
  } catch {
    fail("invalid_input", "Confira tipos, limites e durações da produção.");
  }
}
