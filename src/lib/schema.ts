import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export const rawData = pgTable('raw_data', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  data: text('data').notNull(),
  capturedAt: timestamp('captured_at').notNull()
});

export const processedData = pgTable('processed_data', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  data: text('data').notNull(),
  processedAt: timestamp('processed_at').notNull()
});

export const dailyPulse = pgTable('daily_pulse', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  status: text('status').notNull(),
  data: text('data'),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
});

