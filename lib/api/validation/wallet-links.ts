import {
  walletLinkCreateSchema,
  walletLinkUpdateSchema,
} from "@/lib/api/schemas/wallet-link"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateWalletLinkCreatePayload(payload: unknown) {
  return validateWithSchema(walletLinkCreateSchema, payload)
}

export function validateWalletLinkUpdatePayload(payload: unknown) {
  return validateWithSchema(walletLinkUpdateSchema, payload)
}
