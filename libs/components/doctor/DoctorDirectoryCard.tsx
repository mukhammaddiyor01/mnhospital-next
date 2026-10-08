import Link from "next/link";
import { useState } from "react";
import Icon from "@/libs/components/common/Icon";
import { resolveApiAsset } from "@/libs/config";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useDoctorSpecialtyLabel } from "@/libs/i18n/useDoctorSpecialtyLabel";
import { usePreferences } from "@/libs/components/preference/PreferenceProvider";
import { Doctor } from "./types/doctor";
import styles from "@/libs/components/common/DirectoryCard.module.scss";

export default function DoctorDirectoryCard({ doctor }: { doctor: Doctor }) {
  const t = useTranslation();
  const specialtyLabel = useDoctorSpecialtyLabel();
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
  const name =
    doctor.docFullName || doctor.docNick || t("doctors.nameFallback");
  const image = resolveApiAsset(doctor.docImage);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const count = (value?: number) =>
    new Intl.NumberFormat(
      language === "KR" ? "ko-KR" : language === "UZ" ? "uz-UZ" : "en-US",
    ).format(Math.max(0, Number.isFinite(value) ? value! : 0));
  return (
    <article className={styles.card}>
      <Link
        className={styles.portrait}
        href={`/doctor/${doctor._id}`}
        aria-label={`${t("doctors.viewProfile")} ${name}`}
      >
        {image && image !== failedImage ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            width={480}
            height={420}
            onError={() => setFailedImage(image)}
          />
        ) : (
          <div className={styles.fallback}>
            <span aria-hidden="true">{initials}</span>
            <small>{labels.photo}</small>
          </div>
        )}
      </Link>
      <div className={styles.body}>
        <p className={styles.specialty}>
          {specialtyLabel(doctor.docSpecialty)}
        </p>
        <h3>
          <Link href={`/doctor/${doctor._id}`}>{name}</Link>
        </h3>
        <p className={styles.experience}>
          <Icon name="stethoscope" />
          {count(doctor.docExperience)} {t("doctors.experience")}
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>
              <Icon name="visibility" />
              {labels.views}
            </dt>
            <dd>{count(doctor.docViews)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="favorite" />
              {labels.likes}
            </dt>
            <dd>{count(doctor.docLikes)}</dd>
          </div>
        </dl>
        <Link
          className={styles.book}
          href={`/appointment?doctor=${doctor._id}`}
        >
          {t("doctors.book")}
          <Icon name="calendar_month" />
        </Link>
      </div>
    </article>
  );
}
