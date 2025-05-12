"use client";

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const CONDITION_TYPES = [
  { label: "Spend", value: "spend" },
  { label: "Visits", value: "visits" },
  { label: "Inactive Days", value: "inactiveDays" },
];

// Types
const defaultCondition = () => ({ type: "spend", operator: ">", value: 0 });
const defaultGroup = () => ({ type: "group", logic: "AND", children: [defaultCondition()] });

function ConditionBlock({ condition, onChange, onRemove, dragRef, dropRef }) {
  return (
    <div ref={node => dragRef && dropRef && dragRef(dropRef(node))} className="flex items-center gap-2 bg-gray-50 rounded p-2 mb-2 shadow-sm">
      <select
        value={condition.type}
        onChange={e => onChange({ ...condition, type: e.target.value })}
        className="border rounded px-1 py-0.5"
      >
        {CONDITION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <select
        value={condition.operator}
        onChange={e => onChange({ ...condition, operator: e.target.value })}
        className="border rounded px-1 py-0.5"
      >
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&ge;</option>
        <option value="<=">&le;</option>
        <option value="=">=</option>
      </select>
      <input
        type="number"
        value={condition.value}
        onChange={e => onChange({ ...condition, value: Number(e.target.value) })}
        className="border rounded px-1 py-0.5 w-20"
      />
      <Button variant="ghost" size="sm" onClick={onRemove}>
        ✕
      </Button>
    </div>
  );
}

function GroupBlock({ group, onChange, onRemove, parentLogic }) {
  // Drag-and-drop for group reordering (optional, can be added)
  const handleLogicChange = (e) => {
    onChange({ ...group, logic: e.target.value });
  };
  const handleAddCondition = () => {
    onChange({ ...group, children: [...group.children, defaultCondition()] });
  };
  const handleAddGroup = () => {
    onChange({ ...group, children: [...group.children, defaultGroup()] });
  };
  const handleChildChange = (idx, newChild) => {
    const updated = group.children.map((c, i) => (i === idx ? newChild : c));
    onChange({ ...group, children: updated });
  };
  const handleRemoveChild = (idx) => {
    onChange({ ...group, children: group.children.filter((_, i) => i !== idx) });
  };
  return (
    <div className="border border-indigo-200 rounded p-3 mb-2 bg-indigo-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Group</span>
        <select value={group.logic} onChange={handleLogicChange} className="border rounded px-1 py-0.5">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>✕</Button>
        )}
      </div>
      <div className="ml-4">
        {group.children.map((child, idx) =>
          child.type === "group" ? (
            <GroupBlock
              key={idx}
              group={child}
              onChange={newChild => handleChildChange(idx, newChild)}
              onRemove={() => handleRemoveChild(idx)}
              parentLogic={group.logic}
            />
          ) : (
            <ConditionBlock
              key={idx}
              condition={child}
              onChange={newChild => handleChildChange(idx, newChild)}
              onRemove={() => handleRemoveChild(idx)}
            />
          )
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={handleAddCondition}>+ Condition</Button>
          <Button variant="outline" size="sm" onClick={handleAddGroup}>+ Group</Button>
        </div>
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState("");
  const [segment, setSegment] = useState(defaultGroup());
  const [previewSize, setPreviewSize] = useState<number|null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const types = ["Email", "SMS", "Push", "WhatsApp"];
  const statuses = ["draft", "active", "paused", "completed"];
  const [campaignType, setCampaignType] = useState(types[0]);
  const [campaignStatus, setCampaignStatus] = useState(statuses[0]);

  const handlePreview = async () => {
    setLoadingPreview(true);
    setPreviewSize(null);
    setTimeout(() => {
      setPreviewSize(Math.floor(Math.random() * 1000) + 1); // Mocked audience size
      setLoadingPreview(false);
    }, 800);
  };
  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      // Example mock customers
      const mockCustomers = [
        { id: "1", name: "Mohit" },
        { id: "2", name: "Priya" },
        { id: "3", name: "Amit" }
      ];
      // Generate mock logs (90% SENT, 10% FAILED)
      const mockLogs = mockCustomers.map(cust => {
        const isSent = Math.random() < 0.9;
        return {
          id: `${Date.now()}-${cust.id}`,
          customer: cust,
          customerId: cust.id,
          status: isSent ? "SENT" : "FAILED",
          sentAt: new Date().toISOString(),
          error: isSent ? undefined : "Delivery failed",
          message: `Hi ${cust.name}, here's 10% off on your next order!`
        };
      });
      const newCampaign = {
        id: Date.now().toString(),
        name: campaignName,
        segment,
        createdAt: new Date().toISOString(),
        budget: Math.floor(Math.random() * 10000) + 1000, // random budget
        spent: Math.floor(Math.random() * 1000), // random spent
        impressions: Math.floor(Math.random() * 100000), // random impressions
        clicks: Math.floor(Math.random() * 10000), // random clicks
        conversions: Math.floor(Math.random() * 1000), // random conversions
        type: campaignType,
        status: campaignStatus,
        logs: mockLogs
      };
      // Save to localStorage
      const campaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]');
      localStorage.setItem('mockCampaigns', JSON.stringify([newCampaign, ...campaigns]));
      alert("Campaign saved! (mock)");
      setSaving(false);
      router.push("/dashboard/campaigns");
    }, 800);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block font-medium mb-1">Campaign Name</label>
            <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Enter campaign name" />
          </div>
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block font-medium mb-1">Type</label>
              <select value={campaignType} onChange={e => setCampaignType(e.target.value)} className="border rounded px-2 py-1">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select value={campaignStatus} onChange={e => setCampaignStatus(e.target.value)} className="border rounded px-2 py-1">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Audience Segment Rules</label>
            <GroupBlock group={segment} onChange={setSegment} />
          </div>
          <div className="mb-4 flex items-center gap-4">
            <Button onClick={handlePreview} disabled={loadingPreview}>{loadingPreview ? "Loading..." : "Preview Audience Size"}</Button>
            {previewSize !== null && !loadingPreview && (
              <span className="text-green-600 font-semibold">Audience Size: {previewSize}</span>
            )}
          </div>
          <Button onClick={handleSave} className="w-full mt-4" disabled={saving}>{saving ? "Saving..." : "Save Campaign"}</Button>
        </CardContent>
      </Card>
    </DndProvider>
  );
} 