import {
  buildDatabaseResult,
  buildErrorResult,
  getIsoTimestamp,
  getAuthenticatedBrowserUser,
  getRequiredBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  WalletLinkInsert,
  WalletLinkRecord,
  WalletLinkUpdate,
} from "@/types/database-records"
import { normalizeWalletAddress } from "@/lib/web3/wallet-address"

async function clearPrimaryWalletLink(
  userId: string,
  excludeId?: string
) {
  const client = getRequiredBrowserClient()

  if (!client) {
    return { error: "Supabase wallet link mode is not enabled." }
  }

  let query = client
    .from("wallet_links")
    .update({
      is_primary: false,
      updated_at: getIsoTimestamp(),
    } as never)
    .eq("user_id", userId)
    .eq("is_primary", true)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { error } = await query

  return { error: error?.message ?? null }
}

export async function listWalletLinks(): Promise<DataAccessResult<WalletLinkRecord[]>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult([], "Supabase wallet link mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult([], "You must be signed in to load linked wallets.")
  }

  const { data, error } = await client
    .from("wallet_links")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function getWalletLink(
  id: string
): Promise<DataAccessResult<WalletLinkRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase wallet link mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to load a linked wallet.")
  }

  const { data, error } = await client
    .from("wallet_links")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function createWalletLink(
  input: WalletLinkInsert
): Promise<DataAccessResult<WalletLinkRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase wallet link mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to link a wallet.")
  }

  const normalizedWalletAddress = normalizeWalletAddress(input.wallet_address)

  const { data: existingWalletLink, error: existingWalletLinkError } = await client
    .from("wallet_links")
    .select("id")
    .eq("user_id", user.id)
    .eq("wallet_address", normalizedWalletAddress)
    .eq("chain_id", input.chain_id)
    .maybeSingle()

  if (existingWalletLinkError) {
    return buildErrorResult(null, existingWalletLinkError.message)
  }

  if (existingWalletLink) {
    return buildErrorResult(null, "That wallet is already linked to your account for this chain.")
  }

  if (input.is_primary) {
    const { error } = await clearPrimaryWalletLink(user.id)

    if (error) {
      return buildErrorResult(null, error)
    }
  }

  const payload: WalletLinkInsert = {
    ...input,
    user_id: user.id,
    wallet_address: normalizedWalletAddress,
    connector_name: input.connector_name ?? null,
    label: input.label ?? null,
    is_primary: input.is_primary ?? false,
    updated_at: input.updated_at ?? getIsoTimestamp(),
  }

  const { data, error } = await client
    .from("wallet_links")
    .insert(payload as never)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return buildErrorResult(
        null,
        "That wallet is already linked to your account for this chain."
      )
    }

    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function updateWalletLink(
  id: string,
  updates: WalletLinkUpdate
): Promise<DataAccessResult<WalletLinkRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase wallet link mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to update a linked wallet.")
  }

  if (updates.is_primary) {
    const { error } = await clearPrimaryWalletLink(user.id, id)

    if (error) {
      return buildErrorResult(null, error)
    }
  }

  const { data, error } = await client
    .from("wallet_links")
    .update(
      {
        ...updates,
        user_id: user.id,
        updated_at: updates.updated_at ?? getIsoTimestamp(),
      } as never
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function deleteWalletLink(
  id: string
): Promise<DataAccessResult<{ id: string } | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase wallet link mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to unlink a wallet.")
  }

  const { error } = await client
    .from("wallet_links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult({ id })
}
