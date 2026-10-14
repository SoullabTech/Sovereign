import Link from 'next/link';
import { ArrowUpRight, Gift, BookHeart, ScrollText, Sparkles } from 'lucide-react';
import styles from './astrology-pro-preview.module.css';

/**
 * ASTRO-PORTRAIT-GIFTS-01 — source-reuse entry points, not a new gift/send service.
 *
 * This surface sends NO email, creates NO portrait or recipient record, reads NO
 * member chart, tracks NO recipient, and modifies NO delivered gift page.
 *
 * Existing owner-scoped generator and library routes still enforce their own
 * session, subject consent and send policies. Guest gift-credit redemption and
 * practitioner/public attribution are proposed separately, NOT live here.
 */
export function SoulPortraitGifting() {
  return (
    <section className={styles.giftOffering} aria-labelledby="astro-gift-title" id="soul-portrait-gifts">
      <div className={styles.giftHeader}>
        <span className={styles.giftSymbol} aria-hidden="true"><Gift size={27} /></span>
        <div>
          <p className={styles.eyebrow}>SOUL PORTRAIT · THE ART OF OFFERING</p>
          <h2 id="astro-gift-title">Give someone a world to explore.</h2>
          <p>
            A Soul Portrait is an invitation to recognize possibility, not a prediction of
            who someone must become. You can offer a portrait with care, and they are free
            to keep, question, set aside, or simply enjoy it.
          </p>
        </div>
      </div>

      <div className={styles.giftOptions}>
        <article className={styles.giftOption}>
          <div className={styles.giftOptionIcon}><BookHeart size={23} aria-hidden="true" /></div>
          <p className={styles.giftOptionStatus}>AVAILABLE IN EXISTING SOUL PORTRAIT STUDIO</p>
          <h3>Create a portrait for someone</h3>
          <p>
            Prepare a private draft, review it in your own time, and offer it to a consenting
            adult through an unlisted link. They need no account to read the finished gift.
          </p>
          <Link href="/soul-portrait/generate" className={styles.giftAction}>
            Create a Soul Portrait <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </article>

        <article className={styles.giftOption}>
          <div className={styles.giftOptionIcon}><ScrollText size={23} aria-hidden="true" /></div>
          <p className={styles.giftOptionStatus}>CONTINUE AN EXISTING PORTRAIT</p>
          <h3>Your portraits and gifts</h3>
          <p>
            Return to a saved draft, review what you have made, and prepare a recipient
            link only after the subject has agreed to receive it.
          </p>
          <Link href="/studio/soul-portraits" className={styles.giftAction}>
            Open my portraits <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </article>

        <article className={[styles.giftOption,styles.giftFuture].join(' ')}>
          <div className={styles.giftOptionIcon}><Sparkles size={23} aria-hidden="true" /></div>
          <p className={styles.giftOptionStatus}>PLANNED · NOT YET AVAILABLE</p>
          <h3>Give an invitation, not a reading</h3>
          <p>
            A future gift credit can let someone choose to create their own portrait,
            entering their details themselves. Their experience remains theirs, with
            an optional acknowledgment of who offered it.
          </p>
        </article>
      </div>

      <p className={styles.giftPrinciple}>
        <strong>A portrait may be given. A relationship must be chosen.</strong>
        {' '}Gifts remain complete without joining Soullab. Any acknowledgment of
        the giver or an astrologer&rsquo;s practice will be separate, optional,
        and never depend on exposing the recipient&rsquo;s private chart.
      </p>
      <p className={styles.giftOperationalNote}>
        Adult consent is required before an existing portrait is sent. Minor/guardian
        gift delivery and new email transport remain separately held. Copy-link sharing
        is the supported fallback; this preview does not send mail or activate billing.
      </p>
    </section>
  );
}
