import React, { useState } from "react";
import ReactDOM from "react-dom";
import StepEditor from "./StepEditor";
import type { ChatFlow, ChatStep } from "../../types/chatFlow.types";

const modalRoot = document.getElementById("modal-root");

interface FlowBuilderProps {
  currentFlow: ChatFlow;
  selectedStep: ChatStep | null;

  onStepSelect: (step: ChatStep) => void;
  onStepUpdate: (step: ChatStep) => void;
  onStepDelete: (stepKey: string) => void;

  /** MUST return the newly created step */
  onAddStep: () => ChatStep;

  onFlowUpdate: (updates: Partial<ChatFlow>) => void;
  onSave: () => void;
  isLoading: boolean;

  onPreviewStepChange: (stepKey: string) => void;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  currentFlow,
  selectedStep,
  onStepSelect,
  onStepUpdate,
  onStepDelete,
  onAddStep,
  onFlowUpdate,
  onSave,
  isLoading,
  onPreviewStepChange,
}) => {
  const [showStepEditor, setShowStepEditor] = useState(false);

  /* ---------------- Step selection ---------------- */
  const handleSelectStep = (step: ChatStep) => {
    onStepSelect(step);
    onPreviewStepChange(step.step_key);
    setShowStepEditor(true);
  };

  /* ---------------- Add step ---------------- */
  const handleAddStep = () => {
    const newStep = onAddStep();
    onStepSelect(newStep);
    onPreviewStepChange(newStep.step_key);
    setShowStepEditor(true);
  };

  return (
    <div className="space-y-6">

      {/* ================= Flow Settings ================= */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Flow Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Flow Name *
            </label>
            <input
              value={currentFlow.name}
              onChange={(e) => onFlowUpdate({ name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter flow name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={currentFlow.description}
              onChange={(e) => onFlowUpdate({ description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Describe this flow"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentFlow.is_active}
              onChange={(e) =>
                onFlowUpdate({ is_active: e.target.checked })
              }
            />
            <span className="text-sm">Activate this flow</span>
          </div>
        </div>
      </div>

      {/* ================= Steps List ================= */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">
            Steps ({currentFlow.steps.length})
          </h3>

          <button
            onClick={handleAddStep}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Add Step
          </button>
        </div>

        {currentFlow.steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No steps yet. Add one to begin.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentFlow.steps.map((step) => (
              <div
                key={step.step_key}
                onClick={() => handleSelectStep(step)}
                className={`p-3 border rounded-lg cursor-pointer transition ${
                  selectedStep?.step_key === step.step_key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {step.step_key}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {step.message_text}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      step.step_type === "message"
                        ? "bg-purple-100 text-purple-800"
                        : step.step_type === "options"
                        ? "bg-green-100 text-green-800"
                        : step.step_type === "input"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {step.step_type}
                  </span>
                </div>

                {step.is_initial && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Initial Step
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= Step Editor Modal ================= */}
      {selectedStep && showStepEditor && modalRoot &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

              <StepEditor
                step={selectedStep}
                allSteps={currentFlow.steps}
                onUpdate={onStepUpdate}
                onDelete={(key) => {
                  onStepDelete(key);
                  setShowStepEditor(false);
                }}
                onRequestClose={() => setShowStepEditor(false)}
              />

              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    onSave();
                    setShowStepEditor(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save Flow
                </button>
              </div>

            </div>
          </div>,
          modalRoot
        )
      }

      {/* ================= Save Button ================= */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
        >
          {isLoading ? "Saving..." : "Save Flow"}
        </button>
      </div>
    </div>
  );
};

export default FlowBuilder;
