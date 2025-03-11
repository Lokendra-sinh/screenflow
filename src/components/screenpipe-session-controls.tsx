"use client"

import { Button } from "./ui/button";
import { useSession } from "@/providers/SessionProvider";
import { PlayCircle, StopCircle, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export function ScreenpipeSessionControls() {
    const { sessionId, setSessionId } = useSession();

    // Mutation for starting a session
    const startSessionMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/session/start', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to start session');
            }
            return response.json();
        },
        onSuccess: (data) => {
            console.log("DATA is", data)
            if (data.data && data.data.sessionId) {
                setSessionId(data.data.sessionId);
            }
        },
        onError: (error) => {
            console.error('Failed to start Screenpipe:', error);
        }
    });


    const stopSessionMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/session/stop', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId }) 
            });
            
            if (!response.ok) {
                throw new Error('Failed to stop session');
            }
            return response.json();
        },
        onSuccess: () => {
            setSessionId(null);
        },
        onError: (error) => {
            console.error('Failed to stop Screenpipe:', error);
        }
    });

    const handleToggleSession = () => {
        if (!sessionId) {
            startSessionMutation.mutate();
        } else {
            stopSessionMutation.mutate();
        }
    };


    const isLoading = startSessionMutation.isPending || stopSessionMutation.isPending;

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