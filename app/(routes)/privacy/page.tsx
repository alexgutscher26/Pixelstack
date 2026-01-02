import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../_common/header";

export const metadata: Metadata = {
  title: "Privacy Policy | Flowkit",
  description:
    "Learn how Flowkit collects, uses, and protects your data. Read our privacy practices and your rights.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Your privacy is important to us. This policy explains what data we collect, how we use it,
          and your rights regarding that data.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>
            We may collect account information, usage data, project metadata, and feedback you
            choose to provide. We do not sell personal information.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">How We Use Your Data</h2>
          <p>
            We use data to provide and improve Flowkit, including authentication, generating and
            saving designs, performance monitoring, and customer support.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Cookies and Tracking</h2>
          <p>
            We use essential cookies for authentication and functionality. Optional analytics or
            performance tools may be used to improve product quality.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Third‑Party Services</h2>
          <p>
            Flowkit integrates with authentication and infrastructure providers. These services may
            process limited data to deliver their functionality securely.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We implement technical and organizational measures to protect data. No method of
            transmission or storage is 100% secure, but we strive to safeguard information.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your data, subject to applicable law.
            Contact us to exercise these rights.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            For privacy inquiries, contact the Flowkit team via the feedback option in the app or
            the communication channels listed on our site.
          </p>
        </section>

        <p className="text-muted-foreground mt-10 text-sm">
          This policy may change over time. We will update this page to reflect significant changes.
        </p>
      </main>
    </div>
  );
}
