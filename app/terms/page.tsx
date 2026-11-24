import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms governing student accounts, paid access and use of MadeiApp digital educational notes in Sri Lanka.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="These terms govern your use of MadeiApp, including free browsing, paid access to faculty notes and payments made through our payment partners."
    >
      <LegalSection title="1. Acceptance of these terms">
        <p>
          By creating an account, accessing the dashboard or purchasing access to MadeiApp notes,
          you agree to these Terms &amp; Conditions and our{' '}
          <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/refund" className="text-indigo-600 dark:text-indigo-400 underline">
            Refund Policy
          </a>
          . If you do not agree, please do not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. About the service">
        <p>
          MadeiApp is a digital educational notes platform for students in Sri Lanka. We provide
          access to faculty-prepared lecture notes, summaries, revision material and related study
          resources, together with account tools such as bookmarks, progress tracking and payment
          verification.
        </p>
        <p>
          MadeiApp is an independent study-resource platform. We are not a university, examination
          body or accredited training provider, and we do not issue academic qualifications.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility and accounts">
        <ul className="list-disc pl-5 space-y-2">
          <li>You must provide accurate, current information when registering.</li>
          <li>
            You are responsible for keeping your password confidential and for all activity under
            your account.
          </li>
          <li>
            Accounts are personal. Do not share your login details or allow others to access paid
            materials through your account.
          </li>
          <li>
            If you are under 18, you may use the platform only with the involvement and consent of a
            parent or guardian.
          </li>
          <li>
            We may suspend or terminate accounts that breach these terms, attempt fraud, or misuse
            the platform.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Paid access, pricing and payments">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Some study materials require paid access. Prices are displayed in Sri Lankan Rupees
            (LKR) on the Payments page and may change from time to time.
          </li>
          <li>
            Online payments are processed by <strong>PayHere</strong> for local cards, wallets and
            mobile payment methods, or <strong>Paddle</strong> for international card payments where
            offered. Their terms and fees also apply.
          </li>
          <li>
            Bank slip payments are manually verified. Access is unlocked only after our team
            confirms the payment. Incorrect or unverifiable slips may be rejected.
          </li>
          <li>
            Promo codes are subject to availability, may expire, and cannot be exchanged for cash.
            Only one code may be applied per payment unless stated otherwise.
          </li>
          <li>
            You are responsible for any bank charges, currency conversion costs or gateway fees
            associated with your chosen payment method.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Licence and permitted use">
        <p>
          When you obtain access to notes, we grant you a personal, limited, non-exclusive,
          non-transferable licence to view and download the materials for your own study and
          revision. All notes, branding, layout and content remain the intellectual property of
          MadeiApp or the relevant faculty contributor.
        </p>
        <p>You may not:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Copy, reproduce, republish, sell, sublicense or distribute paid materials.</li>
          <li>Share files, download links or account access with other people.</li>
          <li>Use automated tools to scrape, bulk-download or index the platform.</li>
          <li>Remove copyright notices or claim the materials as your own work.</li>
          <li>Use the materials for commercial teaching or tutoring without written permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Prohibited conduct">
        <ul className="list-disc pl-5 space-y-2">
          <li>Attempting to bypass payments, access controls or security measures.</li>
          <li>Uploading malicious files, spam or content that infringes another person&apos;s rights.</li>
          <li>Impersonating another student, staff member or administrator.</li>
          <li>Using the platform for unlawful activity under Sri Lankan law.</li>
          <li>Interfering with the operation, availability or integrity of the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Third-party services">
        <p>
          The platform relies on third-party providers including Google Firebase, Microsoft Azure,
          PayHere and Paddle. We are not responsible for outages, delays or errors caused by those
          providers, although we will make reasonable efforts to help resolve payment or access
          issues. Your use of a payment provider is also governed by that provider&apos;s terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and changes">
        <p>
          We aim to keep the platform available, but we do not guarantee uninterrupted access.
          Maintenance, security updates, provider outages or circumstances beyond our control may
          cause temporary downtime. We may add, update, replace or remove study materials and
          features at any time. Where a material change significantly affects paid access, we will
          provide reasonable notice on the platform.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimer of warranties">
        <p>
          The notes and materials are provided for general educational and revision purposes. While
          we work with faculty contributors to keep content accurate and useful, we do not warrant
          that materials are complete, error-free, current or suitable for a particular examination
          or syllabus. MadeiApp does not provide academic, legal, financial or professional advice
          and does not guarantee any particular grade, result or outcome.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, MadeiApp and its team will not be liable for any
          indirect, incidental, special or consequential loss, loss of data, loss of profits, or
          loss arising from reliance on study materials. Our total liability for any claim relating
          to paid access will not exceed the amount you paid to MadeiApp for the affected access
          period. Nothing in these terms limits rights that cannot be excluded under Sri Lankan
          consumer law.
        </p>
      </LegalSection>

      <LegalSection title="11. Suspension and termination">
        <p>
          We may suspend or terminate your access if you breach these terms, engage in fraud or
          payment abuse, share paid materials, or if required by law. Where appropriate, we will
          notify you and allow you to respond. You may stop using the platform at any time and ask us
          to delete your account by contacting support. Termination does not entitle you to a refund
          where access has already been provided, except as described in our Refund Policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law and disputes">
        <p>
          These terms are governed by the laws of Sri Lanka. Before starting formal proceedings, we
          ask that you contact us so we can try to resolve the issue informally. Any dispute that
          cannot be resolved amicably will be subject to the exclusive jurisdiction of the courts of
          Sri Lanka.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          For questions about these Terms &amp; Conditions, email{' '}
          <a href="mailto:support@madeiapp.com" className="text-indigo-600 dark:text-indigo-400 underline">
            support@madeiapp.com
          </a>{' '}
          or use the{' '}
          <a href="/contact" className="text-indigo-600 dark:text-indigo-400 underline">
            Contact page
          </a>
          . We aim to respond within one business day.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
