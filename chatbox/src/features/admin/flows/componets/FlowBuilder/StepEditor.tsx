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
    setDraft((prev) => ({ ...prev, [key]: value }));
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
  };

  /* ---------------- Next Map helpers ---------------- */
  const deleteMap = () => {
    if (!mapKey) return;
    const clone = { ...draft.next_step_map };
    delete clone[mapKey];
    update("next_step_map", clone);
    setShowDeleteMap(false);
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
        message="Are you sure?"
        onConfirm={deleteOption}
        onCancel={() => setShowDeleteOption(false)}
      />

      {/* DELETE MAP */}
      <ConfirmModal
        show={showDeleteMap}
        title="Delete Mapping?"
        message={`Remove mapping for ${mapKey}`}
        onConfirm={deleteMap}
        onCancel={() => setShowDeleteMap(false)}
      />

      {/* MAIN CARD */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-semibold">Step Editor</h2>

          <div className="flex gap-3">
            <button
              className="text-red-600 text-sm"
              onClick={() => setShowDeleteStep(true)}
            >
              Delete Step
            </button>

            <button
              className="text-xl"
              onClick={requestClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* STEP KEY + TYPE */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">Step Key</label>
            <input
              value={draft.step_key}
              onChange={(e) => update("step_key", e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={draft.step_type}
              onChange={(e) =>
                update("step_type", e.target.value)
              }
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
          <label className="text-sm font-medium">Message</label>
          <textarea
            rows={4}
            value={draft.message_text}
            onChange={(e) =>
              update("message_text", e.target.value)
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* OPTIONS (unchanged UI, cleaner logic) */}
        {(draft.step_type === "options" ||
          draft.step_type === "api_call") && (
          <div className="mb-6">
            <label className="text-sm font-medium">Options</label>

            <div className="space-y-2 mt-2">
              {draft.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) =>
                      updateOption(i, e.target.value)
                    }
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    className="bg-red-500 text-white px-3 rounded-lg"
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                onClick={() =>
                  update("options", [...draft.options, ""])
                }
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* INITIAL STEP */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.is_initial || false}
            onChange={(e) =>
              update("is_initial", e.target.checked)
            }
          />
          <span className="text-sm">Set as initial step</span>
        </div>
      </div>

      {/* UNSAVED CONFIRM */}
      {showUnsavedConfirm && (
        <ConfirmModal
          show
          title="Unsaved Changes"
          message="Save changes before closing?"
          onConfirm={saveStep}
          onCancel={() => {
            setDraft(initial);
            onRequestClose();
          }}
        />
      )}
    </>
  );
};

export default StepEditor;
