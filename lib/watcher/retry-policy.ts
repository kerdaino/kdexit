import type { ExecutionAttemptRecord } from "@/types/database-records"
import type { RetryDecision } from "@/lib/watcher/types"

type RetryPolicyInput = {
  attempt: ExecutionAttemptRecord
  maxRetries?: number
  baseDelayMinutes?: number
  now: string
}

function addMinutes(isoTimestamp: string, minutes: number) {
  const date = new Date(isoTimestamp)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}

export function decideRetry(input: RetryPolicyInput): RetryDecision {
  const maxRetries = input.maxRetries ?? 3
  const baseDelayMinutes = input.baseDelayMinutes ?? 5

  if (input.attempt.status !== "failed") {
    return {
      kind: "do_not_retry",
      reason: "Only failed execution attempts are retryable.",
    }
  }

  if (input.attempt.retry_count >= maxRetries) {
    return {
      kind: "do_not_retry",
      reason: "Retry limit reached.",
    }
  }

  const nextRetryCount = input.attempt.retry_count + 1
  const delayMinutes = baseDelayMinutes * nextRetryCount

  return {
    kind: "retry",
    retryCount: nextRetryCount,
    nextEvaluationAt: addMinutes(input.now, delayMinutes),
  }
}
