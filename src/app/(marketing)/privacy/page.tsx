import LegalLayout from "@/components/landing/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 11, 2026">
      <p>
        UGCAds Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our platform, website, and services (the &quot;Service&quot;).
      </p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Information You Provide</h3>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, password, and billing information when you create an account or subscribe to a plan.</li>
        <li><strong>Payment Information:</strong> Credit card numbers, billing addresses, and other payment details processed through our third-party payment processors (Stripe, Dodo Payments). We do not store full credit card numbers on our servers.</li>
        <li><strong>Content:</strong> Scripts, product images, and other materials you upload to generate ads.</li>
        <li><strong>Communications:</strong> Information you provide when contacting support or submitting feedback.</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage Data:</strong> Pages visited, features used, generation history, time spent on the platform, and click patterns.</li>
        <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, IP address, and screen resolution.</li>
        <li><strong>Cookies and Tracking:</strong> We use cookies, pixels, and similar technologies to enhance your experience and analyze usage. See our <a href="/cookies">Cookie Policy</a> for details.</li>
        <li><strong>Log Data:</strong> Server logs including access times, referring URLs, and error reports.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use collected information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service</li>
        <li>Process transactions and send related information</li>
        <li>Generate AI-powered video ads and mockups based on your inputs</li>
        <li>Send administrative communications (account confirmations, billing, security alerts)</li>
        <li>Send marketing communications (with your consent; you can opt out at any time)</li>
        <li>Monitor and analyze usage trends to improve user experience</li>
        <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Service (payment processing, cloud hosting, email delivery, analytics). These providers are contractually obligated to protect your data.</li>
        <li><strong>AI Processing Partners:</strong> Your scripts and content inputs are processed by AI service providers to generate video content. This data is used solely for generation purposes and is not retained by these partners beyond the processing period.</li>
        <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.</li>
        <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is active or as needed to provide the Service. Generated content is stored for 90 days after creation, after which it may be automatically deleted. Account data is retained for up to 30 days after account deletion to allow for recovery, after which it is permanently removed.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement industry-standard security measures including encryption in transit (TLS/SSL), encryption at rest, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
        <li><strong>Correction:</strong> Request correction of inaccurate personal information.</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal obligations.</li>
        <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
        <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time by clicking &quot;unsubscribe&quot; in any email or updating your account settings.</li>
        <li><strong>Do Not Sell:</strong> We do not sell personal information as defined under the California Consumer Privacy Act (CCPA).</li>
      </ul>
      <p>To exercise these rights, contact us at privacy@ugcads.com.</p>

      <h2>7. California Privacy Rights (CCPA)</h2>
      <p>
        If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, and the right to opt out of the sale of personal information. We do not sell personal information. To submit a verifiable consumer request, email privacy@ugcads.com.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have different data protection laws. By using the Service, you consent to such transfers. We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy.
      </p>

      <h2>10. Third-Party Links</h2>
      <p>
        The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on the Service and updating the &quot;Last updated&quot; date. Your continued use of the Service after such changes constitutes acceptance.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions or concerns about this Privacy Policy, please contact us at:
      </p>
      <p>
        <strong>UGCAds Inc.</strong><br />
        Email: privacy@ugcads.com<br />
        Support: support@ugcads.us
      </p>
    </LegalLayout>
  );
}
