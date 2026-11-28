import { catalogText } from '@/libs/i18n/catalog';
import { servicePriceForDisplay } from './service-price';
import cardInteraction from '@/libs/components/common/CardInteraction.module.scss';
import Link from "next/link";
import { useState } from "react";
import Icon from "@/libs/components/common/Icon";
import LikeButton from "@/libs/components/common/LikeButton";
import { LIKE_TARGET_SERVICE } from "@/apollo/service/mutation";
import { Service } from "./types/service";
import { resolveApiAsset } from "@/libs/config";
import { formatMoney } from "@/libs/components/common/currency";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useServiceTypeLabel } from "@/libs/i18n/useServiceTypeLabel";
import { usePreferences } from "@/libs/components/preference/PreferenceProvider";
import styles from "@/libs/components/common/DirectoryCard.module.scss";
import serviceStyles from "./ServiceDirectoryCard.module.scss";

type DirectoryService = Service & { meLiked?: Array<{ myFavorite?: boolean }> };

export default function ServiceDirectoryCard({
  service,
  currency,
}: {
  service: DirectoryService;
  currency: string;
}) {
  const t = useTranslation();
  const typeLabel = useServiceTypeLabel();
  const { language } = usePreferences();
  const labels = {
    EN: { views: "Views", likes: "Likes", photo: "Photo unavailable" },
    UZ: {
      views: "Ko‘rishlar",
      likes: "Yoqtirishlar",
      photo: "Rasm mavjud emas",
    },
    KR: { views: "조회", likes: "좋아요", photo: "사진 없음" },
  }[language];
  const [failedImage, setFailedImage] = useState("");
  const title = catalogText(service.serviceTitle || service.serviceName, language);
  const image = resolveApiAsset(service.serviceImages?.[0]);
  const href = `/service/${service._id}`;
  const count = (value?: number) =>
    new Intl.NumberFormat(
      language === "KR" ? "ko-KR" : language === "UZ" ? "uz-UZ" : "en-US",
    ).format(Math.max(0, Number.isFinite(value) ? value! : 0));
  return (
    <article className={`${styles.card} ${serviceStyles.card} ${cardInteraction.surface}`}>
      <Link
        className={`${styles.portrait} ${serviceStyles.image}`}
        href={href}
        aria-label={`${t("services.explore")}: ${title}`}
      >
        {image && image !== failedImage ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            width={480}
            height={420}
            onError={() => setFailedImage(image)}
          />
        ) : (
          <div className={styles.fallback}>
            <span aria-hidden="true">
              {title
                .split(/\s+/)
                .filter(Boolean)
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </span>
            <small>{labels.photo}</small>
          </div>
        )}
      </Link>
      <div className={`${styles.body} ${serviceStyles.body}`}>
        <p className={styles.specialty}>{typeLabel(service.serviceType)}</p>
        <h3>
          <Link className={cardInteraction.primaryLink} href={href}>{title}</Link>
        </h3>
        <div className={serviceStyles.metadata}>
          {service.memberData?.docFullName && <span><Icon name="stethoscope" />{service.memberData.docFullName}</span>}
          {service.serviceDuration && <span><Icon name="schedule" />{service.serviceDuration} {t("directory.minutes")}</span>}
        </div>
        {service.serviceDesc && (
          <p className={serviceStyles.description}>{catalogText(service.serviceDesc, language)}</p>
        )}
        <p className={serviceStyles.price}>
          {t("services.from").replace(
            "{price}",
            formatMoney(servicePriceForDisplay(service, currency), currency),
          )}
          {(service.serviceDiscountPercent ?? 0) > 0 && <small> <s>{formatMoney(service.servicePrice, currency)}</s> (−{service.serviceDiscountPercent}%)</small>}
        </p>
        <dl className={`${styles.stats} ${serviceStyles.stats}`}>
          <div>
            <dt>
              <Icon name="visibility" />
              <span className="sr-only">{labels.views}</span>
            </dt>
            <dd>{count(service.serviceViews)}</dd>
          </div>
          <div>
            <dt>
              <span className="sr-only">{labels.likes}</span>
            </dt>
            <dd className={serviceStyles.likes}>
              <span>{count(service.serviceLikes)}</span>
              <LikeButton
                mutation={LIKE_TARGET_SERVICE}
                id={service._id}
                variableName="serviceId"
                initialLiked={Boolean(service.meLiked?.[0]?.myFavorite)}
              />
            </dd>
          </div>
        </dl>
        <Link className={styles.book} href={href}>
          {t("services.explore").replace(/\s*→\s*$/, "")}
          <Icon name="arrow_forward" />
        </Link>
      </div>
    </article>
  );
}
