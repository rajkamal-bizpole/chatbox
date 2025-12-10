import React, { useEffect, useState } from "react";
import StepEditor from "./StepEditor";
import ReactDOM from "react-dom";

const modalRoot = document.getElementById("modal-root");

// -----------------------------
// Types
// -----------------------------
export interface ChatStep {
  step_key: string;
  step_type: "message" | "options" | "input" | "api_call";
  message_text: string;
  options: string[];
  validation_rules: any;
  next_step_map: { [key: string]: string };
  api_config: any;
  is_initial?: boolean;
  sort_order: number;
}

export interface ChatFlow {
  id?: number;
  name: string;
  description: string;
  is_active: boolean;
  steps: ChatStep[];
  created_at?: string;
  step_count?: number;
}

interface FlowBuilderProps {
  currentFlow: ChatFlow;
  selectedStep: ChatStep | null;
  onStepSelect: (step: ChatStep) => void;
  onStepUpdate: (step: ChatStep) => void;
  onStepDelete: (stepKey: string) => void;

  /** MUST RETURN the newly created step */
  onAddStep: () => ChatStep;

  onFlowUpdate: (updates: Partial<ChatFlow>) => void;
  onSave: () => void;
  isLoading: boolean;
  onPreviewStepChange: (stepKey: string) => void;
}

// -----------------------------
// Component
// -----------------------------
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
  const [showStepEditorModal, setShowStepEditorModal] = useState(false);

  // Select + open popup
  const handleStepSelect = (step: ChatStep) => {
    onStepSelect(step);
    onPreviewStepChange(step.step_key);
    setShowStepEditorModal(true);
  };

  // When user clicks Add Step — create → select → open popup
  const handleAddNewStep = () => {
    const newStep = onAddStep(); // must return the created step
    onStepSelect(newStep);
    onPreviewStepChange(newStep.step_key);
    setShowStepEditorModal(true);
  };

  return (
    <div className="space-y-6">

      {/* ----------------------------- */}
      {/* Flow Settings */}
      {/* ----------------------------- */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Flow Settings</h3>

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flow Name *
            </label>
            <input
              type="text"
              value={currentFlow.name || ""}
              onChange={(e) => onFlowUpdate({ name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter flow name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={currentFlow.description || ""}
              onChange={(e) => onFlowUpdate({ description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Describe this flow"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={currentFlow.is_active || false}
              onChange={(e) => onFlowUpdate({ is_active: e.target.checked })}
              className="rounded text-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Activate this flow
            </label>
          </div>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* Steps List */}
      {/* ----------------------------- */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">
            Steps ({currentFlow.steps?.length || 0})
          </h3>

          <button
            onClick={handleAddNewStep}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
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
                className={`p-3 border rounded-lg cursor-pointer transition ${
                  selectedStep?.step_key === step.step_key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleStepSelect(step)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {step.step_key}
                    </h4>
                    <p className="text-gray-600 text-xs truncate">
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

           {Boolean(step.is_initial) && (
  <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
    Initial Step
  </span>
)}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------- */}
      {/* Step Editor Modal */}
      {/* ----------------------------- */}
      {selectedStep && showStepEditorModal && modalRoot &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">

              {/* Close Button */}
         

              {/* Step Editor */}
           <StepEditor
  step={selectedStep}
  onUpdate={onStepUpdate}
  onDelete={(key) => {
    onStepDelete(key);
    setShowStepEditorModal(false);
  }}
  allSteps={currentFlow.steps}
  onRequestClose={() => setShowStepEditorModal(false)}
/>


              {/* Save + Close */}
              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 mt-4">
              

                <button
                  onClick={() => {
                    onSave();
                    setShowStepEditorModal(false);
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

      {/* ----------------------------- */}
      {/* Save Main Flow Button */}
      {/* ----------------------------- */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Saving..." : "Save Flow"}
        </button>
      </div>
    </div>
  );
};

export default FlowBuilder;
