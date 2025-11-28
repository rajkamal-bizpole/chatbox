import React, { useEffect, useState } from "react";
import type { ChatStep } from "./types";

interface StepEditorProps {
  step: ChatStep;
  allSteps: ChatStep[];
  onUpdate: (updated: ChatStep) => void;
  onDelete: (key: string) => void;
}

// ---------------------
// Reusable Delete Popup
// ---------------------
const ConfirmModal: React.FC<{
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------
// Step Editor Component
// ---------------------

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  allSteps,
  onUpdate,
  onDelete,
}) => {
  const [local, setLocal] = useState<ChatStep>({
    ...step,
    options: Array.isArray(step.options) ? step.options : [],
    validation_rules:
      typeof step.validation_rules === "object" ? step.validation_rules : {},
    next_step_map:
      typeof step.next_step_map === "object" ? step.next_step_map : {},
    api_config: typeof step.api_config === "object" ? step.api_config : {},
  });

  const [showStepDelete, setShowStepDelete] = useState(false);
  const [showOptionDelete, setShowOptionDelete] = useState(false);
  const [optionIndexToDelete, setOptionIndexToDelete] = useState<number | null>(null);
  const [showMapDelete, setShowMapDelete] = useState(false);
  const [mapKeyToDelete, setMapKeyToDelete] = useState<string | null>(null);

  /* Sync UI with parent step */
  useEffect(() => {
    setLocal({
      ...step,
      options: Array.isArray(step.options) ? step.options : [],
      validation_rules:
        typeof step.validation_rules === "object" ? step.validation_rules : {},
      next_step_map:
        typeof step.next_step_map === "object" ? step.next_step_map : {},
      api_config: typeof step.api_config === "object" ? step.api_config : {},
    });
  }, [step]);

  /* Update wrapper */
  const updateField = (key: keyof ChatStep, value: any) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onUpdate(updated);
  };

  /* Validation rules */
  const updateValidation = (key: string, value: any) => {
    updateField("validation_rules", {
      ...local.validation_rules,
      [key]: value,
    });
  };

  /* API config */
  const updateApi = (key: string, value: any) => {
    updateField("api_config", {
      ...local.api_config,
      [key]: value,
    });
  };

  /* Options */
  const updateOption = (i: number, value: string) => {
    const copy = [...local.options];
    copy[i] = value;
    updateField("options", copy);
  };

  const requestOptionDelete = (i: number) => {
    setOptionIndexToDelete(i);
    setShowOptionDelete(true);
  };

  const confirmOptionDelete = () => {
    if (optionIndexToDelete === null) return;
    updateField(
      "options",
      local.options.filter((_, idx) => idx !== optionIndexToDelete)
    );
    setShowOptionDelete(false);
  };

  const addOption = () => updateField("options", [...local.options, ""]);

  /* Next step map */
  const updateNextMap = (key: string, value: string) => {
    updateField("next_step_map", {
      ...local.next_step_map,
      [key]: value,
    });
  };

  const requestMapDelete = (key: string) => {
    setMapKeyToDelete(key);
    setShowMapDelete(true);
  };

  const confirmMapDelete = () => {
    if (!mapKeyToDelete) return;
    const updated = { ...local.next_step_map };
    delete updated[mapKeyToDelete];
    updateField("next_step_map", updated);
    setShowMapDelete(false);
  };

  return (
    <>
      {/* Delete Popups */}
      <ConfirmModal
        show={showStepDelete}
        title="Delete Step?"
        message={`Are you sure you want to delete step "${local.step_key}"?`}
        onConfirm={() => onDelete(local.step_key)}
        onCancel={() => setShowStepDelete(false)}
      />

      <ConfirmModal
        show={showOptionDelete}
        title="Delete Option?"
        message="Are you sure you want to delete this option?"
        onConfirm={confirmOptionDelete}
        onCancel={() => setShowOptionDelete(false)}
      />

      <ConfirmModal
        show={showMapDelete}
        title="Delete Next Step Mapping?"
        message={`Are you sure you want to delete mapping "${mapKeyToDelete}"?`}
        onConfirm={confirmMapDelete}
        onCancel={() => setShowMapDelete(false)}
      />

      {/* Editor UI */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-semibold">Step Editor</h2>

          <button
            className="text-red-600 text-sm"
            onClick={() => setShowStepDelete(true)}
          >
            Delete Step
          </button>
        </div>

        <div className="space-y-6">
          {/* Step Key + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-sm">Step Key *</label>
              <input
                value={local.step_key}
                onChange={(e) => updateField("step_key", e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium text-sm">Type</label>
              <select
                value={local.step_type}
                onChange={(e) => updateField("step_type", e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="message">Message</option>
                <option value="options">Options</option>
                <option value="input">Input</option>
                <option value="api_call">API Call</option>
              </select>
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="font-medium text-sm">Message Text *</label>
            <textarea
              rows={4}
              value={local.message_text}
              onChange={(e) => updateField("message_text", e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Options */}
          {local.step_type === "options" && (
            <div>
              <label className="font-medium text-sm">Options *</label>

              <div className="space-y-2 mt-2">
                {local.options.map((option, i) => (
                  <div className="flex gap-2" key={i}>
                    <input
                      value={option}
                      onChange={(e) => updateOption(i, e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      className="bg-red-500 text-white px-3 rounded-lg"
                      onClick={() => requestOptionDelete(i)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  onClick={addOption}
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {/* Validation */}
          {local.step_type === "input" && (
            <div>
              <label className="font-medium text-sm">Validation Rules</label>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-xs">Pattern</label>
                  <input
                    value={local.validation_rules.pattern || ""}
                    onChange={(e) =>
                      updateValidation("pattern", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs">Error Message</label>
                  <input
                    value={local.validation_rules.error_message || ""}
                    onChange={(e) =>
                      updateValidation("error_message", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* API Config */}
          {/* API Config */}
{local.step_type === "api_call" && (
  <div>
    <label className="font-medium text-sm">API Config</label>

    <div className="space-y-3 mt-2">
      {/* Endpoint Select */}
      <div>
        <label className="text-xs">Endpoint URL</label>

    <select
  className="w-full p-2 border rounded-lg mb-2"
  value={
    [
      "/api/chat/validate-email",
      "/api/chat/validate-phone",
      "/api/chat/ticket/create"        // <-- ADD THIS LINE
    ].includes(local.api_config.endpoint ?? "")
      ? (local.api_config.endpoint ?? "")
      : "custom"
  }
  onChange={(e) => {
    const value = e.target.value;
    if (value === "custom") return;
    updateApi("endpoint", value);
  }}
>
  <option value="">Select API Endpoint</option>
  <option value="/api/chat/validate-email">Validate Email API</option>
  <option value="/api/chat/validate-phone">Validate Phone API</option>
  <option value="/api/chat/ticket/create">Create Support Ticket</option>  {/* <-- ADD */}
  <option value="custom">Custom URL</option>
</select>


        {/* Input for custom URL */}
        <input
          placeholder="Enter custom endpoint URL"
          value={local.api_config.endpoint ?? ""}
          onChange={(e) => updateApi("endpoint", e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Method */}
      <div>
        <label className="text-xs">Method</label>
        <select
          value={local.api_config.method ?? "POST"}
          onChange={(e) => updateApi("method", e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option>POST</option>
          <option>GET</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
    </div>
  </div>
)}

          {/* Next Step Map */}
          <div>
            <label className="font-medium text-sm">Next Step Mapping</label>

            <div className="space-y-2 mt-3">
              {local.step_type === "options" &&
                local.options.map((opt) => (
                  <div key={opt} className="flex gap-2 items-center">
                    <span className="bg-gray-200 px-3 py-2 rounded-lg text-sm min-w-24">
                      {opt}
                    </span>

                    <select
                      className="flex-1 p-2 border rounded-lg"
                      value={local.next_step_map[opt] || ""}
                      onChange={(e) => updateNextMap(opt, e.target.value)}
                    >
                      <option value="">Select next step</option>

                      {allSteps
                        .filter((s) => s.step_key !== local.step_key)
                        .map((s) => (
                          <option key={s.step_key} value={s.step_key}>
                            {s.step_key}
                          </option>
                        ))}
                    </select>

                    <button
                      className="bg-red-500 text-white px-3 rounded-lg"
                      onClick={() => requestMapDelete(opt)}
                    >
                      X
                    </button>
                  </div>
                ))}

              {["message", "input", "api_call"].includes(local.step_type) && (
                <div className="flex gap-2 items-center">
                  <span className="bg-gray-200 px-3 py-2 rounded-lg text-sm min-w-24">
                    default
                  </span>

                  <select
                    className="flex-1 p-2 border rounded-lg"
                    value={local.next_step_map["default"] || ""}
                    onChange={(e) => updateNextMap("default", e.target.value)}
                  >
                    <option value="">Select next step</option>

                    {allSteps
                      .filter((s) => s.step_key !== local.step_key)
                      .map((s) => (
                        <option key={s.step_key} value={s.step_key}>
                          {s.step_key}
                        </option>
                      ))}
                  </select>

                  {local.next_step_map["default"] && (
                    <button
                      className="bg-red-500 text-white px-3 rounded-lg"
                      onClick={() => requestMapDelete("default")}
                    >
                      X
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Initial Step */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.is_initial || false}
              onChange={(e) => updateField("is_initial", e.target.checked)}
            />
            <label className="text-sm font-medium">
              Set as initial (starting) step
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepEditor;
