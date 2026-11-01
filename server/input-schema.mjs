export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["production", "durations", "deadline", "extra_from", "extra_to"],
  properties: {
    production: { type: "string", enum: ["short", "launch", "exhibition"] },
    durations: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: { type: "integer", minimum: 1, maximum: 12 },
    },
    deadline: { type: "integer", minimum: 8, maximum: 80 },
    extra_from: { type: "integer", minimum: -1, maximum: 7 },
    extra_to: { type: "integer", minimum: -1, maximum: 7 },
  },
};
