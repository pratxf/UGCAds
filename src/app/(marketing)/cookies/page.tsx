import LegalLayout from "@/components/landing/LegalLayout";

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="April 11, 2026">
      <p>
        This Cookie Policy explains how UGCAds Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking technologies on our website and platform.
      </p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences, recognize your device, and improve your experience. Similar technologies include pixels, web beacons, and local storage.
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Essential Cookies</h3>
      <p>
        These cookies are strictly necessary for the website to function. They enable core features like user authentication, session management, and security. You cannot opt out of these cookies as the Service will not function without them.
      </p>
      <ul>
        <li>Session authentication tokens</li>
        <li>CSRF protection tokens</li>
        <li>Load balancer cookies</li>
      </ul>

      <h3>2.2 Functional Cookies</h3>
      <p>
        These cookies remember your preferences and settings to provide a personalized experience.
      </p>
      <ul>
        <li>Language and region preferences</li>
        <li>Theme preferences (dark/light mode)</li>
        <li>Recently used features and settings</li>
      </ul>

      <h3>2.3 Analytics Cookies</h3>
      <p>
        These cookies help us understand how visitors use the Service, which pages are most popular, and how users navigate through the platform. This data is aggregated and anonymized.
      </p>
      <ul>
        <li>Google Analytics (traffic analysis)</li>
        <li>Mixpanel (product usage analytics)</li>
        <li>Internal analytics tools</li>
      </ul>

      <h3>2.4 Marketing Cookies</h3>
      <p>
        These cookies track your activity across websites to deliver relevant advertising. They are set by our advertising partners.
      </p>
      <ul>
        <li>Meta Pixel (Facebook/Instagram advertising)</li>
        <li>Google Ads conversion tracking</li>
        <li>TikTok Pixel</li>
      </ul>

      <h2>3. How to Manage Cookies</h2>
      <p>You can control cookies through several methods:</p>
      <ul>
        <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through their settings menu.</li>
        <li><strong>Opt-Out Links:</strong> You can opt out of specific analytics and advertising cookies through industry opt-out tools such as the Digital Advertising Alliance (DAA) opt-out page.</li>
        <li><strong>Do Not Track:</strong> We honor Do Not Track (DNT) signals sent by your browser.</li>
      </ul>
      <p>
        Please note that blocking certain cookies may impact your ability to use the Service or limit functionality.
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Please refer to the privacy policies of these third parties for more information about their cookies.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        Cookie data is retained for varying periods depending on the type of cookie. Session cookies expire when you close your browser. Persistent cookies remain until their expiration date or until you delete them.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        If you have questions about our use of cookies, please contact us at:
      </p>
      <p>
        <strong>UGCAds Inc.</strong><br />
        Email: privacy@ugcads.com
      </p>
    </LegalLayout>
  );
}
