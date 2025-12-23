import React, { useEffect, useState } from "react";
import FlowBuilder from "../componets/FlowBuilder/FlowBuilder";
import ChatPreview from "../componets/ChatPreview/ChatPreview";
import ConfirmModal from "../componets/ConfirmModal";
import { chatFlowAPI } from "../api/chatFlow.api";
import { ensureJsonFields } from "../utils/ensureJsonFields";

import type { ChatFlow, ChatStep } from "../types/chatFlow.types";

/* ======================================================
   Admin Page
====================================================== */
const ChatBuilderAdmin: React.FC = () => {
  /* ---------------- State ---------------- */
  const [flows, setFlows] = useState<ChatFlow[]>([]);
  const [currentFlow, setCurrentFlow] = useState<ChatFlow>({
    name: "",
    description: "",
    is_active: false,
    steps: [],
  });

  const [selectedStep, setSelectedStep] = useState<ChatStep | null>(null);
  const [previewStepKey, setPreviewStepKey] = useState("");
  const [activeTab, setActiveTab] = useState<"flows" | "builder">("flows");

  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatFlow | null>(null);

  /* ---------------- Load flows ---------------- */
  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const data = await chatFlowAPI.getFlows();
      setFlows(data);
      setActiveTab("flows");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Select flow ---------------- */
  const openFlow = async (flow: ChatFlow) => {
    if (!flow.id) return;

    const full = ensureJsonFields(await chatFlowAPI.getFlow(flow.id));
    setCurrentFlow(full);

    const initial =
      full.steps.find((s) => s.is_initial) || full.steps[0];

    setPreviewStepKey(initial?.step_key || "");
    setSelectedStep(null);
    setActiveTab("builder");
  };

  /* ---------------- Flow mutations ---------------- */
  const updateFlow = (updates: Partial<ChatFlow>) => {
    setCurrentFlow((prev) => ({ ...prev, ...updates }));
  };
const validateFlow = (flow: ChatFlow) => {
  for (const step of flow.steps) {
    if (!step.message_text || !step.message_text.trim()) {
      throw new Error(
        `Step "${step.step_key}" must have message text`
      );
    }
  }
};

  const addStep = (): ChatStep => {
    const step: ChatStep = {
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
      steps: [...prev.steps, step],
    }));

    setSelectedStep(step);
    return step;
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

  /* ---------------- Save flow ---------------- */
  const saveFlow = async () => {
  try {
    validateFlow(currentFlow);   // 🔥 BLOCK BAD DATA

    setLoading(true);
    if (currentFlow.id) {
      const updated = await chatFlowAPI.updateFlow(
        currentFlow.id,
        currentFlow
      );
      setCurrentFlow(updated);
    } else {
      const created = await chatFlowAPI.createFlow(currentFlow);
      setFlows((p) => [...p, created]);
      setCurrentFlow(created);
    }
    alert("Flow saved successfully");
  } catch (err: any) {
    alert(err.message); // ✅ user-friendly
  } finally {
    setLoading(false);
  }
};


  /* ---------------- Create new flow ---------------- */
  const createNewFlow = () => {
    setCurrentFlow({
      name: "New Chat Flow",
      description: "",
      is_active: false,
      steps: [],
    });
    setSelectedStep(null);
    setPreviewStepKey("");
    setActiveTab("builder");
  };

  /* ---------------- Duplicate ---------------- */
  const duplicateFlow = async (flow: ChatFlow) => {
    if (!flow.id) return;

    const full = await chatFlowAPI.getFlow(flow.id);
    const copy: ChatFlow = {
      ...full,
      id: undefined,
      name: `${full.name} (Copy)`,
      is_active: false,
    };

    const saved = await chatFlowAPI.createFlow(copy);
    setFlows((p) => [...p, saved]);
    openFlow(saved);
  };

  /* ---------------- Toggle status ---------------- */
  const toggleStatus = async (flow: ChatFlow) => {
    if (!flow.id) return;
    await chatFlowAPI.toggleFlow(flow.id, !flow.is_active);

    setFlows((prev) =>
      prev.map((f) =>
        f.id === flow.id ? { ...f, is_active: !f.is_active } : f
      )
    );
  };

  /* ---------------- Delete flow ---------------- */
  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    await chatFlowAPI.deleteFlow(deleteTarget.id);
    setFlows((p) => p.filter((f) => f.id !== deleteTarget.id));

    if (currentFlow.id === deleteTarget.id) {
      setCurrentFlow({
        name: "",
        description: "",
        is_active: false,
        steps: [],
      });
      setActiveTab("flows");
    }

    setDeleteTarget(null);
  };

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Flow?"
        message={`Delete "${deleteTarget?.name}" permanently?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
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

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "flows" ? (
            <FlowsList
              flows={flows}
              loading={loading}
              onCreate={createNewFlow}
              onEdit={openFlow}
              onDuplicate={duplicateFlow}
              onToggle={toggleStatus}
              onDelete={(f) => setDeleteTarget(f)}
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
                isLoading={loading}
                onPreviewStepChange={setPreviewStepKey}
              />

              <div>
                <h3 className="font-semibold mb-3">Live Preview</h3>
                <ChatPreview
                  flow={currentFlow}
                  currentStepKey={previewStepKey}
                  onStepChange={setPreviewStepKey}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   Flows List
====================================================== */
const FlowsList = ({
  flows,
  loading,
  onCreate,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  flows: ChatFlow[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (f: ChatFlow) => void;
  onDuplicate: (f: ChatFlow) => void;
  onToggle: (f: ChatFlow) => void;
  onDelete: (f: ChatFlow) => void;
}) => {
  if (loading) {
    return <p className="text-center py-10">Loading flows…</p>;
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">All Chat Flows</h2>
        <button
          onClick={onCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
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
    onClick={() => onEdit(flow)}   // ✅ CARD CLICK = EDIT
    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
  >
    {/* HEADER */}
    <div className="mb-3">
      <h3 className="font-semibold text-lg">{flow.name}</h3>
      <p className="text-gray-600 text-sm">{flow.description}</p>
    </div>

    {/* FOOTER */}
    <div className="flex items-center justify-between mt-4">
      {/* STATUS */}
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          flow.is_active
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {flow.is_active ? "Active" : "Inactive"}
      </span>

      {/* ACTIONS */}
      <div className="flex gap-3 text-sm">
        {/* EDIT */}
        <button
          className="text-blue-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();   // ⛔ prevent card click
            onEdit(flow);
          }}
        >
          Edit
        </button>

        {/* COPY */}
        <button
          className="text-gray-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(flow);
          }}
        >
          Copy
        </button>

        {/* DELETE */}
        <button
          className="text-red-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(flow);
          }}
        >
          Delete
        </button>

        {/* ENABLE / DISABLE */}
        <button
          className="text-orange-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(flow);
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
