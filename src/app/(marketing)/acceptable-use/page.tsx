import LegalLayout from "@/components/landing/LegalLayout";

export default function AcceptableUsePage() {
  return (
    <LegalLayout title="Acceptable Use Policy" lastUpdated="April 11, 2026">
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) governs the use of the UGCAds platform and services. By using our Service, you agree to comply with this policy. Violations may result in account suspension or termination.
      </p>

      <h2>1. Prohibited Content</h2>
      <p>You may not use the Service to create, distribute, or promote content that:</p>
      <ul>
        <li>Is unlawful, fraudulent, or deceptive</li>
        <li>Contains hate speech, promotes violence, or discriminates against individuals or groups based on race, gender, religion, sexual orientation, disability, or national origin</li>
        <li>Is sexually explicit, pornographic, or exploits minors in any way</li>
        <li>Infringes on intellectual property rights (copyrights, trademarks, patents) of third parties</li>
        <li>Contains defamatory, libelous, or slanderous statements</li>
        <li>Promotes illegal drugs, weapons, or other regulated substances</li>
        <li>Contains malware, viruses, or other harmful code</li>
      </ul>

      <h2>2. Prohibited Activities</h2>
      <p>You may not:</p>
      <ul>
        <li><strong>Impersonation:</strong> Create deepfakes or content that impersonates real individuals without their explicit consent</li>
        <li><strong>Misinformation:</strong> Generate content designed to spread false information, manipulate public opinion, or interfere with elections</li>
        <li><strong>Spam:</strong> Use the Service to generate bulk unsolicited advertisements or spam content</li>
        <li><strong>Scraping:</strong> Use automated tools to scrape, crawl, or extract data from the Service</li>
        <li><strong>Reverse Engineering:</strong> Attempt to reverse-engineer, decompile, or extract source code from the Service or its AI models</li>
        <li><strong>Circumvention:</strong> Attempt to bypass usage limits, credit restrictions, or security measures</li>
        <li><strong>Reselling:</strong> Resell or redistribute access to the Service without authorization</li>
        <li><strong>Account Sharing:</strong> Share account credentials with unauthorized users (team seats excluded, as per your plan)</li>
      </ul>

      <h2>3. Content Guidelines for Generated Ads</h2>
      <p>When creating ads using our platform, you must ensure that:</p>
      <ul>
        <li>Ad content complies with the advertising policies of the platforms where they will be published (Meta, Google, TikTok, etc.)</li>
        <li>Health, financial, and legal claims are accurate and substantiated</li>
        <li>Testimonials and endorsements comply with FTC guidelines</li>
        <li>Products or services being advertised are legal in the target market</li>
        <li>You have the right to advertise the products or services shown</li>
      </ul>

      <h2>4. Uploaded Content</h2>
      <p>When uploading images, logos, or other materials to the Service:</p>
      <ul>
        <li>You must own or have proper licenses for all uploaded content</li>
        <li>You may not upload images containing identifiable individuals without their consent</li>
        <li>You may not upload copyrighted material you do not have rights to use</li>
        <li>Uploaded product images must be for products you have the right to advertise</li>
      </ul>

      <h2>5. Rate Limits and Fair Use</h2>
      <p>
        To ensure service quality for all users, we enforce fair use limits. Excessive automated usage, rapid-fire generation requests, or attempts to overload our systems may result in temporary rate limiting or account restrictions.
      </p>

      <h2>6. Reporting Violations</h2>
      <p>
        If you become aware of any content or activity that violates this policy, please report it to <strong>abuse@ugcads.com</strong>. We will investigate all reports promptly and take appropriate action.
      </p>

      <h2>7. Enforcement</h2>
      <p>We reserve the right to:</p>
      <ul>
        <li>Remove or disable access to any content that violates this policy</li>
        <li>Suspend or terminate accounts that violate this policy</li>
        <li>Report illegal activity to law enforcement authorities</li>
        <li>Withhold refunds for accounts terminated due to policy violations</li>
      </ul>
      <p>
        Enforcement decisions are made at our sole discretion. Repeated or severe violations will result in permanent account termination.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Acceptable Use Policy at any time. Material changes will be communicated through the Service or via email. Your continued use of the Service constitutes acceptance of the updated policy.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For questions about this policy or to report a violation:
      </p>
      <p>
        <strong>UGCAds Inc.</strong><br />
        Email: abuse@ugcads.com<br />
        Support: support@ugcads.us
      </p>
    </LegalLayout>
  );
}
