import { NextResponse } from "next/server";
import { spawn } from "child_process";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sessions } from "@/lib/schema";

export async function POST() {
  const originalPromise = new Promise(async (resolve) => {
    try {
      const healthResponse = await fetch("http://localhost:3030/health");
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        return resolve(
          NextResponse.json({
            success: true,
            message: "Screenpipe session is already running",
            health: healthData,
          })
        );
      }
    } catch {
      console.log("Screenpipe not running, starting it now");
    }

    const screenpipeProcess = spawn("screenpipe", {
      detached: true,
      stdio: "ignore",
    });

    screenpipeProcess.unref();

    // Polling logic (mostly existing code)
    const maxAttempts = 10;
    let attempts = 0;

    const checkHealth = async () => {
      if (attempts >= maxAttempts) {
        return resolve(
          NextResponse.json(
            {
              success: false,
              error:
                "Failed to start Screenpipe session after multiple attempts",
            },
            { status: 500 }
          )
        );
      }

      try {
        const healthResponse = await fetch("http://localhost:3030/health");
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          const sessionId = crypto.randomUUID();
          const now = new Date().toISOString();

          // INSERT THE SESSION INTO THE DATABASE
          const db = getDb();
          await db.insert(sessions).values({
            id: sessionId,
            startTime: now,
            status: "recording",
            createdAt: now,
          });

          return resolve(
            NextResponse.json({
              success: true,
              data: {
                sessionId: sessionId,
              },
              health: healthData,
              message: "Screenpipe session started successfully!",
            })
          );
        }
      } catch (error) {
        console.error("Health check error:", error);
        attempts++;
        setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();
  });

  return originalPromise;
}
