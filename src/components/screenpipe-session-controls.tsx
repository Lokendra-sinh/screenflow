"use client"

import { useState } from "react"
import { Button } from "./ui/button";
import { useSession } from "@/providers/SessionProvider";
import { PlayCircle, StopCircle, RefreshCw } from "lucide-react";

export function ScreenpipeSessionControls() {
    const { sessionId, setSessionId } = useSession()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleToggleSession = async () => {
        setIsLoading(true);

        try {
            if (!sessionId) {
                // Start session
                const response = await fetch('/api/session/start', { method: 'POST' });
                if (response.ok) {
                    const body = await response.json()
                    if(body.data && body.data.sessionId){
                        setSessionId(body.data.sessionId)
                    }
                }
            } else {
                // Stop session
                const response = await fetch('/api/session/stop', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sessionId }) 
                });
                
                if (response.ok) {
                    setSessionId(null);
                }
            }
        } catch (error) {
            console.error(`Failed to ${sessionId ? 'stop' : 'start'} Screenpipe:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            <Button 
                onClick={handleToggleSession} 
                disabled={isLoading}
                size="lg"
                variant={sessionId ? "destructive" : "default"}
                className="gap-2"
            >
                {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                ) : sessionId ? (
                    <>
                        <StopCircle className="h-5 w-5" />
                        Stop Screenpipe
                    </>
                ) : (
                    <>
                        <PlayCircle className="h-5 w-5" />
                        Start Screenpipe
                    </>
                )}
            </Button>
        </div>
    )
}