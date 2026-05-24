"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [leadData, setLeadData] = useState("");

  const leads = useQuery(api.leads.list);
  const createLead = useMutation(api.leads.create);
  const removeLead = useMutation(api.leads.remove);

  // Super simple admin auth for the MVP
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.trim()) return;
    
    // Generate a secure random UUID for the link
    const uuid = crypto.randomUUID();
    
    await createLead({ uuid, leadData });
    setLeadData("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05090f] text-white flex flex-col items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-[#0d1a2e] p-8 rounded-xl border border-[#00d4ff]/20 max-w-sm w-full">
          <h1 className="font-bebas-neue text-3xl mb-6 text-center">Admin Panel</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#05090f] border border-[#00d4ff]/30 rounded p-3 mb-4 focus:outline-none focus:border-[#00d4ff]"
          />
          <button type="submit" className="w-full bg-[#00d4ff] text-[#05090f] font-bold py-3 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05090f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-bebas-neue text-4xl mb-8">Demo Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="bg-[#0d1a2e] p-6 rounded-xl border border-[#00d4ff]/20">
              <h2 className="text-xl font-bold mb-4 font-syne">Create New Demo</h2>
              <form onSubmit={handleCreate}>
                <label className="block text-sm text-gray-400 mb-2">Paste Lead Information:</label>
                <textarea
                  value={leadData}
                  onChange={(e) => setLeadData(e.target.value)}
                  className="w-full h-48 bg-[#05090f] border border-[#00d4ff]/30 rounded p-3 mb-4 focus:outline-none focus:border-[#00d4ff]"
                  placeholder="Company Name, Contact Person, Industry, Pain Points..."
                  required
                />
                <button type="submit" className="w-full bg-[#00d4ff] text-[#05090f] font-bold py-3 rounded hover:bg-[#33ddff] transition-colors">
                  Generate Demo Link
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="bg-[#0d1a2e] p-6 rounded-xl border border-[#00d4ff]/20 h-full">
              <h2 className="text-xl font-bold mb-4 font-syne">Active Demos</h2>
              
              {!leads ? (
                <div className="text-gray-400">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="text-gray-400">No active demos found.</div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead._id} className="bg-[#05090f] p-4 rounded border border-gray-800 flex justify-between items-start gap-4">
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm text-[#00d4ff] mb-2 font-mono break-all">
                          {typeof window !== "undefined" ? window.location.origin : ""}/demo/{lead.uuid}
                        </div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {lead.leadData}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              navigator.clipboard.writeText(`${window.location.origin}/demo/${lead.uuid}`);
                              alert("Copied to clipboard!");
                            }
                          }}
                          className="px-3 py-1 bg-gray-800 text-sm rounded hover:bg-gray-700"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => removeLead({ id: lead._id })}
                          className="px-3 py-1 bg-red-900/30 text-red-400 text-sm rounded hover:bg-red-900/60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
