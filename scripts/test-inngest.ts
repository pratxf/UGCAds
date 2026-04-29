/* eslint-disable */
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "ugcads", name: "UGCAds" });

(async () => {
  const startTs = Date.now();
  console.log("Sending test event to Inngest…");
  try {
    const result = await inngest.send({
      name: "video.generate",
      data: { generationId: "test-from-cli-" + Date.now() },
    });
    console.log("✓ Sent. Response:", JSON.stringify(result, null, 2));
    console.log("Took", Date.now() - startTs, "ms");
  } catch (e) {
    console.error("✗ Failed:", e instanceof Error ? e.message : e);
    if (e instanceof Error && "stack" in e) console.error(e.stack);
  }
})();
