"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const rawUrl = (process.env.NEXT_PUBLIC_CONVEX_URL || "").trim();
const convexUrl = rawUrl && !rawUrl.startsWith("http") ? `https://${rawUrl}` : rawUrl;

let convex: ConvexReactClient | null = null;
try {
  if (convexUrl) {
    convex = new ConvexReactClient(convexUrl);
  }
} catch (error) {
  console.error("Invalid Convex URL configuration:", error);
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    return (
      <div className="min-h-screen bg-[#05090f] text-[#f5f8ff] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4 font-syne">Configuration Error</h1>
        <p className="text-lg text-[rgba(200,215,240,0.8)] mb-6">
          The <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable is missing on this deployment.
        </p>
        <div className="bg-[rgba(13,26,46,0.5)] p-6 rounded-xl border border-red-500/20 text-left text-sm space-y-3 max-w-lg shadow-xl backdrop-blur-md">
          <p className="font-bold text-white mb-2">How to fix this on Vercel:</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li>Go to your Vercel Project Dashboard.</li>
            <li>Click <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
            <li>Add <code className="text-[#00d4ff] bg-gray-900 px-1 rounded">NEXT_PUBLIC_CONVEX_URL</code> and paste your Convex Cloud URL.</li>
            <li><strong>Crucial:</strong> Go back to Deployments and click <strong>Redeploy</strong> (Environment variables are baked in during the build step!).</li>
          </ol>
        </div>
      </div>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
