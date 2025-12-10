import React, { useEffect, useState } from "react";
import type { ChatStep } from "./types";

interface StepEditorProps {
  step: ChatStep;
  allSteps: ChatStep[];
  onUpdate: (updated: ChatStep) => void;
  onDelete: (key: string) => void;
  onRequestClose: () => void;
}

/* ------------------------------
   Confirm Modal
--------------------------------*/
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
          <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onCancel}>
            Cancel
          </button>

          <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------
   Step Editor Component
--------------------------------*/
const StepEditor: React.FC<StepEditorProps> = ({
  step,
  allSteps,
  onUpdate,
  onDelete,
  onRequestClose,
}) => {
  const [local, setLocal] = useState<ChatStep>({
    ...step,
    options: Array.isArray(step.options) ? step.options : [],
    validation_rules: typeof step.validation_rules === "object" ? step.validation_rules : {},
    next_step_map:
      typeof step.next_step_map === "object" ? step.next_step_map : {},
    api_config: typeof step.api_config === "object" ? step.api_config : {},
  });

  const [showStepDelete, setShowStepDelete] = useState(false);
  const [showOptionDelete, setShowOptionDelete] = useState(false);
  const [optionIndexToDelete, setOptionIndexToDelete] = useState<number | null>(
    null
  );
  const [showMapDelete, setShowMapDelete] = useState(false);
  const [mapKeyToDelete, setMapKeyToDelete] = useState<string | null>(null);

  // snapshot of step when editor is opened (for discard)
  const [initialStep, setInitialStep] = useState<ChatStep | null>(null);

  // for "Save / Discard / Cancel" popup
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  /* Sync props → state */
  useEffect(() => {
    const normalized: ChatStep = {
      ...step,
      options: Array.isArray(step.options) ? step.options : [],
      validation_rules:
        typeof step.validation_rules === "object" ? step.validation_rules : {},
      next_step_map:
        typeof step.next_step_map === "object" ? step.next_step_map : {},
      api_config:
        typeof step.api_config === "object" ? step.api_config : {},
    };

    setLocal(normalized);
    setInitialStep(normalized); // snapshot used for "Discard"
  }, [step]);

  /* General update */
const updateField = (key: keyof ChatStep, value: any) => {
  setLocal((prev) => {
    const updated = { ...prev, [key]: value };

    // prevent parent update for step_key until save
    if (key !== "step_key") {
      onUpdate(updated);
    }

    return updated;
  });
};


  /* Validation Update */
  const updateValidation = (key: string, value: any) => {
    updateField("validation_rules", {
      ...local.validation_rules,
      [key]: value,
    });
  };

  /* API Config Update */
  const updateApi = (key: string, value: any) => {
    updateField("api_config", {
      ...local.api_config,
      [key]: value,
    });
  };

  /* Option Update */
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

  /* Next Step Map */
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

    const clone = { ...local.next_step_map };
    delete clone[mapKeyToDelete];

    updateField("next_step_map", clone);
    setShowMapDelete(false);
  };

  const hasUnsavedChanges = () => {
    if (!initialStep) return false;
    return JSON.stringify(initialStep) !== JSON.stringify(local);
  };

  const handleCloseClick = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedConfirm(true);
    } else {
      onRequestClose();
    }
  };

  return (
    <>
      {/* Modals */}
      <ConfirmModal
        show={showStepDelete}
        title="Delete Step?"
        message={`Are you sure you want to delete "${local.step_key}"?`}
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
        title="Delete Mapping?"
        message={`Remove mapping for: ${mapKeyToDelete}`}
        onConfirm={confirmMapDelete}
        onCancel={() => setShowMapDelete(false)}
      />

      {/* Main UI WRAPPER - FIXED */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Step Editor</h2>

            <button
              className="text-red-600 text-sm"
              onClick={() => setShowStepDelete(true)}
            >
              Delete Step
            </button>
          </div>

          {/* Close icon (X) */}
          <button
            className="text-gray-600 hover:text-black text-xl leading-none"
            onClick={handleCloseClick}
          >
            ✕
          </button>
        </div>

        {/* BODY (unchanged) */}
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
              <label className="font-medium text-sm">Type *</label>
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

          {/* Message */}
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
          {(local.step_type === "options" || local.step_type === "api_call") && (
            <div>
              <label className="font-medium text-sm">Options</label>

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
              <label className="font-medium text-sm">Validation</label>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-xs">Pattern</label>
                  <input
                    value={local.validation_rules.pattern || ""}
                    onChange={(e) => updateValidation("pattern", e.target.value)}
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
          {local.step_type === "api_call" && (
            <div>
              <label className="font-medium text-sm">API Config</label>

              <div className="space-y-3 mt-2">
                {/* Endpoint */}
                <div>
                  <label className="text-xs">Endpoint URL</label>

                  <select
                    className="w-full p-2 border rounded-lg mb-2"
                    value={
                      [
                        "/api/chat/validate-email",
                        "/api/chat/validate-phone",
                        "/api/chat/ticket/create",
                        "/api/chat/session/resolve",   
                        "/api/department/billing",
                        "/api/department/technical",
                        "/api/department/accounts",
                        "/api/department/compliance",
                      ].includes(local.api_config.endpoint ?? "")
                        ? local.api_config.endpoint
                        : "custom"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "custom") return;
                      updateApi("endpoint", v);
                    }}
                  >
                    <option value="">Select API</option>
                    <option value="/api/chat/validate-email">
                      Validate Email API
                    </option>
                    <option value="/api/chat/validate-phone">
                      Validate Phone API
                    </option>
                    <option value="/api/chat/ticket/create">
                      Create Support Ticket
                    </option>
  <option value="/api/chat/session/resolve">Auto Resolve Session</option>
                    <option value="/api/department/billing">
                      Billing Dept API
                    </option>
                    <option value="/api/department/technical">
                      Technical Dept API
                    </option>
                    <option value="/api/department/accounts">
                      Accounts Dept API
                    </option>
                    <option value="/api/department/compliance">
                      Compliance Dept API
                    </option>

                    <option value="custom">Custom URL</option>
                  </select>

                  <input
                    placeholder="Custom endpoint"
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

                {/* Ticket Settings */}
                {local.api_config.endpoint === "/api/chat/ticket/create" && (
                  <div className="space-y-3 border p-3 rounded-lg bg-orange-50">
                    <p className="font-medium text-sm">Ticket Settings</p>

                    <input
                      placeholder="Issue Type"
                      value={local.api_config.issue_type || ""}
                      onChange={(e) => updateApi("issue_type", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />

                    <input
                      placeholder="Sub Issue"
                      value={local.api_config.sub_issue || ""}
                      onChange={(e) => updateApi("sub_issue", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />

                    <select
                      value={local.api_config.priority || "medium"}
                      onChange={(e) => updateApi("priority", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Step Mapping */}
          <div>
            <label className="font-medium text-sm">Next Step Mapping</label>

            <div className="space-y-2 mt-3">
              {(local.step_type === "options" || local.step_type === "api_call") &&
                local.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="bg-gray-100 px-3 py-2 rounded-lg text-sm min-w-20">
                      {opt || `Option ${i + 1}`}
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
                  <span className="bg-gray-200 px-3 py-2 rounded-lg text-sm min-w-20">
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
            <label className="font-medium text-sm">Set as initial step</label>
          </div>
        </div>
      </div>

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Unsaved Changes
            </h2>
            <p className="text-gray-600 mb-6">
              You have unsaved changes for this step. What would you like to do?
            </p>

            <div className="flex justify-end gap-3">
              {/* Cancel */}
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setShowUnsavedConfirm(false)}
              >
                Cancel
              </button>

              {/* Discard */}
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => {
                  if (initialStep) {
                    setLocal(initialStep);
                    onUpdate(initialStep);
                  }
                  setShowUnsavedConfirm(false);
                  onRequestClose();
                }}
              >
                Discard
              </button>

              {/* Save */}
              <button
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
  onClick={() => {
    onUpdate(local); // <-- now apply new step_key
    setShowUnsavedConfirm(false);
    onRequestClose();
  }}
>
  Save
</button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StepEditor;
