import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { resolveApiAsset } from "@/libs/config";
import MnLogo from "./common/MnLogo";
import ThemeControl from "./preference/ThemeControl";
import LanguageControl from "./preference/LanguageControl";
import { useTranslation } from "@/libs/i18n/useTranslation";

const Top = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const t = useTranslation();
  const isHome = router.pathname === "/";

  const searchHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "globalSearch",
    ) as HTMLInputElement;
    void router.push(
      input.value.trim()
        ? `/doctor?search=${encodeURIComponent(input.value.trim())}`
        : "/doctor",
    );
  };
  const initials =
    user.memberFullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) ||
    user.memberNick?.slice(0, 2).toUpperCase() ||
    "MN";

  return (
    <header className={`clinical-header ${isHome ? "has-search" : ""}`}>
      <div className="clinical-header-inner">
        <MnLogo />
        <nav className="clinical-desktop-navigation" aria-label={t('nav.primary')}>
          {([
            ['/', 'nav.home'],
            ['/service', 'nav.services'],
            ['/doctor', 'nav.doctors'],
            ['/article', 'nav.articles'],
          ] as const).map(([href, label]) => {
            const active = href === '/' ? isHome : router.pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>{t(label)}</Link>;
          })}
        </nav>
        {isHome ? (
          <form className="clinical-header-search" onSubmit={searchHandler}>
            <span className="clinical-search-mark material-symbols-rounded" aria-hidden="true">search</span>
            <input
              name="globalSearch"
              placeholder={t('nav.searchPlaceholder')}
              aria-label={t('nav.searchPlaceholder')}
            />
          </form>
        ) : null}
        <div className="clinical-header-actions">
          <ThemeControl />
          <LanguageControl />
          <Link className="clinical-book-top" href="/appointment">
            {t('nav.book')}
          </Link>
          {user._id ? (
            <Link
              className="clinical-profile"
              href="/mypage"
              aria-label={t('nav.profile')}
              title={t('page.profile')}
              style={
                user.memberImage
                  ? {
                      backgroundImage: `url(${resolveApiAsset(user.memberImage)})`,
                    }
                  : undefined
              }
            >
              <span>{initials}</span>
            </Link>
          ) : (
            <Link className="clinical-signup-top" href="/account/join" aria-label={t('nav.signup')}>
              <span className="clinical-signup-top-text">{t('nav.signup')}</span>
              <span className="clinical-signup-top-icon material-symbols-rounded" aria-hidden="true">person_add</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Top;
