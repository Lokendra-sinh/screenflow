import { blob, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull()
});

export const rawData = sqliteTable('raw_data', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  data: text('data').notNull(),
  capturedAt: text('captured_at').notNull()
});

export const processedData = sqliteTable('processed_data', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  data: text('data').notNull(),
  processedAt: text('processed_at').notNull()
});

export const dailyPulse = sqliteTable('daily_pulse', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  status: text('status').notNull(), 
  data: text('data'), 
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  error: text('error'),
});

export const contentChunks = sqliteTable('content_chunks', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  rawDataId: text('raw_data_id').notNull().references(() => rawData.id),
  content: text('content').notNull(),
  sourceUrl: text('source_url'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const embeddings = sqliteTable('embeddings', {
  id: text('id').primaryKey(),
  chunkId: text('chunk_id').notNull().references(() => contentChunks.id),
  embedding: blob('embedding').notNull(),
  createdAt: text('created_at').notNull(),
});