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
  const title = service.serviceTitle || service.serviceName;
  const image = resolveApiAsset(service.serviceImages?.[0]);
  const href = `/service/${service._id}`;
  const count = (value?: number) =>
    new Intl.NumberFormat(
      language === "KR" ? "ko-KR" : language === "UZ" ? "uz-UZ" : "en-US",
    ).format(Math.max(0, Number.isFinite(value) ? value! : 0));
  return (
    <article className={styles.card}>
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
      <div className={styles.body}>
        <p className={styles.specialty}>{typeLabel(service.serviceType)}</p>
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        {service.serviceDesc && (
          <p className={serviceStyles.description}>{service.serviceDesc}</p>
        )}
        <p className={serviceStyles.price}>
          {t("services.from").replace(
            "{price}",
            formatMoney(service.servicePrice, currency),
          )}
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>
              <Icon name="visibility" />
              {labels.views}
            </dt>
            <dd>{count(service.serviceViews)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="favorite" />
              {labels.likes}
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
          {t("services.explore")}
          <Icon name="arrow_forward" />
        </Link>
      </div>
    </article>
  );
}
