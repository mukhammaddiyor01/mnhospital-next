import { UnreadLink } from './notification/UnreadBadge';
import Icon from './common/Icon';
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { resolveApiAsset } from "@/libs/config";
import MnLogo from "./common/MnLogo";
import AnimatedWave from "./common/AnimatedWave";
import ThemeControl from "./preference/ThemeControl";
import LanguageControl from "./preference/LanguageControl";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { MemberType } from "@/libs/components/member/enums/member.enum";

const Top = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const t = useTranslation();
  const workspace = user.memberType === MemberType.ADMIN ? '/admin' : user.memberType === MemberType.DOCTOR ? '/doctor-workspace' : user.memberType === MemberType.RECEPTIONIST ? '/receptionist-workspace' : '/mypage';
  const isHome = router.pathname === "/";
  const isStaffSignIn = ['/account/admin-signin', '/account/doctor-signin', '/account/receptionist-signin'].includes(router.pathname);

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
    <header className={`clinical-header ${isHome ? "has-search" : ""} ${user._id ? "has-inbox" : ""}`}>
      <div className="clinical-header-inner">
        <MnLogo />
        {isHome ? (
          <form className="clinical-header-search" onSubmit={searchHandler}>
            <img className="clinical-search-mark" src="/img/mn-logo-mark.png" alt="" width={24} height={20} />
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
          {user._id && <>
            <UnreadLink kind="messages" href={`${workspace}/messages`} label={t('messages.title')}><Icon name="mail" /></UnreadLink>
            <UnreadLink kind="notifications" href={`${workspace}/notifications`} label={t('notifications.title')}><Icon name="notifications" /></UnreadLink>
          </>}
          {user._id ? (
            <Link
              className="clinical-profile"
              href={user.memberType === MemberType.ADMIN ? '/mypage/dashboard' : user.memberType === MemberType.DOCTOR ? '/doctor-workspace/profile' : user.memberType === MemberType.RECEPTIONIST ? '/receptionist-workspace/profile' : '/mypage'}
              aria-label={t(user.memberType === MemberType.ADMIN ? 'dashboard.title' : 'nav.profile')}
              title={t(user.memberType === MemberType.ADMIN ? 'dashboard.title' : 'page.profile')}
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
          ) : !isStaffSignIn ? (
            <Link className="clinical-signup-top" href="/account/join" aria-label={t('nav.signup')}>
              <span className="clinical-signup-top-text">{t('nav.signup')}</span>
              <span className="clinical-signup-top-icon material-symbols-rounded" aria-hidden="true">person_add</span>
            </Link>
          ) : null}
        </div>
      </div>
      <AnimatedWave variant="header" />
    </header>
  );
};

export default Top;
