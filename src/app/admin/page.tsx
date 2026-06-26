"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Monitor, 
  Smartphone, 
  Eye, 
  Calendar, 
  Plus, 
  MessageSquare, 
  KeyRound, 
  Loader2, 
  CheckCircle2, 
  ExternalLink,
  FolderOpen 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ADMIN_URL_ORIGIN = "https://www.vectis.space";

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

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadRow({
  lead,
  stats,
  onDelete,
}: {
  lead: any;
  stats: any;
  onDelete: (id: any) => void;
}) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);

  const slug = lead.slug || lead.uuid;
  const origin = ADMIN_URL_ORIGIN;
  const views = stats?.count || 0;
  const lastOpened = formatTimeAgo(stats?.lastClickAt || null);
  const mobileCount = stats?.mobile || 0;
  const desktopCount = stats?.desktop || 0;

  // Fetch transcripts for this lead
  const transcripts = useQuery(api.conversations.listByLead, { leadId: lead._id });
  const hasTranscripts = transcripts && transcripts.length > 0;
  const transcriptCount = transcripts ? transcripts.length : 0;

  const handleCopyTracking = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${origin}/t/${slug}`);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleCopyDirect = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${origin}/demo/${slug}`);
      setCopiedDirect(true);
      setTimeout(() => setCopiedDirect(false), 2000);
    }
  };

  return (
    <TableRow className="hover:bg-[#F3F2EF]/40 transition-colors border-b border-[#111111]/5">
      <TableCell className="font-semibold text-[#111111] max-w-[200px] truncate pl-6 py-4">
        {lead.businessName || "Voice Demo"}
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-auto px-2 py-0.5 font-bold bg-[#FCFCFB] border-[#111111]/10 text-[#595959]">
              Outreach
            </Badge>
            <a
              href={`${origin}/t/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-[#111111] hover:text-[#A87C43] hover:underline select-all truncate max-w-[180px] sm:max-w-[240px] flex items-center gap-1 cursor-pointer"
            >
              {origin}/t/{slug}
              <ExternalLink className="size-3 text-[#595959]" />
            </a>
            <Button variant="ghost" size="icon" onClick={handleCopyTracking} className="h-6 w-6 cursor-pointer hover:bg-[#F3F2EF] text-[#595959]">
              {copiedTracking ? <span className="text-[10px] text-green-600 font-bold">✓</span> : <Copy className="size-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-auto px-2 py-0.5 font-bold bg-[#FCFCFB] border-[#111111]/10 text-[#595959]">
              Direct
            </Badge>
            <a
              href={`${origin}/demo/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-[#111111] hover:text-[#A87C43] hover:underline select-all truncate max-w-[180px] sm:max-w-[240px] flex items-center gap-1 cursor-pointer"
            >
              {origin}/demo/{slug}
              <ExternalLink className="size-3 text-[#595959]" />
            </a>
            <Button variant="ghost" size="icon" onClick={handleCopyDirect} className="h-6 w-6 cursor-pointer hover:bg-[#F3F2EF] text-[#595959]">
              {copiedDirect ? <span className="text-[10px] text-green-600 font-bold">✓</span> : <Copy className="size-3" />}
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-[#111111] font-semibold">
            <Eye className="size-3.5 text-[#595959]" />
            <strong>{views}</strong> view{views !== 1 ? "s" : ""}
          </span>
          {views > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-[#595959]">
              <span className="flex items-center gap-0.5">
                <Monitor className="size-3" /> {desktopCount}
              </span>
              <span className="text-[#111111]/10">|</span>
              <span className="flex items-center gap-0.5">
                <Smartphone className="size-3" /> {mobileCount}
              </span>
            </div>
          )}
          <span className="text-[10px] text-[#595959]/60">
            Last: {lastOpened}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {transcripts === undefined ? (
          <span className="text-xs text-[#595959]/50 flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-[#111111]/40" />
            Syncing...
          </span>
        ) : hasTranscripts ? (
          <Dialog>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs bg-[#FCFCFB] border-[#111111]/10 hover:border-[#111111] hover:bg-[#F3F2EF] text-[#111111] font-semibold cursor-pointer">
                <MessageSquare className="size-3.5" />
                Transcripts ({transcriptCount})
              </Button>
            } />
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-[#F7F7F5] border border-[#111111]/10 rounded-3xl p-6 shadow-2xl">
              <DialogHeader className="border-b border-[#111111]/5 pb-4">
                <DialogTitle className="font-serif text-2xl text-[#111111]">
                  Transcripts: {lead.businessName || "Voice Demo"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#595959] mt-1">
                  Recorded dialogue logs between visitors and the custom Vetics Voice Agent.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 py-4 my-2 max-h-[60vh] no-scrollbar">
                {transcripts.map((session: any, sIdx: number) => (
                  <div key={session._id} className="border border-[#111111]/5 rounded-2xl overflow-hidden bg-[#FCFCFB] shadow-sm">
                    <div className="bg-[#F3F2EF] px-4 py-2.5 border-b border-[#111111]/5 flex justify-between items-center text-xs text-[#111111] font-bold">
                      <span>Call Session #{transcripts.length - sIdx}</span>
                      <span className="flex items-center gap-1.5 text-[#595959]">
                        <Calendar className="size-3.5" />
                        {formatDate(session.timestamp || session._creationTime)}
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {session.transcript.map((msg: any, mIdx: number) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={mIdx}
                            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                          >
                            <span className="text-[9px] uppercase tracking-wider text-[#595959]/60 font-bold mb-1 px-2">
                              {isUser ? "User / Caller" : "Vetics Assistant"}
                            </span>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                isUser
                                  ? "bg-[#F3F2EF] text-[#111111] rounded-tr-none border border-[#111111]/5"
                                  : "bg-[#111111] text-[#FCFCFB] rounded-tl-none shadow-sm shadow-[#111111]/10"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-xs text-[#595959]/40 italic">No calls completed</span>
        )}
      </TableCell>
      <TableCell className="pr-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(lead._id)}
          className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 hover:text-red-700 h-8 cursor-pointer bg-[#FCFCFB] shadow-sm"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [leadData, setLeadData] = useState("");
  
  const [generatedDemo, setGeneratedDemo] = useState<{
    slug: string;
    businessName: string;
    trackingUrl: string;
    directUrl: string;
  } | null>(null);

  const leads = useQuery(api.leads.list);
  const clickStats = useQuery(api.clicks.getCountsBySlug);
  const createLead = useMutation(api.leads.create);
  const removeLead = useMutation(api.leads.remove);

  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation for password card or page content
  useGSAP(() => {
    if (!isAuthenticated) {
      gsap.from(".login-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.to(".login-orb", {
        x: "random(-30, 30)",
        y: "random(-30, 30)",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4
      });
    } else {
      gsap.from(".admin-content", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  }, [isAuthenticated]);

  // Compute metric sums
  const metrics = useMemo(() => {
    if (!leads) return { totalLeads: 0, totalViews: 0, mobile: 0, desktop: 0 };
    
    let totalViews = 0;
    let mobile = 0;
    let desktop = 0;

    leads.forEach((lead) => {
      const slug = lead.slug || lead.uuid;
      const stats = clickStats?.[slug];
      if (stats) {
        totalViews += stats.count || 0;
        mobile += stats.mobile || 0;
        desktop += stats.desktop || 0;
      }
    });

    return {
      totalLeads: leads.length,
      totalViews,
      mobile,
      desktop
    };
  }, [leads, clickStats]);

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
    
    // Generate secure random UUID
    const uuid = crypto.randomUUID();

    // Derive a URL-safe slug
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
    
    // Store generated demo details for visual success panel
    setGeneratedDemo({
      slug,
      businessName,
      trackingUrl: `${ADMIN_URL_ORIGIN}/t/${slug}`,
      directUrl: `${ADMIN_URL_ORIGIN}/demo/${slug}`
    });
    
    setLeadData("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-grid-overlay bg-[#F7F7F5] text-[#111111] font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        {/* Ambient Gradient Orbs in Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="login-orb absolute top-[25%] left-[30%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#A87C43]/15 to-amber-300/10 blur-[80px]" />
          <div className="login-orb absolute bottom-[25%] right-[30%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-indigo-500/15 to-purple-400/10 blur-[80px]" />
        </div>

        <Card className="login-card max-w-sm w-full border border-[#111111]/8 shadow-2xl relative z-10 bg-[#FCFCFB]/60 backdrop-blur-2xl rounded-[2rem] p-4">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F3F2EF] flex items-center justify-center mb-4 border border-[#111111]/5">
              <KeyRound className="size-5 text-[#111111]" />
            </div>
            <CardTitle className="font-serif text-3xl text-[#111111]">Vetics.space</CardTitle>
            <CardDescription className="text-xs text-[#595959] mt-1.5 font-light">
              Enter credentials to access the Client Demo Control Center.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-6 pb-4">
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder="System Access Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCFCFB] border-[#111111]/15 focus-visible:border-[#111111] focus-visible:ring-1 focus-visible:ring-[#111111] h-11 px-4 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="pb-8 pt-2 px-6">
              <Button type="submit" className="w-full bg-[#111111] text-[#FCFCFB] hover:bg-[#111111]/90 hover:-translate-y-0.5 transition-all h-11 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer shadow-md shadow-[#111111]/10">
                Enter Control Panel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid-overlay bg-[#F7F7F5] text-[#111111] font-sans pb-20 admin-content select-none">
      {/* Header Nav */}
      <div className="border-b border-[#111111]/5 bg-[#FCFCFB]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[#595959] hover:text-[#111111] transition-colors text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="size-4" />
            <span>Back to Site</span>
          </a>
          <div className="font-serif text-lg text-[#111111] flex items-center gap-2">
            Vetics<span className="text-[10px] font-sans font-bold tracking-widest uppercase bg-[#111111] text-[#F7F7F5] px-1.5 py-0.5 rounded">.space</span>
            <Badge variant="outline" className="text-[8px] uppercase tracking-widest h-auto border-[#111111]/10 text-[#111111] font-bold px-2 py-0.5 bg-[#F3F2EF]">
              Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Page title header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#111111] mb-2 leading-none">Demo Control Center</h1>
            <p className="text-xs text-[#595959] font-light mt-1.5">
              Provision customized AI voice outreach demos for clients and audit call log transcripts.
            </p>
          </div>
        </div>

        {/* Metrics Grid dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border border-[#111111]/5 bg-[#FCFCFB] shadow-sm rounded-3xl p-6">
            <div className="text-[10px] text-[#595959] uppercase tracking-wider font-bold mb-1.5">Total Client Demos</div>
            <div className="font-serif text-4xl text-[#111111] font-bold leading-none">{metrics.totalLeads}</div>
            <p className="text-[9px] text-[#595959]/60 font-medium uppercase tracking-wider mt-3">Environments created</p>
          </Card>
          
          <Card className="border border-[#111111]/5 bg-[#FCFCFB] shadow-sm rounded-3xl p-6">
            <div className="text-[10px] text-[#595959] uppercase tracking-wider font-bold mb-1.5">Total Opens / Views</div>
            <div className="font-serif text-4xl text-[#111111] font-bold leading-none">{metrics.totalViews}</div>
            <p className="text-[9px] text-[#595959]/60 font-medium uppercase tracking-wider mt-3">Link clicks tracked</p>
          </Card>

          <Card className="border border-[#111111]/5 bg-[#FCFCFB] shadow-sm rounded-3xl p-6">
            <div className="text-[10px] text-[#595959] uppercase tracking-wider font-bold mb-1.5">Device Splits</div>
            <div className="font-serif text-2xl text-[#111111] font-bold flex items-center gap-3.5 mt-1 leading-none">
              <span className="flex items-center gap-1.5 text-base font-sans font-bold"><Monitor className="size-4 text-[#595959]" /> {metrics.desktop}</span>
              <span className="text-[#111111]/10">|</span>
              <span className="flex items-center gap-1.5 text-base font-sans font-bold"><Smartphone className="size-4 text-[#595959]" /> {metrics.mobile}</span>
            </div>
            <p className="text-[9px] text-[#595959]/60 font-medium uppercase tracking-wider mt-4">Engagement channels</p>
          </Card>
        </div>

        {/* Tabs Control */}
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="bg-[#F3F2EF] border border-[#111111]/5 p-1 rounded-xl">
            <TabsTrigger value="directory" className="font-bold text-xs px-4 py-2 cursor-pointer data-[state=active]:bg-[#FCFCFB] data-[state=active]:text-[#111111] data-[state=active]:shadow-sm rounded-lg text-[#595959]">
              Leads Directory
            </TabsTrigger>
            <TabsTrigger value="create" className="font-bold text-xs px-4 py-2 cursor-pointer data-[state=active]:bg-[#FCFCFB] data-[state=active]:text-[#111111] data-[state=active]:shadow-sm rounded-lg text-[#595959]">
              Generate New Demo
            </TabsTrigger>
          </TabsList>

          {/* Directory Content */}
          <TabsContent value="directory">
            <Card className="border border-[#111111]/5 bg-[#FCFCFB] shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="px-6 pt-6 pb-4 border-b border-[#111111]/5">
                <CardTitle className="font-serif text-2xl text-[#111111]">Active Demo Lines</CardTitle>
                <CardDescription className="text-xs text-[#595959] mt-1 font-light">
                  Select a lead row to view tracked click counts or audit recorded conversation transcripts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {!leads ? (
                  <div className="py-16 text-center text-[#595959]/50 flex flex-col items-center gap-3">
                    <Loader2 className="size-6 animate-spin text-[#111111]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Synchronizing database...</span>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="py-20 text-center text-[#595959]/50">
                    <FolderOpen className="size-10 mx-auto text-[#595959]/30 mb-4" />
                    <p className="font-semibold text-sm text-[#111111]">No active client lines found.</p>
                    <p className="text-xs text-[#595959] mt-1.5">Switch to the "Generate New Demo" tab to build your first client line.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F3F2EF] border-b border-[#111111]/5 hover:bg-[#F3F2EF]">
                          <TableHead className="font-bold text-[#111111] text-xs uppercase tracking-wider w-[200px] pl-6 py-3">Client / Business</TableHead>
                          <TableHead className="font-bold text-[#111111] text-xs uppercase tracking-wider py-3">Outreach Link Directories</TableHead>
                          <TableHead className="font-bold text-[#111111] text-xs uppercase tracking-wider py-3">Engagement Analytics</TableHead>
                          <TableHead className="font-bold text-[#111111] text-xs uppercase tracking-wider py-3">Call Transcripts</TableHead>
                          <TableHead className="font-bold text-[#111111] text-xs uppercase tracking-wider pr-6 py-3">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <LeadRow
                            key={lead._id}
                            lead={lead}
                            stats={clickStats?.[lead.slug || lead.uuid]}
                            onDelete={removeLead}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Lead Content */}
          <TabsContent value="create" className="space-y-6">
            {generatedDemo && (
              <Card className="border border-green-200 bg-green-50/20 shadow-sm rounded-3xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-4 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-green-900 text-sm">Demo Line Provisioned Successfully!</h3>
                        <p className="text-xs text-green-800/80 mt-1 font-light">
                          Custom sandbox generated for **{generatedDemo.businessName}**. Share links with the prospect to trigger outreach.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="p-4 bg-[#FCFCFB] border border-green-200/50 rounded-2xl space-y-1.5 shadow-sm">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-green-850">Outreach Tracking URL</span>
                          <div className="flex items-center justify-between gap-2.5">
                            <a 
                              href={generatedDemo.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-mono text-xs text-[#111111] hover:text-[#A87C43] hover:underline select-all truncate flex items-center gap-1 cursor-pointer"
                            >
                              {generatedDemo.trackingUrl}
                              <ExternalLink className="size-3 text-[#595959]" />
                            </a>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2.5 hover:bg-green-100/40 text-green-800 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedDemo.trackingUrl);
                                alert("Outreach tracking link copied!");
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FCFCFB] border border-green-200/50 rounded-2xl space-y-1.5 shadow-sm">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-green-850">Direct Demo URL</span>
                          <div className="flex items-center justify-between gap-2.5">
                            <a 
                              href={generatedDemo.directUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-mono text-xs text-[#111111] hover:text-[#A87C43] hover:underline select-all truncate flex items-center gap-1 cursor-pointer"
                            >
                              {generatedDemo.directUrl}
                              <ExternalLink className="size-3 text-[#595959]" />
                            </a>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2.5 hover:bg-green-100/40 text-green-800 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedDemo.directUrl);
                                alert("Direct demo link copied!");
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setGeneratedDemo(null)}
                          className="text-[10px] text-green-800 hover:bg-green-100/45 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Dismiss Success Panel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-[#111111]/5 bg-[#FCFCFB] shadow-sm rounded-3xl max-w-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 border-b border-[#111111]/5">
                <CardTitle className="font-serif text-2xl text-[#111111]">Provision Client Sandbox</CardTitle>
                <CardDescription className="text-xs text-[#595959] mt-1.5 font-light">
                  Input business operational data to construct the custom agent context. The business name will be parsed from the first text line.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreate}>
                <CardContent className="space-y-6 p-6 md:p-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">Lead Raw Data & Context Details</label>
                    <Textarea
                      value={leadData}
                      onChange={(e) => setLeadData(e.target.value)}
                      className="min-h-[200px] border-[#111111]/15 focus-visible:border-[#111111] focus-visible:ring-1 focus-visible:ring-[#111111] bg-[#F7F7F5]/50 rounded-2xl text-xs font-medium leading-relaxed p-4"
                      placeholder="Voyage Eyewear&#10;Contact: Vikram Rathore&#10;Industry: D2C Eyewear&#10;Problem: Outbound abandoned checkout followups are too slow, and SMS gets ignored.&#10;Core offer: Automate calls within 15 minutes of cart abandonment."
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-[#111111]/5 bg-[#F3F2EF]/40 px-6 py-4 flex justify-end">
                  <Button type="submit" className="bg-[#111111] text-[#FCFCFB] hover:bg-[#111111]/95 text-xs font-bold uppercase tracking-wider h-11 px-6 rounded-xl cursor-pointer shadow-md shadow-[#111111]/10">
                    <Plus className="size-4 mr-2" />
                    Generate Demo Line
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
