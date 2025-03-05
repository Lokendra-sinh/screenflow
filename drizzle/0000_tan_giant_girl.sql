CREATE TABLE "daily_pulse" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"status" text NOT NULL,
	"data" text,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "processed_data" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"data" text NOT NULL,
	"processed_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_data" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"data" text NOT NULL,
	"captured_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_pulse" ADD CONSTRAINT "daily_pulse_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_data" ADD CONSTRAINT "processed_data_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_data" ADD CONSTRAINT "raw_data_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;