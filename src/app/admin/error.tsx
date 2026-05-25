"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05090f] text-[#f5f8ff] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold text-red-400 mb-4 font-syne">Database Connection Error</h1>
      <p className="text-lg text-[rgba(200,215,240,0.8)] mb-6">
        We successfully connected to Convex, but the backend returned an error.
      </p>
      
      <div className="bg-[rgba(13,26,46,0.5)] p-6 rounded-xl border border-red-500/20 text-left text-sm space-y-3 max-w-2xl shadow-xl backdrop-blur-md overflow-auto mb-6">
        <p className="font-bold text-red-300">Error Details:</p>
        <pre className="text-red-200 whitespace-pre-wrap font-mono text-xs p-4 bg-black/50 rounded">
          {error.message || "Unknown error"}
        </pre>
      </div>

      <div className="bg-[#0d1a2e] p-6 rounded-xl border border-[#00d4ff]/20 text-left text-sm space-y-3 max-w-2xl w-full">
        <p className="font-bold text-[#00d4ff]">How to fix this:</p>
        <p className="text-gray-300 mb-2">This usually happens because your Convex functions haven't been pushed to your Production database yet. Vercel only built the frontend.</p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-300 mb-4">
          <li>Open your terminal locally in this project folder.</li>
          <li>Run <code className="bg-gray-900 text-[#00d4ff] px-2 py-1 rounded">npx convex deploy</code></li>
          <li>Once it finishes deploying your functions to production, come back and click the button below.</li>
        </ol>
        <button
          onClick={() => reset()}
          className="w-full bg-[#00d4ff] text-[#05090f] font-bold py-3 rounded hover:bg-[#33ddff] transition-colors"
        >
          I've deployed it, try again!
        </button>
      </div>
    </div>
  );
}
