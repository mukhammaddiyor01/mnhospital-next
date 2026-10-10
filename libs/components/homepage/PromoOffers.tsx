import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GET_PUBLIC_PROMO_OFFERS } from "@/apollo/promotion/operations";
import { usePreferences } from "../preference/PreferenceProvider";
import { formatMoney } from "../common/currency";
import Icon from "../common/Icon";
import styles from "./PromoOffers.module.scss";

export type PublicPromoOffer = {
  _id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  currency: string;
  minSubtotal: number;
  serviceIds: string[];
  expiresAt?: string;
};
const copy = {
  EN: {
    title: "Booking offers",
    discount: "off your booking",
    code: "Promo code",
    copy: "Copy code",
    copied: "Code copied",
    failed: "Select and copy the code above.",
    services: "View eligible service",
    all: "Explore services",
    scope: "Selected services only",
    minimum: "Minimum eligible amount",
    expires: "Valid until",
    help: "Enter this code before payment.",
    terms: "Offer details",
    cap: "One code per booking. Discount cannot exceed the eligible amount.",
  },
  UZ: {
    title: "Booking uchun takliflar",
    discount: "qabul uchun chegirma",
    code: "Promo-kod",
    copy: "Kodni nusxalash",
    copied: "Kod nusxalandi",
    failed: "Yuqoridagi kodni belgilab nusxalang.",
    services: "Mos xizmatni ko‘rish",
    all: "Xizmatlarni ko‘rish",
    scope: "Faqat tanlangan xizmatlar",
    minimum: "Eng kam mos xizmatlar summasi",
    expires: "Amal qilish muddati",
    help: "To‘lovdan oldin ushbu kodni kiriting.",
    terms: "Taklif shartlari",
    cap: "Har bir buyurtmaga bitta kod. Chegirma mos xizmat summasidan oshmaydi.",
  },
  KR: {
    title: "예약 프로모션",
    discount: "예약 할인",
    code: "프로모션 코드",
    copy: "코드 복사",
    copied: "코드가 복사되었습니다",
    failed: "위의 코드를 선택하여 복사하세요.",
    services: "대상 서비스 보기",
    all: "서비스 둘러보기",
    scope: "선택한 서비스에만 적용",
    minimum: "최소 대상 금액",
    expires: "유효 기한",
    help: "결제 전에 이 코드를 입력하세요.",
    terms: "프로모션 상세",
    cap: "예약당 코드 하나를 사용할 수 있습니다. 할인은 대상 금액을 초과하지 않습니다.",
  },
};
export function PromoOfferCard({ offer }: { offer: PublicPromoOffer }) {
  const { language } = usePreferences(),
    text = copy[language];
  const [feedback, setFeedback] = useState<"" | "copied" | "failed">("");
  const locale =
    language === "KR" ? "ko-KR" : language === "UZ" ? "uz-UZ" : "en-US";
  return (
    <article className={styles.offer}>
      <div className={styles.value}>
        <span className={styles.icon}>
          <Icon name="local_offer" />
        </span>
        <div>
          <h3>
            {offer.discountType === "PERCENT"
              ? `${offer.discountValue}%`
              : formatMoney(offer.discountValue, offer.currency)}{" "}
            <span>{text.discount}</span>
          </h3>
          <p>{text.help}</p>
        </div>
      </div>
      <div className={styles.code}>
        <span>{text.code}</span>
        <button
          type="button"
          aria-label={`${text.copy}: ${offer.code}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(offer.code);
              setFeedback("copied");
            } catch {
              setFeedback("failed");
            }
          }}
        >
          <code>{offer.code}</code>
          <Icon name={feedback === "copied" ? "check" : "content_copy"} />
          <span>{feedback === "copied" ? text.copied : text.copy}</span>
        </button>
        <span className={feedback === "failed" ? styles.feedback : styles.srOnly} role="status">
          {feedback === "failed" ? text.failed : feedback === "copied" ? text.copied : ""}
        </span>
      </div>
      <Link
        className={styles.link}
        href={
          offer.serviceIds.length
            ? `/service/${offer.serviceIds[0]}`
            : "/service"
        }
      >
        {offer.serviceIds.length ? text.services : text.all}
        <Icon name="arrow_forward" />
      </Link>
      <details className={styles.terms}>
        <summary>{text.terms}</summary>
        <ul>
          {offer.minSubtotal > 0 && (
            <li>
              {text.minimum}: {formatMoney(offer.minSubtotal, offer.currency)}
            </li>
          )}
          {offer.serviceIds.length > 0 && (
            <li>
              {text.scope} ({offer.serviceIds.length})
            </li>
          )}
          {offer.expiresAt && (
            <li>
              {text.expires}:{" "}
              <time dateTime={offer.expiresAt}>
                {new Intl.DateTimeFormat(locale, language === "UZ" ? {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"} : {dateStyle: "medium", timeStyle: "short"}).format(new Date(offer.expiresAt))}
              </time>
            </li>
          )}
          <li>{text.cap}</li>
        </ul>
      </details>
    </article>
  );
}
export default function PromoOffers() {
  const { language } = usePreferences();
  const { data, error } = useQuery<{
    getPublicPromoOffers: PublicPromoOffer[];
  }>(GET_PUBLIC_PROMO_OFFERS, {
    fetchPolicy: "network-only",
    pollInterval: 60000,
  });
  const [now, setNow] = useState(() => Date.now());
  const nextExpiry = Math.min(
    ...(data?.getPublicPromoOffers ?? [])
      .map((offer) =>
        offer.expiresAt ? new Date(offer.expiresAt).getTime() : Infinity,
      )
      .filter((time) => time > now),
  );
  // Expire cards without recurring renders, including when the page is offline.
  useEffect(() => {
    if (!Number.isFinite(nextExpiry)) return;
    const tick = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(Math.max(0, nextExpiry - Date.now()) + 1, 2147483647),
    );
    return () => window.clearTimeout(tick);
  }, [nextExpiry, now]);
  const offers = (error ? [] : (data?.getPublicPromoOffers ?? [])).filter(
    (offer) => !offer.expiresAt || new Date(offer.expiresAt).getTime() > now,
  );
  if (!offers.length) return null;
  return (
    <div className={styles.section} aria-label={copy[language].title}>
      {offers.map((offer) => (
        <PromoOfferCard key={offer._id} offer={offer} />
      ))}
    </div>
  );
}
