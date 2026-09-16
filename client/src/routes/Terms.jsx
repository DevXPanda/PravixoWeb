import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Calendar, ShieldCheck, Gift, CheckCircle2 } from "lucide-react";

export function Terms() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Legal & Compliance
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            Terms & <span className="text-gradient-sunset">Conditions</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" /> Last Updated: September 16, 2026
          </p>
        </div>

        {/* TERMS CONTENT */}
        <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-md space-y-10 text-foreground text-xs sm:text-sm leading-relaxed">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              1. Platform Overview & User Agreement
            </h2>
            <p className="text-muted-foreground">
              Welcome to Pravixo. By accessing or using our marketplace platform, whether as a Creator or a Brand, you agree to be bound by these Terms & Conditions. Pravixo acts as a marketplace facilitator connecting Brands and Creators for marketing campaigns, influencer collaborations, and creative deliverables.
            </p>
          </section>

          {/* Section 2: Creator & Brand Responsibilities */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold">2. User Roles & Collaboration Integrity</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Creators:</strong> Creators agree to submit authentic channel statistics, fulfill agreed campaign deliverables in accordance with approved briefs, maintain original copyright or proper licensing, and communicate professionally. Artificially inflating metrics via bots, pods, or fraudulent tools is strictly prohibited.
              </p>
              <p>
                <strong>Brands:</strong> Brands agree to provide clear campaign briefs, honor agreed milestone compensation, fund campaign escrow accounts prior to work commencement, and cooperate reasonably on platform-native collaboration features.
              </p>
            </div>
          </section>

          {/* Section 3: Escrow Payments & Payouts */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold">3. Payments, Escrow & Settlements</h2>
            <p className="text-muted-foreground">
              All campaign payments are held securely in escrow until campaign milestones are verified and completed. Upon approval, funds are released according to platform schedules. Standard platform commission fees and applicable taxes are accounted for during checkout and payout processing.
            </p>
          </section>

          {/* Section 4: REFER & EARN PROGRAM (TARGET ANCHOR: #refer-and-earn) */}
          <section
            id="refer-and-earn"
            className="space-y-5 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 sm:p-7 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-primary/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-foreground">
                  4. Refer & Earn Program
                </h2>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Official Referral Terms & Policies
                </span>
              </div>
            </div>

            <ol className="space-y-3.5 pl-1 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>1. Eligibility & Participation:</strong> Users (&ldquo;Brands&rdquo; and &ldquo;Creators&rdquo;) may refer other Brands or Creators to the platform using their unique referral code/link.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>2. Creator Referral Commission:</strong> If a Creator was referred by another user (Brand or Creator), the referring user (&ldquo;Referrer&rdquo;) will earn a commission equal to <strong>5%</strong> of the payment received by the referred Creator for each successfully completed project, credited automatically to the Referrer&apos;s wallet at the time the payment is processed. This applies to Brand-to-Brand referrals under the same 5% recurring model where applicable.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>3. Duration & No Cap:</strong> This commission applies for as long as the referral relationship remains active, which is indefinite unless the relationship is manually revoked by the Company (e.g. for fraud or abuse). There is no cap on the total commission a Referrer may earn from a single referred user.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>4. Deduction from Creator&apos;s Earnings:</strong> The referral commission is deducted from the Creator&apos;s own earnings for the completed project, and is clearly disclosed in the payment breakdown shown to the Creator at the time of payout.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>5. Anti-Abuse & Revocation:</strong> The Company reserves the right to revoke referral commissions, suspend accounts, or claw back paid commissions in cases of fraud, self-referral, circular referrals, or abuse of the program.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>6. Payment Reversals & Refunds:</strong> In case of a refund, chargeback, or reversal of the original project payment, any referral commission already paid on that transaction will be reversed.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>7. Program Modifications:</strong> The Company may modify, suspend, or terminate the Refer & Earn program at any time, with reasonable notice to active participants.
                </span>
              </li>
            </ol>
          </section>

          {/* Section 5: Dispute Resolution */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold">5. Disputes & Non-Circumvention</h2>
            <p className="text-muted-foreground">
              Users shall not bypass or attempt to bypass the platform by directly negotiating or conducting outside transactions with contacts made through Pravixo to avoid platform processes, obligations, or fees. Any circular transaction or circumvention attempt will result in immediate account suspension and revocation of accrued balances.
            </p>
          </section>

          {/* Section 6: Governing Law */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold">6. Governing Law & Jurisdiction</h2>
            <p className="text-muted-foreground">
              These Terms and Conditions are governed by the laws of India, and any disputes arising shall be subject to the exclusive jurisdiction of the competent courts located in Noida, Uttar Pradesh, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
