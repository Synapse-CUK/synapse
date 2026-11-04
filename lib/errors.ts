import { ConvexError } from "convex/values";

/**
 * A message that's safe to show the user for an error from a Convex call.
 *
 * Convex functions throw ConvexError with a plain-language message for
 * anything the user can fix. Those arrive intact in every deployment. Other
 * errors are bugs: production hides their text, and dev wraps it in request
 * IDs and a stack trace, so those fall back to the given message.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ConvexError) {
    return typeof err.data === "string" ? err.data : fallback;
  }
  if (err instanceof Error) {
    // Dev deployments: "[CONVEX M(...)] [Request ID: ...] Server Error\nUncaught Error: <message>\n    at ..."
    const match = err.message.match(/Uncaught (?:Convex)?Error: (.+)/);
    if (match) return match[1].trim();
    if (!err.message.includes("[CONVEX") && !err.message.includes("Server Error")) return err.message;
  }
  return fallback;
}
