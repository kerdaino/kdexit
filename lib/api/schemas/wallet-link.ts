import { z } from "zod"
import { normalizeWalletAddress } from "@/lib/web3/wallet-address"

const optionalTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const walletAddressSchema = z
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
    {
      message: "Wallet address must be a valid EVM address.",
    }
  )
  .transform((value) => normalizeWalletAddress(value))

const chainIdSchema = z.number().int().positive()

export const walletLinkSchema = z.object({
  id: z.string().trim().min(1).max(120),
  walletAddress: walletAddressSchema,
  chainId: chainIdSchema,
  connectorName: optionalTrimmedStringSchema.pipe(z.string().max(80).optional()),
  label: optionalTrimmedStringSchema.pipe(z.string().max(80).optional()),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const walletLinkCreateSchema = walletLinkSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    connectorName: walletLinkSchema.shape.connectorName.optional(),
    label: walletLinkSchema.shape.label.optional(),
    isPrimary: walletLinkSchema.shape.isPrimary.optional().default(false),
  })

export const walletLinkUpdateSchema = z
  .object({
    label: walletLinkSchema.shape.label.optional(),
    connectorName: walletLinkSchema.shape.connectorName.optional(),
    isPrimary: walletLinkSchema.shape.isPrimary.optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one wallet link field must be provided.",
    path: ["body"],
  })

export type WalletLinkApiModel = z.infer<typeof walletLinkSchema>
export type WalletLinkCreateInput = z.infer<typeof walletLinkCreateSchema>
export type WalletLinkUpdateInput = z.infer<typeof walletLinkUpdateSchema>
