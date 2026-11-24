import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How MadeiApp collects, uses, stores and protects personal data for students using our digital educational notes platform in Sri Lanka.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="This policy explains what personal information MadeiApp collects, why we collect it, and the choices you have when using our digital study-notes platform."
    >
      <LegalSection title="1. Who we are">
        <p>
          MadeiApp (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates a digital educational
          notes platform for students in Sri Lanka. We provide faculty-prepared lecture notes,
          summaries and related study materials through a web application, along with account,
          payment and progress-tracking features.
        </p>
        <p>
          For questions about this Privacy Policy or your personal data, contact us at{' '}
          <a href="mailto:support@madeiapp.com" className="text-indigo-600 dark:text-indigo-400 underline">
            support@madeiapp.com
          </a>{' '}
          or through our{' '}
          <a href="/contact" className="text-indigo-600 dark:text-indigo-400 underline">
            Contact page
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We collect only the information needed to run the platform safely and reliably:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account information:</strong> your name, email address, account role, paid
            access status and Firebase user identifier.
          </li>
          <li>
            <strong>Payment information:</strong> payment status, amounts, promo codes, bank slip
            images or PDFs you upload, and references returned by PayHere or Paddle. We do not
            receive or store your full card number, CVV or online banking credentials.
          </li>
          <li>
            <strong>Study activity:</strong> bookmarked and completed files, progress data,
            notification read status, and aggregated file view counts.
          </li>
          <li>
            <strong>Support communications:</strong> messages you send through the Contact form or
            WhatsApp, including your name, email and the content of your inquiry.
          </li>
          <li>
            <strong>Technical data:</strong> limited device and browser information used to keep you
            signed in and to maintain session security. Theme preferences are stored in your
            browser&apos;s local storage.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To create and manage your student account and verify your identity.</li>
          <li>To process payments, verify bank slips, apply promo codes and unlock paid content.</li>
          <li>To deliver study materials and save your bookmarks, progress and preferences.</li>
          <li>To respond to support requests and resolve payment or access issues.</li>
          <li>To prevent fraud, abuse, unauthorised sharing of paid notes and account misuse.</li>
          <li>To maintain platform security, troubleshoot errors and improve our services.</li>
          <li>To comply with legal obligations in Sri Lanka and applicable payment-provider rules.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal basis and consent">
        <p>
          We process personal data because it is necessary to perform our contract with you
          (providing the platform and paid notes), to comply with legal obligations, to protect
          legitimate interests such as fraud prevention and platform security, and where required,
          based on your consent. You may withdraw consent for optional communications at any time.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing and service providers">
        <p>
          We do not sell your personal data. We share limited information with trusted processors
          that help us operate the platform:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Google Firebase</strong> for authentication and database services (account
            profiles, payments, reviews, messages and settings).
          </li>
          <li>
            <strong>Microsoft Azure Blob Storage</strong> for secure storage of study materials and
            payment slips, accessed through short-lived signed links.
          </li>
          <li>
            <strong>PayHere</strong> for Sri Lankan card, wallet and mobile payment processing in
            LKR.
          </li>
          <li>
            <strong>Paddle</strong> for international card payments where that option is offered.
          </li>
          <li>
            <strong>Email delivery providers</strong> used to send account, payment and support
            notifications.
          </li>
        </ul>
        <p>
          These providers process data under their own terms and privacy policies. We share only
          the information necessary for the relevant service. Payment providers handle card data
          directly and are responsible for their own PCI-DSS compliance.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We keep account and payment records for as long as your account is active and for a
          reasonable period afterwards to meet accounting, tax, fraud-prevention and dispute
          resolution requirements. Payment slips and support messages are retained only as long as
          needed for verification, support and legal compliance, after which they are deleted or
          anonymised.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use industry-standard measures including encrypted connections, Firebase
          authentication, role-based Firestore access rules and signed, time-limited links for file
          downloads. However, no method of transmission or storage is completely secure. Please
          keep your password confidential and notify us immediately if you suspect unauthorised
          access to your account.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          Subject to applicable law, you may request access to your personal data, ask us to correct
          inaccurate information, request deletion of your account or data, object to certain
          processing, or ask for a copy of the information you provided. To exercise these rights,
          email{' '}
          <a href="mailto:support@madeiapp.com" className="text-indigo-600 dark:text-indigo-400 underline">
            support@madeiapp.com
          </a>
          . We may need to verify your identity before responding. You also have the right to lodge a
          complaint with the relevant data-protection authority in Sri Lanka.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies and local storage">
        <p>
          We use browser local storage to remember your dark-mode preference and to keep you signed
          in through Firebase authentication. We do not use advertising cookies or sell behavioural
          data. You can clear local storage in your browser settings, but you may need to sign in
          again and re-select your theme.
        </p>
      </LegalSection>

      <LegalSection title="10. Children's privacy">
        <p>
          The platform is intended for higher-education students. If you are under 18, you should
          use MadeiApp only with the involvement and consent of a parent or guardian. We do not
          knowingly collect personal data from children below the age required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. International transfers">
        <p>
          Our service providers may store or process data outside Sri Lanka. Where this happens, we
          take reasonable steps to ensure appropriate safeguards are in place, consistent with the
          providers&apos; standard data-protection commitments.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The updated version will be posted on
          this page with a revised &quot;Last updated&quot; date. Material changes will be
          communicated through the platform where appropriate.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
