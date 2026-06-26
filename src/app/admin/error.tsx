"use client";

import { useEffect } from "react";
import { ShieldAlert, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Page Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col items-center justify-center p-6 relative bg-grid-overlay">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <Card className="max-w-2xl w-full border border-red-100 shadow-2xl relative z-10 bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 border border-red-100">
            <ShieldAlert className="size-6 text-red-600" />
          </div>
          <CardTitle className="font-serif text-3xl text-navy">Database Boundary Sync Alert</CardTitle>
          <CardDescription className="text-xs text-charcoal/60 mt-1">
            We connected to Convex, but the database returned a query runtime error.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Debug Stack */}
          <div className="bg-red-50/30 p-4 rounded-xl border border-red-100/50 text-left text-xs space-y-2">
            <div className="font-semibold text-red-800 flex items-center gap-1.5">
              <span>Exception Details:</span>
            </div>
            <pre className="text-red-700 whitespace-pre-wrap font-mono text-[11px] p-3 bg-red-50/50 border border-red-100/30 rounded max-h-[120px] overflow-y-auto">
              {error.message || "Unknown error occurred inside database queries"}
            </pre>
          </div>

          <Separator className="bg-navy/5" />

          {/* Actionable Steps */}
          <div className="space-y-4 text-left text-sm">
            <h3 className="font-serif text-lg text-navy flex items-center gap-2">
              <Terminal className="size-4.5 text-slate" />
              Resolution Steps
            </h3>
            <p className="text-xs text-charcoal/80">
              This usually happens when your local Convex schema or function definitions haven't been pushed to your active Convex database environment.
            </p>
            
            <ol className="list-decimal pl-5 space-y-2 text-xs text-charcoal/70">
              <li>
                Open your terminal in the root folder of this project.
              </li>
              <li>
                Deploy functions to production by running: 
                <code className="bg-muted-blue/50 text-navy px-1.5 py-0.5 rounded font-mono text-[10px] ml-1 font-semibold">npx convex deploy</code>
              </li>
              <li>
                Ensure your <code className="bg-muted-blue/50 text-navy px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold">.env.local</code> keys are set correctly.
              </li>
            </ol>
          </div>
        </CardContent>

        <CardFooter className="border-t border-navy/5 bg-muted-blue/5 px-6 py-4 flex justify-end gap-3">
          <Button
            onClick={() => reset()}
            className="bg-navy text-white hover:bg-navy/95 w-full sm:w-auto font-semibold cursor-pointer"
          >
            <RefreshCw className="size-4 mr-2" />
            Reload & Retry Connection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
