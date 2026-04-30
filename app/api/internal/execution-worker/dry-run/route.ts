import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireInternalExecutionWorkerDryRunAccess } from "@/lib/api/internal-access"
import { requireSameOriginMutation } from "@/lib/api/route-auth"
import { validateExecutionWorkerDryRunPayload } from "@/lib/api/validation/execution-worker"
import { createSupabaseExecutionWorkerRepository } from "@/lib/execution-worker/repository"
import { runExecutionWorkerDryRun } from "@/lib/execution-worker/pipeline"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  return jsonError(code, message, { status: 500 })
}

export async function POST(request: Request) {
  const origin = requireSameOriginMutation(request)

  if (!origin.ok) {
    return origin.response
  }

  const payload = await request.json().catch(() => null)
  const validation = validateExecutionWorkerDryRunPayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Execution worker dry-run payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireInternalExecutionWorkerDryRunAccess()

  if (!auth.ok) {
    return auth.response
  }

  try {
    const result = await runExecutionWorkerDryRun({
      repository: createSupabaseExecutionWorkerRepository(auth.supabase),
      run: {
        observations: validation.data.observations.map((observation) => ({
          strategyId: observation.strategyId,
          chainId: observation.chainId,
          tokenAddress: observation.tokenAddress,
          observedPrice: observation.observedPrice,
          observedAt: observation.observedAt ?? new Date().toISOString(),
          source: observation.source,
          isStale: observation.isStale,
        })),
        strategyIds: validation.data.strategyIds,
        userId: auth.user.id,
      },
    })

    return jsonSuccess(result, {
      status: 201,
      meta: {
        mode: "dry_run",
        resource: "execution_worker",
        route: "internal",
      },
    })
  } catch (error) {
    return getDataErrorResponse(
      "execution_worker_dry_run_failed",
      error instanceof Error ? error.message : "Execution worker dry-run failed."
    )
  }
}
