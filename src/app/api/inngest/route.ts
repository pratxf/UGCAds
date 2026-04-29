import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateVideoFn } from "@/inngest/generate-video";

// Pass the trimmed signing key here too — the inngest/next adapter reads
// process.env.INNGEST_SIGNING_KEY directly, which may carry a trailing
// newline and break signature verification.
const signingKey = (process.env.INNGEST_SIGNING_KEY || "").trim();

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateVideoFn],
  ...(signingKey && { signingKey }),
});
