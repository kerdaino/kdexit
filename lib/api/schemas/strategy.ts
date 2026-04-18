import { z } from "zod"

const strategyStatusSchema = z.enum(["active", "paused", "triggered", "completed"])

const optionalTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const strategyBaseSchema = z.object({
  id: z.string().trim().min(1).max(120),
  tokenName: z.string().trim().min(1).max(80),
  tokenSymbol: z
    .string()
    .trim()
    .min(1)
    .max(10)
    .regex(/^[A-Z0-9._-]+$/i, {
      message:
        "Token symbol can only include letters, numbers, dots, dashes, and underscores.",
    }),
  tokenAddress: z
    .string()
    .trim()
    .max(120)
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Token address must be a valid EVM contract address.",
    })
    .or(z.literal("")),
  chain: z.string().trim().min(1).max(50),
  chainId: z.number().int().positive(),
  sellPercentage: z.number().min(1).max(100),
  takeProfitPrice: z.number().positive().max(1_000_000_000).optional(),
  stopLossPrice: z.number().positive().max(1_000_000_000).optional(),
  triggerEnabled: z.boolean(),
  slippage: z.number().min(0.1).max(50),
  notes: optionalTrimmedStringSchema.pipe(z.string().max(240).optional()),
  status: strategyStatusSchema,
  createdAt: z.string().datetime(),
})

type StrategyPriceShape = {
  takeProfitPrice?: number
  stopLossPrice?: number
}

function withStrategyPriceRules<T extends z.ZodType<StrategyPriceShape>>(schema: T) {
  return schema.superRefine((value, context) => {
    if (
      value.takeProfitPrice !== undefined &&
      value.stopLossPrice !== undefined &&
      value.takeProfitPrice <= value.stopLossPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["takeProfitPrice"],
        message: "Take-profit price should be higher than stop-loss price.",
      })
    }
  })
}

export const strategySchema = withStrategyPriceRules(strategyBaseSchema)

const strategyCreateBaseSchema = strategyBaseSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    tokenAddress: strategyBaseSchema.shape.tokenAddress.optional().default(""),
    triggerEnabled: strategyBaseSchema.shape.triggerEnabled.optional().default(true),
    slippage: strategyBaseSchema.shape.slippage.optional().default(1),
    notes: strategyBaseSchema.shape.notes.optional(),
    status: strategyBaseSchema.shape.status.optional().default("active"),
  })

export const strategyCreateSchema = withStrategyPriceRules(strategyCreateBaseSchema)

export const strategyUpdateSchema = withStrategyPriceRules(strategyCreateBaseSchema.partial())

export type StrategyApiModel = z.infer<typeof strategySchema>
export type StrategyCreateInput = z.infer<typeof strategyCreateSchema>
export type StrategyUpdateInput = z.infer<typeof strategyUpdateSchema>
