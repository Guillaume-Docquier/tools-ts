import { DEFAULT_REDACT_FIELDS, type FieldRedactionOptions } from "@logtape/redaction"

export const RECOMMENDED_LOG_REDACTION = {
  /**
   * Extends LogTape's {@link DEFAULT_REDACT_FIELDS} with specific additions:
   * - `qrcode` — MFA / 2FA QR code payloads
   * - `assertion` — OAuth `client_assertion` and similar
   * - `cookie` — HTTP cookie headers
   * - `x-api-key`, `x-auth-token`, `x-access-token` — common credential HTTP headers
   */
  fieldPatterns: [...DEFAULT_REDACT_FIELDS, /qr.?code/i, /assertion/i, /cookie/i, "x-api-key", "x-auth-token", "x-access-token"],
  action: (): string => "[REDACTED]",
} as const satisfies FieldRedactionOptions
