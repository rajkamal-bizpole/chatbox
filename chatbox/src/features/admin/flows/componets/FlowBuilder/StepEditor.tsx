import React, { useEffect, useState } from "react";
import type { ChatStep } from "../../types/chatFlow.types";
import ConfirmModal from "../ConfirmModal";

interface StepEditorProps {
  step: ChatStep;
  allSteps: ChatStep[];
  onUpdate: (updated: ChatStep) => void;
  onDelete: (key: string) => void;
  onRequestClose: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  allSteps,
  onUpdate,
  onDelete,
  onRequestClose,
}) => {
  /* ---------------- Draft State (SENIOR PATTERN) ---------------- */
  const [draft, setDraft] = useState<ChatStep>(step);
  const [initial, setInitial] = useState<ChatStep>(step);

  /* ---------------- Modals ---------------- */
  const [showDeleteStep, setShowDeleteStep] = useState(false);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const [showDeleteMap, setShowDeleteMap] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  const [optionIndex, setOptionIndex] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState<string | null>(null);

  /* ---------------- Sync step → draft ---------------- */
  useEffect(() => {
    const normalized: ChatStep = {
      ...step,
      options: Array.isArray(step.options) ? step.options : [],
      validation_rules: step.validation_rules ?? {},
      next_step_map: step.next_step_map ?? {},
      api_config: step.api_config ?? {},
    };

    setDraft(normalized);
    setInitial(normalized);
  }, [step]);

  /* ---------------- Helpers ---------------- */
const update = (key: keyof ChatStep, value: any) => {
  setDraft((prev) => {
    const updated = { ...prev, [key]: value };

    // 🔥 AUTO-SYNC WITH FLOW (OLD BEHAVIOR RESTORED)
    onUpdate(updated);

    return updated;
  });
};


  const updateValidation = (key: string, value: any) => {
    update("validation_rules", {
      ...draft.validation_rules,
      [key]: value,
    });
  };

  const updateApi = (key: string, value: any) => {
    update("api_config", {
      ...draft.api_config,
      [key]: value,
    });
  };

  const updateNextMap = (key: string, value: string) => {
    update("next_step_map", {
      ...draft.next_step_map,
      [key]: value,
    });
  };

  const hasChanges =
    JSON.stringify(draft) !== JSON.stringify(initial);

  const requestClose = () => {
    if (hasChanges) {
      setShowUnsavedConfirm(true);
    } else {
      onRequestClose();
    }
  };

  const saveStep = () => {
    onUpdate(draft);
    onRequestClose();
  };

  const discardChanges = () => {
    setDraft(initial);
    onUpdate(initial);
    onRequestClose();
  };

  /* ---------------- Option helpers ---------------- */
  const updateOption = (i: number, value: string) => {
    const copy = [...draft.options];
    copy[i] = value;
    update("options", copy);
  };

  const deleteOption = () => {
    if (optionIndex === null) return;
    update(
      "options",
      draft.options.filter((_, i) => i !== optionIndex)
    );
    setShowDeleteOption(false);
    setOptionIndex(null);
  };

  const addOption = () => {
    update("options", [...draft.options, ""]);
  };

  /* ---------------- Next Map helpers ---------------- */
  const deleteMap = () => {
    if (!mapKey) return;
    const clone = { ...draft.next_step_map };
    delete clone[mapKey];
    update("next_step_map", clone);
    setShowDeleteMap(false);
    setMapKey(null);
  };

  /* ---------------- Filter steps for mapping ---------------- */
  const getAvailableSteps = () => {
    return allSteps.filter((s) => s.step_key !== draft.step_key);
  };

  /* ================================================= */
  /* ======================= UI ====================== */
  /* ================================================= */

  return (
    <>
      {/* DELETE STEP */}
      <ConfirmModal
        show={showDeleteStep}
        title="Delete Step?"
        message={`Delete "${draft.step_key}" permanently?`}
        onConfirm={() => onDelete(draft.step_key)}
        onCancel={() => setShowDeleteStep(false)}
      />

      {/* DELETE OPTION */}
      <ConfirmModal
        show={showDeleteOption}
        title="Delete Option?"
        message="Are you sure you want to delete this option?"
        onConfirm={deleteOption}
        onCancel={() => {
          setShowDeleteOption(false);
          setOptionIndex(null);
        }}
      />

      {/* DELETE MAP */}
      <ConfirmModal
        show={showDeleteMap}
        title="Delete Mapping?"
        message={`Remove mapping for: ${mapKey}`}
        onConfirm={deleteMap}
        onCancel={() => {
          setShowDeleteMap(false);
          setMapKey(null);
        }}
      />

      {/* MAIN CARD */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Step Editor</h2>
            <button
              className="text-red-600 text-sm hover:text-red-800"
              onClick={() => setShowDeleteStep(true)}
            >
              Delete Step
            </button>
          </div>

          <button
            className="text-gray-600 hover:text-black text-xl"
            onClick={requestClose}
          >
            ✕
          </button>
        </div>

        {/* STEP KEY + TYPE */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium block mb-1">Step Key *</label>
            <input
              value={draft.step_key}
              onChange={(e) => update("step_key", e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Type *</label>
            <select
              value={draft.step_type}
              onChange={(e) => update("step_type", e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="message">Message</option>
              <option value="options">Options</option>
              <option value="input">Input</option>
              <option value="api_call">API Call</option>
            </select>
          </div>
        </div>

        {/* MESSAGE */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">Message Text *</label>
          <textarea
            rows={4}
            value={draft.message_text}
            onChange={(e) => update("message_text", e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* OPTIONS */}
        {(draft.step_type === "options" || draft.step_type === "api_call") && (
          <div className="mb-6">
            <label className="text-sm font-medium block mb-1">Options</label>

            <div className="space-y-2 mt-2">
              {draft.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600"
                    onClick={() => {
                      setOptionIndex(i);
                      setShowDeleteOption(true);
                    }}
                  >
                    X
                  </button>
                </div>
              ))}

              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                onClick={addOption}
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* VALIDATION RULES */}
        {draft.step_type === "input" && (
          <div className="mb-6">
            <label className="text-sm font-medium block mb-1">Validation</label>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-xs block mb-1">Pattern (RegEx)</label>
                <input
                  value={draft.validation_rules.pattern || ""}
                  onChange={(e) => updateValidation("pattern", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., ^[A-Za-z]+$"
                />
              </div>

              <div>
                <label className="text-xs block mb-1">Error Message</label>
                <input
                  value={draft.validation_rules.error_message || ""}
                  onChange={(e) => updateValidation("error_message", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Displayed when validation fails"
                />
              </div>
            </div>
          </div>
        )}

        {/* API CONFIG */}
        {draft.step_type === "api_call" && (
          <div className="mb-6">
            <label className="text-sm font-medium block mb-1">API Config</label>

            <div className="space-y-3 mt-2">
              {/* Endpoint */}
              <div>
                <label className="text-xs block mb-1">Endpoint URL</label>
                
                <select
                  className="w-full p-2 border rounded-lg mb-2"
                  value={draft.api_config.endpoint || ""}
                  onChange={(e) => updateApi("endpoint", e.target.value)}
                >
                  <option value="">Select API</option>
                  <option value="/api/chat/validate-email">Validate Email API</option>
                  <option value="/api/chat/validate-phone">Validate Phone API</option>
                  <option value="/api/chat/ticket/create">Create Support Ticket</option>
                  <option value="/api/chat/session/resolve">Auto Resolve Session</option>
                  <option value="/api/department/billing">Billing Dept API</option>
                  <option value="/api/department/technical">Technical Dept API</option>
                  <option value="/api/department/accounts">Accounts Dept API</option>
                  <option value="/api/department/compliance">Compliance Dept API</option>
                </select>

                <input
                  placeholder="Or enter custom endpoint URL"
                  value={draft.api_config.endpoint || ""}
                  onChange={(e) => updateApi("endpoint", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Method */}
              <div>
                <label className="text-xs block mb-1">Method</label>
                <select
                  value={draft.api_config.method || "POST"}
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
              {draft.api_config.endpoint === "/api/chat/ticket/create" && (
                <div className="space-y-3 border p-3 rounded-lg bg-orange-50">
                  <p className="font-medium text-sm">Ticket Settings</p>

                  <input
                    placeholder="Issue Type"
                    value={draft.api_config.issue_type || ""}
                    onChange={(e) => updateApi("issue_type", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />

                  <input
                    placeholder="Sub Issue"
                    value={draft.api_config.sub_issue || ""}
                    onChange={(e) => updateApi("sub_issue", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />

                  <select
                    value={draft.api_config.priority || "medium"}
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

        {/* NEXT STEP MAPPING */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">Next Step Mapping</label>

          <div className="space-y-2 mt-3">
            {(draft.step_type === "options" || draft.step_type === "api_call") &&
              draft.options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="bg-gray-100 px-3 py-2 rounded-lg text-sm min-w-20">
                    {opt || `Option ${i + 1}`}
                  </span>

                  <select
                    className="flex-1 p-2 border rounded-lg"
                    value={draft.next_step_map[opt] || ""}
                    onChange={(e) => updateNextMap(opt, e.target.value)}
                  >
                    <option value="">Select next step</option>
                    {getAvailableSteps().map((s) => (
                      <option key={s.step_key} value={s.step_key}>
                        {s.step_key}
                      </option>
                    ))}
                  </select>

                  {draft.next_step_map[opt] && (
                    <button
                      className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600"
                      onClick={() => {
                        setMapKey(opt);
                        setShowDeleteMap(true);
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

            {["message", "input", "api_call"].includes(draft.step_type) && (
              <div className="flex gap-2 items-center">
                <span className="bg-gray-200 px-3 py-2 rounded-lg text-sm min-w-20">
                  default
                </span>

                <select
                  className="flex-1 p-2 border rounded-lg"
                  value={draft.next_step_map["default"] || ""}
                  onChange={(e) => updateNextMap("default", e.target.value)}
                >
                  <option value="">Select next step</option>
                  {getAvailableSteps().map((s) => (
                    <option key={s.step_key} value={s.step_key}>
                      {s.step_key}
                    </option>
                  ))}
                </select>

                {draft.next_step_map["default"] && (
                  <button
                    className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600"
                    onClick={() => {
                      setMapKey("default");
                      setShowDeleteMap(true);
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INITIAL STEP */}
  {/* INITIAL STEP */}
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={draft.is_initial || false}
    onChange={(e) => {
      const checked = e.target.checked;

      // 🔥 Unset initial from all other steps (FLOW RULE)
      if (checked) {
        allSteps.forEach((s) => {
          if (s.step_key !== draft.step_key && s.is_initial) {
            onUpdate({ ...s, is_initial: false });
          }
        });
      }

      const updated = { ...draft, is_initial: checked };

      setDraft(updated);   // ✅ update editor state
      onUpdate(updated);   // ✅ update parent flow IMMEDIATELY
    }}
  />
  <span className="text-sm font-medium">Set as initial step</span>
</div>

      </div>

      {/* UNSAVED CONFIRM */}
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
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowUnsavedConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={discardChanges}
              >
                Discard
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={saveStep}
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