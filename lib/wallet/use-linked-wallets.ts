"use client"

import { useEffect, useState } from "react"
import {
  createWalletLinkFromApi,
  deleteWalletLinkFromApi,
  listWalletLinksFromApi,
  updateWalletLinkFromApi,
} from "@/lib/dashboard/api-client"
import type {
  WalletLinkInsert,
  WalletLinkRecord,
  WalletLinkUpdate,
} from "@/types/database-records"

function sortLinkedWallets(wallets: WalletLinkRecord[]) {
  return [...wallets].sort((left, right) => {
    if (left.is_primary === right.is_primary) {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    }

    return left.is_primary ? -1 : 1
  })
}

export function useLinkedWallets() {
  const [linkedWallets, setLinkedWallets] = useState<WalletLinkRecord[]>([])
  const [isLoadingLinkedWallets, setIsLoadingLinkedWallets] = useState(true)
  const [linkedWalletsError, setLinkedWalletsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadLinkedWallets() {
      try {
        const wallets = await listWalletLinksFromApi()

        if (!isMounted) {
          return
        }

        setLinkedWallets(sortLinkedWallets(wallets))
        setLinkedWalletsError(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        console.error("Failed to load linked wallets:", error)
        setLinkedWalletsError("We could not load linked wallets right now.")
      } finally {
        if (isMounted) {
          setIsLoadingLinkedWallets(false)
        }
      }
    }

    void loadLinkedWallets()

    return () => {
      isMounted = false
    }
  }, [])

  async function createLinkedWallet(input: WalletLinkInsert) {
    const createdWallet = await createWalletLinkFromApi(input)

    setLinkedWallets((prev) => {
      const next = prev.filter((wallet) => wallet.id !== createdWallet.id)
      return sortLinkedWallets([createdWallet, ...next])
    })
    setLinkedWalletsError(null)

    return createdWallet
  }

  async function updateLinkedWallet(id: string, updates: WalletLinkUpdate) {
    const updatedWallet = await updateWalletLinkFromApi(id, updates)

    setLinkedWallets((prev) =>
      sortLinkedWallets(
        prev.map((wallet) =>
          wallet.id === updatedWallet.id
            ? updatedWallet
            : updates.is_primary
              ? { ...wallet, is_primary: false }
              : wallet
        )
      )
    )
    setLinkedWalletsError(null)

    return updatedWallet
  }

  async function deleteLinkedWallet(id: string) {
    await deleteWalletLinkFromApi(id)

    setLinkedWallets((prev) => prev.filter((wallet) => wallet.id !== id))
    setLinkedWalletsError(null)
  }

  return {
    createLinkedWallet,
    deleteLinkedWallet,
    isLoadingLinkedWallets,
    linkedWallets,
    linkedWalletsError,
    updateLinkedWallet,
  }
}
