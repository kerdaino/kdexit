import { z } from "zod"

const watcherObservationSchema = z.object({
  strategyId: z.string().trim().min(1).max(120).optional(),
  chainId: z.number().int().positive(),
  tokenAddress: z
    .string()
    .trim()
    .max(120)
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Token address must be a valid EVM contract address.",
    }),
  observedPrice: z.number().positive().max(1_000_000_000),
  observedAt: z.string().datetime().optional(),
  source: z.string().trim().min(1).max(80).optional().default("manual_simulation"),
  isStale: z.boolean().optional().default(false),
})

export const watcherSimulationRequestSchema = z.object({
  strategyIds: z.array(z.string().trim().min(1).max(120)).max(50).optional(),
  observations: z.array(watcherObservationSchema).min(1).max(100),
})

export type WatcherSimulationRequestInput = z.infer<typeof watcherSimulationRequestSchema>
