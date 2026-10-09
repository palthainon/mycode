export class ToolFailure extends Error {
  constructor(public code: string) { super(code); }
}
export function safeCode(error: unknown): string {
  return error instanceof ToolFailure ? error.code : 'service_unavailable';
}
