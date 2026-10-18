import { Swiper, SwiperSlide } from "swiper/react";
import {
  A11y,
  EffectCoverflow,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules";
import { ArticleCard } from "@/libs/components/article/ArticleCard";
import type { Article } from "@/libs/components/article/types/article";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useReducedMotion } from "./useReducedMotion";
import styles from "./HomepageCarousels.module.scss";

export default function ArticleSwiper({ articles }: { articles: Article[] }) {
  const t = useTranslation();
  const reduced = useReducedMotion();
  return (
    <div className={styles.articles}>
      <Swiper
        key={`${articles.length}-${reduced}`}
        modules={[EffectCoverflow, A11y, Keyboard, Navigation, Pagination]}
        effect={reduced || articles.length < 2 ? "slide" : "coverflow"}
        centeredSlides={articles.length > 1}
        initialSlide={articles.length >= 3 ? 1 : 0}
        slidesPerView={articles.length === 1 ? 1 : 1.15}
        spaceBetween={16}
        breakpointsBase="container"
        breakpoints={{
          480: { slidesPerView: Math.min(1.8, articles.length) },
          760: { slidesPerView: Math.min(2.6, articles.length) },
        }}
        coverflowEffect={{
          rotate: 35,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: false,
        }}
        speed={reduced ? 0 : 650}
        grabCursor
        watchOverflow
        navigation={articles.length > 1}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        aria-label={t("home.articles.title")}
      >
        {articles.map((article) => (
          <SwiperSlide key={article._id}>
            <ArticleCard article={article} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
