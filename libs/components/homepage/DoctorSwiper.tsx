import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { resolveApiAsset } from "@/libs/config";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useDoctorSpecialtyLabel } from "@/libs/i18n/useDoctorSpecialtyLabel";
import type { ClinicalDoctorCard } from "./types/clinical-home";
import { MaterialPortraits } from "./motionEffects";
import { useReducedMotion } from "./useReducedMotion";
import styles from "./HomepageCarousels.module.scss";

export default function DoctorSwiper({
  doctors,
}: {
  doctors: ClinicalDoctorCard[];
}) {
  const t = useTranslation();
  const specialty = useDoctorSpecialtyLabel();
  const reduced = useReducedMotion();
  const slider = useRef<SwiperInstance | null>(null);
  const select = (index: number) => {
    if (slider.current?.params.loop) slider.current.slideToLoop(index);
    else slider.current?.slideTo(index);
  };
  return (
    <Swiper
      key={`${doctors.length}-${reduced}`}
      className={styles.doctors}
      modules={[MaterialPortraits, A11y, Keyboard, Navigation, Pagination]}
      onSwiper={(swiper) => {
        slider.current = swiper;
      }}
      slidesPerView={1}
      spaceBetween={16}
      breakpointsBase="container"
      breakpoints={{ 480: { slidesPerView: doctors.length < 4 ? 1 : 2 } }}
      speed={reduced ? 0 : 600}
      grabCursor
      loop={doctors.length >= 4}
      rewind={doctors.length < 4}
      watchOverflow
      navigation={doctors.length > 1}
      pagination={{ clickable: true }}
      keyboard={{ enabled: true, onlyInViewport: true }}
      aria-label={t("home.doctors.title")}
    >
      {doctors.map((doctor, index) => (
        <SwiperSlide key={doctor._id} onFocusCapture={() => select(index)}>
          <article data-material-portrait className={styles.portrait}>
            <button
              type="button"
              className={styles.portraitSelect}
              onClick={() => select(index)}
              aria-label={doctor.docFullName}
            >
              <span className={styles.initials}>
                {doctor.docFullName
                  ?.split(" ")
                  .filter(Boolean)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              {doctor.docImage && (
                <img
                  src={resolveApiAsset(doctor.docImage)}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              )}
            </button>
            <div className={styles.doctorCopy}>
              <span>{specialty(doctor.docSpecialty)}</span>
              <h3>
                <Link href={`/doctor/${doctor._id}`}>{doctor.docFullName}</Link>
              </h3>
              <p>
                {Number(doctor.docExperience ?? 0)} {t("home.doctor.years")}
              </p>
              <Link
                className={styles.book}
                href={`/appointment?doctor=${doctor._id}`}
              >
                {t("home.doctor.book")}
              </Link>
            </div>
          </article>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
