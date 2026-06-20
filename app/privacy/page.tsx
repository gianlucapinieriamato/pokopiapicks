import type { Metadata } from "next";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/app/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME} (${SITE_URL}).`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <PageWrap>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />
      <div className="max-w-[720px] mx-auto prose prose-sm prose-neutral">
        <h1 className="font-outfit font-extrabold text-[28px] tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-ink-soft text-[13px] mb-8">
          Last updated: June 20, 2026
        </p>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">Overview</h2>
          <p className="text-[14px] text-ink leading-relaxed">
            Pokopia Picks (<strong>pokopiapicks.com</strong>) is a free,
            fan-made reference site for the Nintendo Switch 2 game{" "}
            <em>Pokemon Pokopia</em>. We do not sell your data, create accounts,
            or collect any personally identifiable information directly. This
            page explains what third-party services we use and how they handle
            data on our behalf.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">
            Information we collect
          </h2>
          <p className="text-[14px] text-ink leading-relaxed">
            We do not collect names, email addresses, or any form of account
            data. We have no login system and no user database. The only data
            processed is standard web analytics and advertising data, handled by
            the third-party services below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">
            Google Analytics
          </h2>
          <p className="text-[14px] text-ink leading-relaxed">
            We use Google Analytics (GA4) to understand how visitors use the
            site — which pages are visited, how long sessions last, and which
            countries visitors come from. This data is aggregated and
            anonymized. Google Analytics sets cookies in your browser to track
            sessions. You can opt out via the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            . For more information, see{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">
            Google AdSense
          </h2>
          <p className="text-[14px] text-ink leading-relaxed">
            We use Google AdSense to display advertisements. Google and its
            partners may use cookies and web beacons to serve ads based on your
            prior visits to this site and other sites. Google&apos;s use of
            advertising cookies enables it and its partners to serve ads based
            on your visit here and/or other sites on the Internet. You may opt
            out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              Google Ads Settings
            </a>
            . Third-party vendors, including Google, use cookies to serve ads
            based on a user&apos;s prior visits to this website or other
            websites. For more information, see{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              Google&apos;s advertising policies
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">Cookies</h2>
          <p className="text-[14px] text-ink leading-relaxed">
            Cookies are small text files stored in your browser. We do not set
            any first-party cookies ourselves. Cookies on this site are set
            exclusively by Google Analytics and Google AdSense for the purposes
            described above. You can control or delete cookies at any time
            through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">
            Links to other sites
          </h2>
          <p className="text-[14px] text-ink leading-relaxed">
            This site contains links to external services, including Google
            (for analytics and advertising opt-out tools) and Ko-fi (for
            optional donations). We are not responsible for the privacy
            practices of those services and encourage you to review their
            respective privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">
            Children&apos;s privacy
          </h2>
          <p className="text-[14px] text-ink leading-relaxed">
            Pokopia Picks does not knowingly collect any personal information
            from children under 13. The site does not require registration or
            any form of personal data to use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">Contact</h2>
          <p className="text-[14px] text-ink leading-relaxed">
            If you have questions about this privacy policy,{" "}
            <a
              href="https://forms.gle/4uJkvp1R5xKgd7MU6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              submit a message here
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-outfit font-bold text-[18px] mb-3">Changes</h2>
          <p className="text-[14px] text-ink leading-relaxed">
            We may update this privacy policy from time to time. Changes will be
            noted by updating the &quot;last updated&quot; date at the top of
            this page.
          </p>
        </section>
      </div>
    </PageWrap>
  );
}
