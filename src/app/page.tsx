"use client";

import { ScreenpipeSessionControls } from "@/components/screenpipe-session-controls";
import { SessionsTable } from "@/components/sessions-table";
import { SessionStatusIndicator } from "@/components/session-status-indicator";
import { SessionProvider } from "@/providers/SessionProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
      <div className="flex flex-col gap-6 container py-8 max-w-5xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Screenflow</h1>
          <p className="text-muted-foreground mt-1">Capture, analyze, optimize your digital day</p>
        </div>
        
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="search" className="relative">
              AI search
              {/* <div className="absolute -top-2 -right-2">
                <div className="flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-medium bg-gradient-to-r from-[hsl(var(--chart-1))] to-[hsl(var(--chart-3))] text-background animate-pulse">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Coming Soon</span>
                </div>
              </div> */}
            </TabsTrigger>
            <TabsTrigger value="capture" className="flex items-center justify-center gap-2">
              {mounted && <SessionStatusIndicator />}
              Record
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="mt-6">
            <SessionsTable />
          </TabsContent>
          
          <TabsContent value="search" className="mt-6">
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/30">
              <div className="flex flex-col items-center max-w-md text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-gradient-to-r from-[hsl(var(--chart-1))] to-[hsl(var(--chart-3))] text-background">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Coming Soon</span>
                </div>
                <h3 className="text-xl font-medium mb-2">AI Search Feature</h3>
                <p className="text-muted-foreground">
                  {`We're working on an intelligent search interface that will let you query your captured sessions using natural language. Stay tuned!`}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="capture" className="mt-6">
            <div className="flex flex-col items-center justify-center gap-6 py-10 border rounded-lg bg-muted/30">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-medium mb-2">Start Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Screenflow will capture your session and identify job postings automatically along with session analytics
                </p>
              </div>
              <ScreenpipeSessionControls />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SessionProvider>
  );
}