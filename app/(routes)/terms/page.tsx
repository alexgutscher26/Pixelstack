import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../_common/header";

export const metadata: Metadata = {
  title: "Terms of Service | Flowkit",
  description:
    "Read the terms governing your use of Flowkit. Includes acceptable use, subscriptions, limitations, and liability.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">
          These Terms of Service govern your use of Flowkit. By using Flowkit, you agree to these
          terms.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
          <p>
            By accessing or using Flowkit, you agree to be bound by these Terms. If you do not
            agree, do not use the service.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Use of Service</h2>
          <p>
            You may use Flowkit to generate and preview mobile design mockups. You are responsible
            for your content and maintaining compliance with applicable laws.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Accounts and Security</h2>
          <p>
            You must keep your account credentials secure. Report any unauthorized access
            immediately.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Subscriptions and Credits</h2>
          <p>
            Features may be subject to usage limits, credits, or subscriptions. Pricing and
            allowances may change; any changes will be communicated reasonably.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Intellectual Property</h2>
          <p>
            Flowkit’s software, branding, and content are protected. You retain rights to your
            project outputs, subject to third‑party assets you incorporate.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Acceptable Use</h2>
          <p>
            Do not misuse the service, attempt to circumvent limitations, or engage in prohibited or
            unlawful activities.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p>
            Flowkit is provided “as is” without warranties. We do not guarantee uninterrupted or
            error‑free operation.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Flowkit is not liable for indirect or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Termination</h2>
          <p>
            We may suspend or terminate access for violations of these Terms or to protect service
            integrity.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Changes to Terms</h2>
          <p>
            We may update these Terms periodically. Continued use after changes constitutes
            acceptance.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            For questions about these Terms, contact the Flowkit team via the feedback option in the
            app or the channels listed on our site.
          </p>
        </section>
      </main>
    </div>
  );
}
