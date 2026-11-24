import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Refund eligibility, request process and timelines for digital study notes purchased on MadeiApp in Sri Lanka.',
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      subtitle="This policy explains when refunds may be available for paid digital study materials, how to request one, and the timelines you can expect."
    >
      <LegalSection title="1. Digital products and your agreement">
        <p>
          MadeiApp sells access to digital educational content, including lecture notes, summaries
          and revision materials. Because these products are delivered digitally and can be accessed
          immediately, refunds are limited and are assessed case by case in line with this policy and
          Sri Lankan consumer law.
        </p>
        <p>
          By completing a payment, you confirm that you understand you are purchasing digital access
          rather than a physical product.
        </p>
      </LegalSection>

      <LegalSection title="2. When a refund may be approved">
        <p>We may approve a refund in the following situations:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Duplicate payment:</strong> you were charged more than once for the same access
            period.
          </li>
          <li>
            <strong>Payment succeeded but access was not provided:</strong> your payment was
            confirmed, but paid materials remained inaccessible and our support team could not
            resolve the issue within a reasonable time.
          </li>
          <li>
            <strong>Unauthorised transaction:</strong> you can show that a payment was made without
            your authorisation, subject to verification with the payment provider.
          </li>
          <li>
            <strong>Incorrect amount charged:</strong> a promo code or displayed price was not applied
            as shown at checkout, and the difference cannot be corrected another way.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. When a refund is not available">
        <ul className="list-disc pl-5 space-y-2">
          <li>You changed your mind after paid access was granted.</li>
          <li>You downloaded, opened or used the paid materials.</li>
          <li>You did not achieve a particular grade, exam result or academic outcome.</li>
          <li>You did not use the materials before an examination or deadline.</li>
          <li>Your account was suspended or terminated for breaching our Terms &amp; Conditions.</li>
          <li>You shared, resold or redistributed paid content.</li>
          <li>A promo code expired or was unavailable when you attempted to use it.</li>
          <li>Payment was made to the wrong account or by a third party without our ability to verify.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How to request a refund">
        <p>
          Submit your request within <strong>7 calendar days</strong> of the payment date. Email{' '}
          <a href="mailto:support@madeiapp.com" className="text-indigo-600 dark:text-indigo-400 underline">
            support@madeiapp.com
          </a>{' '}
          with:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your full name and the email address linked to your MadeiApp account.</li>
          <li>The payment date, amount and payment method (PayHere, Paddle or bank slip).</li>
          <li>The order ID or bank transaction reference.</li>
          <li>A clear description of the issue and any screenshots or supporting documents.</li>
        </ul>
        <p>
          You can also contact us through the{' '}
          <a href="/contact" className="text-indigo-600 dark:text-indigo-400 underline">
            Contact page
          </a>{' '}
          or the WhatsApp support button when available. Please do not send full card numbers or
          online banking passwords.
        </p>
      </LegalSection>

      <LegalSection title="5. Review process">
        <p>
          We aim to review refund requests within <strong>5 business days</strong>. We may ask for
          additional information or verification from the payment provider. Where a refund is
          approved, we will notify you by email and process the refund through the original payment
          method. Bank slip refunds may require bank details for a transfer.
        </p>
      </LegalSection>

      <LegalSection title="6. Refund timelines">
        <p>
          Once approved, refunds are typically initiated within{' '}
          <strong>7&ndash;14 business days</strong>. The time taken for the funds to appear in your
          account depends on your bank or payment provider:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>PayHere / card payments:</strong> usually 7&ndash;14 business days after the
            refund is initiated, depending on the issuing bank.
          </li>
          <li>
            <strong>Paddle / international cards:</strong> processed by Paddle according to their
            refund timelines and your card provider.
          </li>
          <li>
            <strong>Bank slip payments:</strong> 7&ndash;14 business days after approval, subject to
            bank processing and any verification required.
          </li>
        </ul>
        <p>
          We cannot control delays caused by banks or payment providers once the refund has been
          submitted.
        </p>
      </LegalSection>

      <LegalSection title="7. Chargebacks and payment disputes">
        <p>
          Please contact us before raising a chargeback or payment dispute. We can usually resolve
          access or duplicate-payment issues faster directly. If you initiate a chargeback, we may
          suspend paid access while the dispute is investigated and provide evidence to the payment
          provider. Fraudulent or abusive chargebacks may result in account termination.
        </p>
      </LegalSection>

      <LegalSection title="8. Failed or pending payments">
        <p>
          If a payment fails but an amount appears as pending or deducted, your bank or payment
          provider may hold it temporarily. Please check with them first. If the payment does not
          appear in your MadeiApp account and the provider confirms it was captured, contact us with
          the transaction reference and we will investigate. Duplicate captured payments are refunded
          in full once verified.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For refund questions, email{' '}
          <a href="mailto:support@madeiapp.com" className="text-indigo-600 dark:text-indigo-400 underline">
            support@madeiapp.com
          </a>{' '}
          with the details above. We aim to respond within one business day (Monday to Saturday,
          Sri Lanka time). This policy may be updated from time to time; the latest version will
          always be available on this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
