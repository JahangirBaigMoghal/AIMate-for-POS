import { z } from "zod";

/**
 * Client → Server message schemas for the voice bridge WebSocket.
 */

export const SessionStartMessageSchema = z.object({
  type: z.literal("session.start"),
  tenant_id: z.string().min(1),
  store_id: z.string().min(1),
  caller_phone: z.string().optional(),
  language: z.string().default("en"),
  mode: z.enum(["text", "audio"]).default("audio")
});

export const UserTextMessageSchema = z.object({
  type: z.literal("user.text"),
  text: z.string().min(1)
});

export const UserAudioMessageSchema = z.object({
  type: z.literal("user.audio"),
  data: z.string().min(1) // base64-encoded PCM 16kHz 16-bit mono
});

export const SessionEndMessageSchema = z.object({
  type: z.literal("session.end")
});

export const ClientMessageSchema = z.discriminatedUnion("type", [
  SessionStartMessageSchema,
  UserTextMessageSchema,
  UserAudioMessageSchema,
  SessionEndMessageSchema
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
export type SessionStartMessage = z.infer<typeof SessionStartMessageSchema>;

/**
 * Server → Client message types (sent as JSON).
 */
export type ServerMessage =
  | { type: "session.ready"; call_id: string; model: string }
  | { type: "agent.text"; text: string }
  | { type: "agent.audio"; data: string; mimeType: string }
  | { type: "tool.calling"; tool: string; request_id: string }
  | { type: "tool.result"; tool: string; ok: boolean; message: string }
  | { type: "turn.complete" }
  | { type: "session.error"; error: string; code?: string }
  | { type: "session.ended"; reason: string };
