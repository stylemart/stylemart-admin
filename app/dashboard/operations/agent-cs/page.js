// ============================================================
// AGENT CUSTOMER SERVICE PAGE
// Manage agent customer service hotlines
// Matches reference: https://admin.shein-bx.cyou/operations/agentCsList
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import Breadcrumb from "@/components/Breadcrumb";

export default function AgentCSPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    proxy_account: "",
    customer_service_name: "",
    customer_service_link: "",
    status: "active",
  });

  async function fetchAgents() {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const res = await fetch("/api/operations/agent-cs");
      // const data = await res.json();
      // setAgents(data.agents || []);
      
      // Mock empty for now
      setAgents([]);
    } catch (error) {
      console.error("Fetch agents error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  function openCreateModal() {
    setEditingAgent(null);
    setFormData({
      proxy_account: "",
      customer_service_name: "",
      customer_service_link: "",
      status: "active",
    });
    setShowModal(true);
  }

  function openEditModal(agent) {
    setEditingAgent(agent);
    setFormData({
      proxy_account: agent.proxy_account || "",
      customer_service_name: agent.customer_service_name || "",
      customer_service_link: agent.customer_service_link || "",
      status: agent.status || "active",
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingAgent ? `/api/operations/agent-cs/${editingAgent.id}` : "/api/operations/agent-cs";
    const method = editingAgent ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchAgents();
      }
    } catch (error) {
      console.error("Save agent error:", error);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this agent customer service?")) return;
    const token = localStorage.getItem("token");

    try {
      await fetch(`/api/operations/agent-cs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAgents();
    } catch (error) {
      console.error("Delete agent error:", error);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Front Page", href: "/dashboard" },
          { label: "Operations Configuration", href: "/dashboard/operations" },
          { label: "Agent Customer Service Hotline" },
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agent Customer Service Hotline</h1>
          <p className="text-gray-500 text-sm mt-1">Manage agent customer service configurations</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} />
          New
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={(e) => { e.preventDefault(); fetchAgents(); }} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by proxy account or name..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>

      {/* Agents Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Proxy Account</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer Service Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer Service Link</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Operate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No data available.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{agent.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{agent.proxy_account}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{agent.customer_service_name}</td>
                    <td className="px-6 py-4 text-sm text-blue-500 hover:text-blue-700">
                      <a href={agent.customer_service_link} target="_blank" rel="noopener noreferrer" className="truncate max-w-xs block">
                        {agent.customer_service_link}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {agent.status || "inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(agent)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingAgent ? "Edit Agent Customer Service" : "New Agent Customer Service"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proxy Account *</label>
                <input
                  type="text"
                  value={formData.proxy_account}
                  onChange={(e) => setFormData({ ...formData, proxy_account: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Service Name *</label>
                <input
                  type="text"
                  value={formData.customer_service_name}
                  onChange={(e) => setFormData({ ...formData, customer_service_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Service Link *</label>
                <input
                  type="url"
                  value={formData.customer_service_link}
                  onChange={(e) => setFormData({ ...formData, customer_service_link: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingAgent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
