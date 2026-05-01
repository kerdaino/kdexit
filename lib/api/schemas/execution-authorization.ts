import { z } from "zod"
import { normalizeWalletAddress } from "@/lib/web3/wallet-address"

const evmAddressSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      try {
        normalizeWalletAddress(value)
        return true
      } catch {
        return false
      }
    },
    { message: "Address must be a valid EVM address." }
  )
  .transform((value) => normalizeWalletAddress(value))

const uintStringSchema = z
  .string()
  .trim()
  .regex(/^(0|[1-9][0-9]*)$/, {
    message: "Value must be a non-negative integer string.",
  })

export const executionAuthorizationCreateSchema = z.object({
  adapter: evmAddressSchema,
  deadline: uintStringSchema,
  digest: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{64}$/, {
      message: "Digest must be a valid bytes32 hex value.",
    }),
  maxAmount: uintStringSchema.refine((value) => BigInt(value) > BigInt(0), {
    message: "Max amount must be greater than zero.",
  }),
  nonce: uintStringSchema.refine((value) => BigInt(value) > BigInt(0), {
    message: "Nonce must be greater than zero.",
  }),
  signature: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{130}$/, {
      message: "Signature must be a valid 65-byte EVM signature.",
    }),
  walletAddress: evmAddressSchema,
})

export type ExecutionAuthorizationCreateInput = z.infer<
  typeof executionAuthorizationCreateSchema
>
