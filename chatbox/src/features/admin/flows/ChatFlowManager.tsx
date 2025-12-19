import React, { useEffect, useState } from "react";
import http from "../../../api/http";
import FlowBuilder from "./FlowBuilder";
import ChatPreview from "./ChatPreview";

// ✅ type-only imports (fixes TS error)
import type { ChatFlow, ChatStep } from "../components/types";
/* -------------------------------
  Helper
--------------------------------*/
const ensureJsonFields = (flow: ChatFlow): ChatFlow => ({
  ...flow,
  steps: (flow.steps || []).map((s) => ({
    ...s,
    options: Array.isArray(s.options) ? s.options : [],
    validation_rules:
      s.validation_rules && typeof s.validation_rules === "object"
        ? s.validation_rules
        : {},
    next_step_map:
      s.next_step_map && typeof s.next_step_map === "object"
        ? s.next_step_map
        : {},
    api_config:
      s.api_config && typeof s.api_config === "object" ? s.api_config : {},
  })),
});

// API service
const chatFlowAPI = {
  getFlows: () => http.get("/api/chat/flows").then((r) => r.data),
  getFlow: (id: number) =>
    http.get(`/api/chat/flows/${id}`).then((r) => r.data),
  createFlow: (flow: ChatFlow) =>
    http.post("/api/chat/flows", flow).then((r) => r.data),
  updateFlow: (id: number, flow: ChatFlow) =>
    http.put(`/api/chat/flows/${id}`, flow).then((r) => r.data),
  deleteFlow: (id: number) =>
    http.delete(`/api/chat/flows/${id}`).then((r) => r.data),
  toggleFlow: (id: number, active: boolean) =>
    http.patch(`/api/chat/flows/${id}/status`, { is_active: active }),
};

/* -------------------------------
  Main Component
--------------------------------*/
// Confirm Delete Popup Modal
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
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatBuilderAdmin: React.FC = () => {
  const [flows, setFlows] = useState<ChatFlow[]>([]);
  const [currentFlow, setCurrentFlow] = useState<ChatFlow>({
    name: "",
    description: "",
    is_active: false,
    steps: [],
  });
  const [selectedStep, setSelectedStep] = useState<ChatStep | null>(null);
  const [previewStep, setPreviewStep] = useState("");
  const [activeTab, setActiveTab] = useState<"flows" | "builder">("flows");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Popup State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<ChatFlow | null>(null);

  /* ---------------------------- Load flows ---------------------------- */
  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
  setIsLoading(true);
  try {
    const data = await chatFlowAPI.getFlows();
    setFlows(data);

    // DO NOT AUTO-OPEN ANY FLOW
    setActiveTab("flows");

  } catch (err) {
    console.error(err);
    setError("Failed to load flows");
  } finally {
    setIsLoading(false);
  }
};

  /* ---------------------------- Select Flow ---------------------------- */
  const selectFlow = async (flow: ChatFlow) => {
    try {
      if (flow.id) {
        const full = ensureJsonFields(await chatFlowAPI.getFlow(flow.id));
        setCurrentFlow(full);

        const first =
          full.steps.find((s) => s.is_initial) || full.steps[0];
        setPreviewStep(first?.step_key || "");
      } else {
        setCurrentFlow(flow);
      }

      setSelectedStep(null);
      setActiveTab("builder");
    } catch (err) {
      console.error("Failed to select flow", err);
    }
  };

  /* ---------------------------- Flow Updates ---------------------------- */
  const updateFlow = (updates: Partial<ChatFlow>) => {
    setCurrentFlow((prev) => ({ ...prev, ...updates }));
  };

const addStep = (): ChatStep => {
  const newStep: ChatStep = {
    step_key: `step_${Date.now()}`,
    step_type: "message",
    message_text: "",
    options: [],
    validation_rules: {},
    next_step_map: {},
    api_config: {},
    is_initial: false,
    sort_order: currentFlow.steps.length,
  };

  setCurrentFlow((prev) => ({
    ...prev,
    steps: [...prev.steps, newStep],
  }));

  setSelectedStep(newStep);

  return newStep; // 🔥 CRITICAL
};

  const updateStep = (updated: ChatStep) => {
    setCurrentFlow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.step_key === updated.step_key ? updated : s
      ),
    }));
  };

  const deleteStep = (key: string) => {
    setCurrentFlow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.step_key !== key),
    }));

    if (selectedStep?.step_key === key) {
      setSelectedStep(null);
    }
  };

  /* ---------------------------- Save Flow ---------------------------- */
  const saveFlow = async () => {
    setIsLoading(true);
    try {
      if (currentFlow.id) {
        const updated = await chatFlowAPI.updateFlow(
          currentFlow.id,
          currentFlow
        );
        setCurrentFlow(updated);
      } else {
        const created = await chatFlowAPI.createFlow(currentFlow);
        setCurrentFlow(created);
        setFlows((prev) => [...prev, created]);
      }

      alert("Flow saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save flow");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------- Duplicate Flow ---------------------------- */
  const duplicateFlow = async (flow: ChatFlow) => {
    try {
      const full = await chatFlowAPI.getFlow(flow.id!);
      const copy: ChatFlow = {
        ...full,
        id: undefined,
        name: `${full.name} (Copy)`,
        is_active: false,
      };

      const saved = await chatFlowAPI.createFlow(copy);
      setFlows((prev) => [...prev, saved]);
      selectFlow(saved);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------------- Toggle Status ---------------------------- */
  const toggleFlowStatus = async (flow: ChatFlow) => {
    try {
      await chatFlowAPI.toggleFlow(flow.id!, !flow.is_active);

      setFlows((prev) =>
        prev.map((f) =>
          f.id === flow.id ? { ...f, is_active: !f.is_active } : f
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------------- Delete Flow (With Popup) ---------------------------- */
  const askDeleteFlow = (flow: ChatFlow) => {
    setFlowToDelete(flow);
    setShowDeleteModal(true);
  };

  const confirmDeleteFlow = async () => {
    if (!flowToDelete) return;

    try {
      await chatFlowAPI.deleteFlow(flowToDelete.id!);

      setFlows((prev) => prev.filter((f) => f.id !== flowToDelete.id));

      if (currentFlow.id === flowToDelete.id) {
        setCurrentFlow({
          name: "",
          description: "",
          is_active: false,
          steps: [],
        });
        setActiveTab("flows");
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setShowDeleteModal(false);
      setFlowToDelete(null);
    }
  };

  /* ---------------------------- Create Flow ---------------------------- */
const createNewFlow = () => {
  setSelectedStep(null);

  setCurrentFlow({
    name: "New Chat Flow",
    description: "",
    is_active: false,
    steps: [],
  });

  setPreviewStep("");
  setActiveTab("builder");
};


  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Popup */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Flow?"
        message={`Are you sure you want to delete "${flowToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteFlow}
        onCancel={() => setShowDeleteModal(false)}
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Chat Flow Builder</h1>

        {/* Tabs */}
        <div className="border-b mb-4">
          <button
            className={`px-5 py-3 ${
              activeTab === "flows"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("flows")}
          >
            All Flows
          </button>

          <button
            className={`px-5 py-3 ${
              activeTab === "builder"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("builder")}
          >
            Flow Builder
          </button>
        </div>

        {/* Panels */}
        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "flows" ? (
            <FlowsList
              flows={flows}
              isLoading={isLoading}
              onCreateNew={createNewFlow}
              onFlowSelect={selectFlow}
              onDuplicate={duplicateFlow}
              onToggleStatus={toggleFlowStatus}
              onDelete={askDeleteFlow}
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <FlowBuilder
                currentFlow={currentFlow}
                selectedStep={selectedStep}
                onStepSelect={setSelectedStep}
                onStepUpdate={updateStep}
                onStepDelete={deleteStep}
                onAddStep={addStep}
                onFlowUpdate={updateFlow}
                onSave={saveFlow}
                isLoading={isLoading}
                onPreviewStepChange={setPreviewStep}
              />

              <div>
                <h3 className="font-semibold mb-3">Live Preview</h3>
                <ChatPreview
                  flow={currentFlow}
                  currentStepKey={previewStep}
                  onStepChange={setPreviewStep}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------
  Flows List (kept inside Admin)
--------------------------------*/
const FlowsList: React.FC<{
  flows: ChatFlow[];
  isLoading: boolean;
  onCreateNew: () => void;
  onFlowSelect: (flow: ChatFlow) => void;
  onDuplicate: (flow: ChatFlow) => void;
  onToggleStatus: (flow: ChatFlow) => void;
  onDelete: (flow: ChatFlow) => void;
}> = ({
  flows,
  isLoading,
  onCreateNew,
  onFlowSelect,
  onDuplicate,
  onToggleStatus,
  onDelete,
}) => {
  if (isLoading)
    return <p className="text-center py-10">Loading flows...</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">All Chat Flows</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={onCreateNew}
        >
          + New Flow
        </button>
      </div>

      {flows.length === 0 ? (
        <p>No flows yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flows.map((flow) => (
            <div
  key={flow.id}
  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
  onClick={() => onFlowSelect(flow)}
>
  <div className="mb-3">
    <h3 className="font-semibold text-lg">{flow.name}</h3>
    <p className="text-gray-600 text-sm">{flow.description}</p>
  </div>

  <div className="flex items-center justify-between mt-4">
    <span
      className={`px-3 py-1 rounded-full text-sm ${
        flow.is_active
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {flow.is_active ? "Active" : "Inactive"}
    </span>

    <div className="flex gap-3 text-sm">
      <button
        className="text-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          onFlowSelect(flow);
        }}
      >
        Edit
      </button>

      <button
        className="text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(flow);
        }}
      >
        Copy
      </button>

      <button
        className="text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(flow);
        }}
      >
        Delete
      </button>

      <button
        className="text-orange-600"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(flow);
        }}
      >
        {flow.is_active ? "Disable" : "Enable"}
      </button>
    </div>
  </div>
</div>

          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBuilderAdmin;
