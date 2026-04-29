import { Inngest } from "inngest";

// Defensive trim — env values pasted via `echo` (or copy-paste) often carry
// trailing newlines that silently break HMAC signature verification.
const eventKey = (process.env.INNGEST_EVENT_KEY || "").trim();
const signingKey = (process.env.INNGEST_SIGNING_KEY || "").trim();

export const inngest = new Inngest({
  id: "ugcads",
  name: "UGCAds",
  ...(eventKey && { eventKey }),
  ...(signingKey && { signingKey }),
});

// Event types
export type Events = {
  "video.generate": {
    data: { generationId: string };
  };
};
