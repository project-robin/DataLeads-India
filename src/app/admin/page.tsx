"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatTimeAgo(timestamp: number | null) {
  if (!timestamp) return "Never";
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [leadData, setLeadData] = useState("");

  const leads = useQuery(api.leads.list);
  const clickStats = useQuery(api.clicks.getCountsBySlug);
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

    // Derive a URL-safe slug from the first non-empty line of lead data
    const firstLine = leadData.trim().split("\n")[0] || "lead";
    const cleanName = firstLine
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 40);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanName}-${randomSuffix}`;
    const businessName = firstLine.trim();
    
    await createLead({ uuid, leadData, slug, businessName });
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
                  {leads.map((lead) => {
                    const slug = lead.slug || lead.uuid;
                    const stats = clickStats?.[slug];
                    const views = stats?.count || 0;
                    const lastOpened = formatTimeAgo(stats?.lastClickAt || null);
                    const mobileCount = stats?.mobile || 0;
                    const desktopCount = stats?.desktop || 0;

                    return (
                      <div key={lead._id} className="bg-[#05090f] p-5 rounded-lg border border-gray-800 flex flex-col md:flex-row justify-between items-start gap-4 hover:border-[#00d4ff]/20 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-syne font-bold text-white mb-2">{lead.businessName || "Voice Demo"}</h3>
                          <div className="flex flex-col gap-1.5 mb-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#00d4ff] font-semibold uppercase tracking-wider text-[9px] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded">Outreach Link</span>
                              <span className="font-mono text-gray-300 break-all select-all">
                                {typeof window !== "undefined" ? window.location.origin : ""}/t/{slug}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] bg-gray-800 px-1.5 py-0.5 rounded">Direct Link</span>
                              <span className="font-mono text-gray-500 break-all select-all">
                                {typeof window !== "undefined" ? window.location.origin : ""}/demo/{slug}
                              </span>
                            </div>
                          </div>
                          
                          {/* Stats Bar */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3 bg-[#0d1a2e]/40 px-3 py-1.5 rounded border border-[#00d4ff]/5">
                            <span className="flex items-center gap-1">
                              👁 <strong>{views}</strong> view{views !== 1 ? "s" : ""}
                            </span>
                            <span className="text-gray-700">|</span>
                            <span className="flex items-center gap-1">
                              🕐 Last opened: <strong>{lastOpened}</strong>
                            </span>
                            {views > 0 && (
                              <>
                                <span className="text-gray-700">|</span>
                                <span className="flex items-center gap-1">
                                  📱 {mobileCount} mobile / 💻 {desktopCount} desktop
                                </span>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-gray-400 line-clamp-2 bg-[#0d1a2e]/20 p-2.5 rounded border border-gray-900/60 font-mono">
                            {lead.leadData}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                          <button
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                navigator.clipboard.writeText(`${window.location.origin}/t/${slug}`);
                                alert("Outreach link copied to clipboard!");
                              }
                            }}
                            className="flex-1 md:flex-initial px-3 py-1.5 bg-[#00d4ff] text-[#05090f] font-bold text-xs rounded hover:bg-[#33ddff] transition-colors"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => removeLead({ id: lead._id })}
                            className="flex-1 md:flex-initial px-3 py-1.5 bg-red-900/20 text-red-400 text-xs rounded border border-red-900/30 hover:bg-red-900/40 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
