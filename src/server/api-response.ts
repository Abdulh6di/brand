import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Invalid request data", 422, error.flatten());
  }
  console.error("[api]", error);
  return apiError("Something went wrong. Please try again.", 500);
}
