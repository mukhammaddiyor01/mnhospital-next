import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { usePreferences } from "@/libs/components/preference/PreferenceProvider";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { SuperFlow } from "./motionEffects";
import { useReducedMotion } from "./useReducedMotion";
import styles from "./HomepageCarousels.module.scss";

export const heroSlides = [
  {
    image: "/img/hospital-care-1.png",
    alt: "home.slide1.alt",
    title: "home.slide1.title",
    description: "home.slide1.description",
  },
  {
    image: "/img/hospital-care-2.png",
    alt: "home.slide2.alt",
    title: "home.slide2.title",
    description: "home.slide2.description",
  },
  {
    image: "/img/hospital-care-3.png",
    alt: "home.slide3.alt",
    title: "home.slide3.title",
    description: "home.slide3.description",
  },
] as const;

export default function HeroSwiper({
  onSlideChange,
  onReady,
}: {
  onSlideChange: Dispatch<SetStateAction<number>>;
  onReady: (swiper: SwiperInstance) => void;
}) {
  const t = useTranslation();
  const reduced = useReducedMotion();
  const { language } = usePreferences();
  const slider = useRef<SwiperInstance | null>(null);
  const [paused, setPaused] = useState(false);
  const labels = {
    EN: ["Pause slideshow", "Play slideshow"],
    KR: ["슬라이드 일시 정지", "슬라이드 재생"],
    UZ: ["Slayderni pauza qilish", "Slayderni davom ettirish"],
  }[language];
  return (
    <Swiper
      key={String(reduced)}
      className={`${styles.hero} ${paused ? styles.paused : ""}`}
      modules={[SuperFlow, Autoplay, A11y, Keyboard]}
      slidesPerView={1}
      speed={reduced ? 0 : 1000}
      rewind
      grabCursor
      keyboard={{ enabled: true, onlyInViewport: true }}
      autoplay={
        reduced || paused
          ? false
          : {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
      }
      onSwiper={(swiper) => {
        slider.current = swiper;
        onReady(swiper);
        onSlideChange(swiper.realIndex);
      }}
      onSlideChange={(swiper) => onSlideChange(swiper.realIndex)}
      aria-label={t("home.highlights")}
    >
      {heroSlides.map((slide, index) => (
        <SwiperSlide key={slide.image}>
          <div data-flow-main className={styles.flowMain}>
            <Image
              src={slide.image}
              alt={t(slide.alt)}
              fill
              priority={index === 0}
              sizes="(max-width: 680px) 100vw, 900px"
            />
          </div>
          {[0, 1, 2].map((level) => (
            <div
              key={level}
              data-flow-fragment={level}
              className={`${styles.fragment} ${styles[`fragment${level}`]}`}
              aria-hidden="true"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="(max-width: 680px) 100vw, 900px"
              />
            </div>
          ))}
        </SwiperSlide>
      ))}
      {!reduced && (
        <button
          slot="container-end"
          className={styles.pause}
          type="button"
          aria-label={labels[paused ? 1 : 0]}
          onClick={() => {
            if (paused) slider.current?.autoplay.start();
            else slider.current?.autoplay.stop();
            setPaused(!paused);
          }}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      )}
    </Swiper>
  );
}
