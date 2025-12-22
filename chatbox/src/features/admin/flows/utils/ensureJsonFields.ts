import type { ChatFlow, ChatStep } from "../types/chatFlow.types";

/**
 * Normalizes backend flow data
 * Ensures all JSON fields exist and are valid objects/arrays
 * Prevents runtime crashes in builder & preview
 */
export const ensureJsonFields = (flow: ChatFlow): ChatFlow => {
  return {
    ...flow,
    steps: (flow.steps || []).map((step): ChatStep => ({
      ...step,

      options: Array.isArray(step.options) ? step.options : [],

      validation_rules:
        step.validation_rules && typeof step.validation_rules === "object"
          ? step.validation_rules
          : {},

      next_step_map:
        step.next_step_map && typeof step.next_step_map === "object"
          ? step.next_step_map
          : {},

      api_config:
        step.api_config && typeof step.api_config === "object"
          ? step.api_config
          : {},
    })),
  };
};
