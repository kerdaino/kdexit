import { NextResponse } from "next/server"

type SuccessResponse<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

type ErrorResponse = {
  ok: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export function jsonSuccess<T>(
  data: T,
  init?: {
    status?: number
    meta?: Record<string, unknown>
  }
) {
  const body: SuccessResponse<T> = {
    ok: true,
    data,
    meta: init?.meta,
  }

  return NextResponse.json(body, { status: init?.status ?? 200 })
}

export function jsonError(
  code: string,
  message: string,
  init?: {
    status?: number
    details?: Record<string, unknown>
  }
) {
  const body: ErrorResponse = {
    ok: false,
    error: {
      code,
      message,
      details: init?.details,
    },
  }

  return NextResponse.json(body, { status: init?.status ?? 400 })
}

export function jsonValidationError(
  message: string,
  fields: Record<string, string>
) {
  return jsonError("validation_error", message, {
    status: 422,
    details: { fields },
  })
}

export function jsonNotImplemented(operation: string) {
  return jsonError(
    "not_implemented",
    `${operation} is not implemented yet.`,
    {
      status: 501,
      details: {
        phase: "placeholder",
      },
    }
  )
}
