import type { SwiperModule } from "swiper/types";
import { effectVirtualTransitionEnd } from "swiper/effect-utils";

type MotionSlide = HTMLElement & {
  progress: number;
  swiperSlideOffset: number;
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Layered image movement adapted from the supplied Super Flow reference. */
export const SuperFlow: SwiperModule = ({ swiper, on }) => {
  on("beforeInit", () => {
    Object.assign(swiper.params, {
      virtualTranslate: true,
      watchSlidesProgress: true,
    });
    Object.assign(swiper.originalParams, {
      virtualTranslate: true,
      watchSlidesProgress: true,
    });
  });
  on("setTranslate", () => {
    (swiper.slides as MotionSlide[]).forEach((slide, index) => {
      const progress = slide.progress || 0;
      const distance = clamp(Math.abs(progress));
      const incoming = progress <= 0;
      const x = incoming
        ? swiper.size * progress + swiper.translate
        : swiper.translate - swiper.size * distance * 0.09;
      slide.style.transform = `translate3d(${x}px,0,0)`;
      slide.style.zIndex = String(swiper.slides.length - index);
      const image = slide.querySelector<HTMLElement>("[data-flow-main]");
      if (image)
        image.style.transform = `scale(${incoming ? 1.1 - 0.1 * distance : 1.1}) translateX(${incoming ? 20 * distance : 0}%)`;
      slide
        .querySelectorAll<HTMLElement>("[data-flow-fragment]")
        .forEach((fragment) => {
          const level = Number(fragment.dataset.flowFragment);
          fragment.style.transform = `translateX(${incoming ? (30 - level * 10) * distance : 5 * distance}%) scale(${incoming ? 1 : 0.95})`;
        });
    });
  });
  on("setTransition", (_instance, duration) => {
    for (const slide of swiper.slides) {
      [
        slide,
        ...slide.querySelectorAll<HTMLElement>(
          "[data-flow-main], [data-flow-fragment]",
        ),
      ].forEach((element) => {
        element.style.transitionDuration = `${duration}ms`;
      });
    }
    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements: swiper.slides,
      allSlides: true,
    });
  });
};

/** Horizontal Material layout: a full portrait with progressively clipped neighbours. */
export const MaterialPortraits: SwiperModule = ({ swiper, on }) => {
  on("beforeInit", () => {
    Object.assign(swiper.params, {
      virtualTranslate: true,
      watchSlidesProgress: true,
    });
    Object.assign(swiper.originalParams, {
      virtualTranslate: true,
      watchSlidesProgress: true,
    });
  });
  on("setTranslate", () => {
    const count = Number(swiper.params.slidesPerView);
    const spacing = Number(swiper.params.spaceBetween);
    (swiper.slides as MotionSlide[]).forEach((slide, index) => {
      const wrapper = slide.querySelector<HTMLElement>(
        "[data-material-portrait]",
      );
      if (!wrapper) return;
      const width = swiper.slidesSizesGrid[index] || 1;
      const gap = spacing / width;
      const progress = -slide.progress || 0;
      let scale = 1 + progress;
      let x = -slide.swiperSlideOffset;
      if (count === 1 && progress > 0) {
        scale = 1 - progress;
        x += swiper.size * Math.min(progress, 1);
      } else if (count > 1 && progress > 0) {
        x = swiper.translate;
        if (progress <= count - 2) scale = 1;
        else if (progress <= count - 1)
          scale = 0.65 - gap + (0.35 + gap * 2) * (count - 1 - progress);
        else if (progress <= count) {
          const remaining = count - progress;
          scale = 0.35 - gap + 0.3 * remaining;
          x -= width * (0.35 + gap) * (1 - remaining);
        } else {
          const remaining = clamp(count + 1 - progress);
          scale = (0.35 - gap) * remaining;
          x =
            -slide.swiperSlideOffset +
            swiper.size -
            remaining * (0.35 + gap) * width +
            remaining * spacing;
        }
      }
      wrapper.style.width = `${Math.max(0.0001, clamp(scale)) * 100}%`;
      wrapper.style.transform = `translate3d(${x}px,0,0)`;
      wrapper.style.setProperty(
        "--portrait-opacity",
        String(Math.max(0.12, clamp(scale) ** 4)),
      );
    });
  });
  on("setTransition", (_instance, duration) => {
    const elements = swiper.slides.flatMap((slide) => [
      ...slide.querySelectorAll<HTMLElement>("[data-material-portrait]"),
    ]);
    elements.forEach((element) => {
      element.style.transitionDuration = `${duration}ms`;
    });
    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements: elements,
      allSlides: true,
    });
  });
};
