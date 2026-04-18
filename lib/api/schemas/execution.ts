import { z } from "zod"

export const executionTriggerTypeSchema = z.enum([
  "take_profit",
  "stop_loss",
  "strategy_created",
  "strategy_updated",
  "strategy_paused",
  "strategy_resumed",
  "strategy_deleted",
])

export const executionStatusSchema = z.enum(["success", "failed", "pending"])

export const executionSchema = z.object({
  id: z.string().trim().min(1).max(120),
  tokenSymbol: z.string().trim().min(1).max(10),
  triggerType: executionTriggerTypeSchema,
  amountSold: z.string().trim().min(1).max(80),
  status: executionStatusSchema,
  executedAt: z.string().datetime(),
})

export const executionCreateSchema = executionSchema.omit({
  id: true,
  executedAt: true,
})

export const executionUpdateSchema = executionCreateSchema.partial()

export type ExecutionApiModel = z.infer<typeof executionSchema>
export type ExecutionCreateInput = z.infer<typeof executionCreateSchema>
export type ExecutionUpdateInput = z.infer<typeof executionUpdateSchema>
