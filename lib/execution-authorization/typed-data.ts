import {
  getAddress,
  hashTypedData,
  keccak256,
  parseUnits,
  toBytes,
  verifyTypedData,
  type Address,
  type Hex,
} from "viem"

export const EXECUTION_AUTHORIZATION_DOMAIN_NAME = "KDEXIT"
export const EXECUTION_AUTHORIZATION_DOMAIN_VERSION = "1"

export const executionAuthorizationTypes = {
  ExecutionAuthorization: [
    { name: "user", type: "address" },
    { name: "strategyId", type: "bytes32" },
    { name: "token", type: "address" },
    { name: "adapter", type: "address" },
    { name: "chainId", type: "uint256" },
    { name: "sellBps", type: "uint16" },
    { name: "maxAmount", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const

export type ExecutionAuthorizationBuildInput = {
  adapter: string
  chainId: number
  deadline: string | number | bigint
  maxAmount: string
  nonce: string | number | bigint
  sellPercentage: number
  strategyId: string
  tokenAddress: string
  walletAddress: string
}

export function getExecutionAuthorizationStrategyId(strategyId: string): Hex {
  return keccak256(toBytes(strategyId))
}

export function getExecutionAuthorizationDeadline(date: Date) {
  return Math.floor(date.getTime() / 1000).toString()
}

export function createExecutionAuthorizationNonce() {
  const randomValues = new Uint32Array(2)

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValues)
  } else {
    randomValues[0] = Math.floor(Math.random() * 2 ** 32)
    randomValues[1] = Math.floor(Math.random() * 2 ** 32)
  }

  return BigInt(Date.now()) * BigInt(2) ** BigInt(32) + BigInt(randomValues[0] ^ randomValues[1])
}

export function getSellBps(sellPercentage: number) {
  return Math.round(sellPercentage * 100)
}

export function parseAuthorizationMaxAmount(value: string) {
  return parseUnits(value, 0)
}

export function buildExecutionAuthorizationTypedData(
  input: ExecutionAuthorizationBuildInput
) {
  const chainId = BigInt(input.chainId)
  const deadline = BigInt(input.deadline)
  const nonce = BigInt(input.nonce)
  const sellBps = getSellBps(input.sellPercentage)
  const maxAmount = parseAuthorizationMaxAmount(input.maxAmount)

  return {
    domain: {
      name: EXECUTION_AUTHORIZATION_DOMAIN_NAME,
      version: EXECUTION_AUTHORIZATION_DOMAIN_VERSION,
      chainId,
    },
    primaryType: "ExecutionAuthorization",
    types: executionAuthorizationTypes,
    message: {
      user: getAddress(input.walletAddress) as Address,
      strategyId: getExecutionAuthorizationStrategyId(input.strategyId),
      token: getAddress(input.tokenAddress) as Address,
      adapter: getAddress(input.adapter) as Address,
      chainId,
      sellBps,
      maxAmount,
      nonce,
      deadline,
    },
  } as const
}

export function hashExecutionAuthorization(input: ExecutionAuthorizationBuildInput) {
  return hashTypedData(buildExecutionAuthorizationTypedData(input))
}

export async function verifyExecutionAuthorizationSignature(input: {
  authorization: ExecutionAuthorizationBuildInput
  signature: Hex
}) {
  const typedData = buildExecutionAuthorizationTypedData(input.authorization)

  return verifyTypedData({
    ...typedData,
    address: typedData.message.user,
    signature: input.signature,
  })
}
