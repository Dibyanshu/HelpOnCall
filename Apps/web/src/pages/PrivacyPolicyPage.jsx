export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            At HelpOnCall, we are committed to protecting the privacy and dignity of our clients and
            staff. This policy outlines our practices regarding the collection, use, and safeguarding
            of your personal information when you interact with our platform or utilize our
            professional services.
          </p>
        </header>

        <Section title="Our Privacy Philosophy">
          <p>
            We believe that trust is the foundation of quality care. We handle all personal and
            professional data with the highest level of discretion, ensuring that we only gather
            information essential for delivering exceptional service and maintaining operational
            integrity.
          </p>
        </Section>

        <Section title="Scope of This Policy">
          <p>
            This policy applies to all data processed via the HelpOnCall website, digital forms,
            electronic communications, and offline interactions. It governs the information
            management for our clients seeking assistance, as well as the caregivers and
            professionals who join our network.
          </p>
        </Section>

        <Section title="Data We Collect">
          <p className="mb-3">
            To provide seamless support, we may process the following types of information:
          </p>
          <ul className="space-y-2">
            <PolicyItem label="Identification &amp; Contact" className="mt-3 h-1 w-1">
              Full name, residential address, email, and primary contact numbers.
            </PolicyItem>
            <PolicyItem label="Care Requirements">
              Relevant health summaries or specific needs required to coordinate effective support.
            </PolicyItem>
            <PolicyItem label="Professional Background">
              Employment history, certifications, and background checks for those applying to our
              team.
            </PolicyItem>
            <PolicyItem label="Financial Details">
              Necessary billing information and payment records for service transactions.
            </PolicyItem>
            <PolicyItem label="Digital Footprint">
              Technical data such as IP addresses, device types, and site navigation patterns.
            </PolicyItem>
          </ul>
        </Section>

        <Section title="Methods of Collection">
          <p className="mb-3">Information is gathered through several touchpoints:</p>
          <ol className="list-decimal space-y-2 pl-5 text-slate-700">
            <li>
              <span className="font-semibold text-slate-800">Direct Submission:</span> When you
              register an account, fill out service requests, or submit an application.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Active Communication:</span> Details
              shared during consultations via phone, video call, or email.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Automated Technologies:</span> The use
              of cookies and performance tools to optimize your experience on our website.
            </li>
          </ol>
        </Section>

        <Section title="How Your Information is Utilized">
          <p className="mb-3">We process your data specifically to:</p>
          <ul className="space-y-2">
            <PolicyItem>Deliver tailored home care and on-call staffing solutions.</PolicyItem>
            <PolicyItem>Verify the credentials of our service providers.</PolicyItem>
            <PolicyItem>Facilitate secure billing and administrative record-keeping.</PolicyItem>
            <PolicyItem>
              Enhance the functionality and security of the HelpOnCall platform.
            </PolicyItem>
          </ul>
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            <span className="font-semibold">Note:</span> We maintain a strict policy against the
            sale or unauthorized rental of your personal data to third-party marketers.
          </div>
        </Section>

        <Section title="Consent and Control">
          <p>
            By using our services, you acknowledge the collection and use of your data as described
            here. You retain the right to withdraw your consent at any time, subject to legal or
            contractual obligations, by notifying our privacy team.
          </p>
        </Section>

        <Section title="Disclosure of Information">
          <p className="mb-3">We only share information under specific circumstances:</p>
          <ul className="space-y-2">
            <PolicyItem label="Service Coordination">
              With your explicit permission to ensure care continuity.
            </PolicyItem>
            <PolicyItem label="Operational Support">
              With verified partners who assist in our business functions under strict
              confidentiality agreements.
            </PolicyItem>
            <PolicyItem label="Legal Compliance">
              When mandated by judicial orders or prevailing regulations.
            </PolicyItem>
          </ul>
        </Section>

        <Section title="Security Measures">
          <p>
            HelpOnCall employs robust physical and digital safeguards—including encrypted systems
            and restricted access protocols—to prevent unauthorized data breaches. We prioritize
            local data residency and ensure all storage practices align with national privacy
            standards.
          </p>
        </Section>

        <Section title="Retention and Disposal">
          <p>
            We hold personal records only for the duration required to fulfill our service
            commitments or satisfy legal auditing requirements. Once the retention period expires,
            data is permanently erased or destroyed using secure methods.
          </p>
        </Section>

        <Section title="Your Individual Rights">
          <p className="mb-3">
            You maintain full transparency over your data, including the right to:
          </p>
          <ul className="space-y-2">
            <PolicyItem>Review the personal information we have on file.</PolicyItem>
            <PolicyItem>Correct any inaccuracies or outdated details.</PolicyItem>
            <PolicyItem>
              Request the permanent deletion of your profile, where permitted by law.
            </PolicyItem>
          </ul>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="mt-3 text-base leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

function PolicyItem({ label, children }) {
  return (
    <li className="flex gap-2 text-slate-700">
      <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
      <span>
        {label ? <span className="font-semibold text-slate-800">{label}: </span> : null}
        {children}
      </span>
    </li>
  );
}
