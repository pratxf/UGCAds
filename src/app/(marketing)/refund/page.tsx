import LegalLayout from "@/components/landing/LegalLayout";

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 11, 2026">
      <p>
        At UGCAds Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we want you to be satisfied with our Service. This Refund Policy outlines the conditions under which refunds are available.
      </p>

      <h2>1. Subscription Plan Refunds</h2>
      <p>
        We offer a <strong>3-day refund window</strong> from the date of your initial subscription purchase or renewal, subject to the following conditions:
      </p>
      <ul>
        <li><strong>Eligible for refund:</strong> You may request a full refund within 3 calendar days of purchase, provided that <strong>zero (0) credits have been used</strong> during the current billing cycle.</li>
        <li><strong>Not eligible for refund:</strong> If any credits from your subscription have been consumed (used to generate UGC ads, product ads, or mockups), the purchase is non-refundable regardless of timing.</li>
      </ul>

      <h2>2. Credit Pack Purchases</h2>
      <p>
        Purchases of additional credit packs (one-time credit top-ups) are <strong>non-refundable</strong> once purchased, regardless of whether the credits have been used.
      </p>

      <h2>3. Failed Generations</h2>
      <p>
        If a generation fails due to a technical error on our end (system failure, processing error, or timeout), the credits consumed by that generation will be <strong>automatically refunded</strong> to your account. No action is required on your part. You will receive a notification when credits are restored.
      </p>

      <h2>4. Plan Downgrades and Cancellations</h2>
      <ul>
        <li><strong>Downgrades:</strong> If you downgrade to a lower-tier plan, the change takes effect at the start of your next billing cycle. No prorated refunds are issued for the remainder of the current cycle.</li>
        <li><strong>Cancellations:</strong> If you cancel your subscription, you will retain access to your current plan features until the end of your billing cycle. No refunds are issued for partial billing periods.</li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>To request a refund, you must:</p>
      <ol>
        <li>Submit a request within 3 calendar days of purchase.</li>
        <li>Email <strong>support@ugcads.com</strong> with the subject line &quot;Refund Request&quot; and include your account email and the date of purchase.</li>
        <li>Ensure that no credits have been used during the billing period.</li>
      </ol>
      <p>
        We will review your request and process eligible refunds within <strong>5 to 10 business days</strong>. Refunds will be credited to the original payment method.
      </p>

      <h2>6. Chargebacks</h2>
      <p>
        If you initiate a chargeback or payment dispute with your bank or credit card company instead of contacting us first, we reserve the right to suspend or permanently terminate your account. We encourage you to contact our support team first to resolve any billing issues.
      </p>

      <h2>7. Exceptions</h2>
      <p>
        We may, at our sole discretion, grant refunds outside of this policy in exceptional circumstances (e.g., extended service outages, billing errors). Such exceptions do not set precedent for future refund requests.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. The policy in effect at the time of your purchase governs your refund eligibility.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For refund requests or billing questions, please contact us at:
      </p>
      <p>
        <strong>UGCAds Inc.</strong><br />
        Email: support@ugcads.com
      </p>
    </LegalLayout>
  );
}
