import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { logIn, signUp } from "@/libs/auth";
import Icon from "@/libs/components/common/Icon";
import SocialAuthButtons from "./SocialAuthButtons";
import { useTranslation } from "@/libs/i18n/useTranslation";

type AuthMode = "login" | "register";

const AuthPortal = ({ initialMode }: { initialMode: AuthMode }) => {
  const t = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [transitionMode, setTransitionMode] = useState<AuthMode | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    memberNick: "",
    memberPassword: "",
  });
  const [registerForm, setRegisterForm] = useState({
    memberFullName: "",
    memberNick: "",
    memberPhone: "",
    memberPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setMode(initialMode);
    setTransitionMode(null);
    setError("");
  }, [initialMode]);

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    setError("");
    setTransitionMode(nextMode);
    setMode(nextMode);
  };
  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await logIn(loginForm.memberNick, loginForm.memberPassword);
      const destination =
        typeof router.query.redirect === "string" &&
        router.query.redirect.startsWith("/") &&
        !router.query.redirect.startsWith("//")
          ? router.query.redirect
          : "/mypage";
      await router.push(destination);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t('auth.loginError'),
      );
    } finally {
      setSubmitting(false);
    }
  };
  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signUp(
        registerForm.memberNick,
        registerForm.memberPassword,
        registerForm.memberPhone,
        registerForm.memberFullName,
      );
      await router.push("/mypage");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t('auth.registerError'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="clinical-auth-page">
      <div
        className={`clinical-auth-card ${mode === "register" ? "is-register" : ""} ${transitionMode ? `animate-${transitionMode}` : ""}`}
      >
        <div className="clinical-auth-visual" aria-live="polite">
          <div
            className="clinical-auth-card-bg clinical-auth-card-bg-1"
            aria-hidden="true"
          />
          <div
            className="clinical-auth-card-bg clinical-auth-card-bg-2"
            aria-hidden="true"
          />
          <div
            className="clinical-auth-visual-content clinical-auth-welcome-register"
            aria-hidden={mode !== "register"}
          >
            <span className="clinical-auth-shield">
              <Icon name="health_and_safety" />
            </span>
            <span className="clinical-auth-kicker">{t('auth.returningKicker')}</span>
            <h2>{t('auth.returningTitle')}</h2>
            <p>{t('auth.returningIntro')}</p>
            <button
              type="button"
              tabIndex={mode === "register" ? 0 : -1}
              onClick={() => switchMode("login")}
            >
              {t('auth.signin')}
            </button>
          </div>
          <div
            className="clinical-auth-visual-content clinical-auth-welcome-login"
            aria-hidden={mode !== "login"}
          >
            <span className="clinical-auth-shield">
              <Icon name="favorite" />
            </span>
            <span className="clinical-auth-kicker">{t('auth.newKicker')}</span>
            <h2>{t('auth.newTitle')}</h2>
            <p>{t('auth.newIntro')}</p>
            <button
              type="button"
              tabIndex={mode === "login" ? 0 : -1}
              onClick={() => switchMode("register")}
            >
              {t('auth.createAccount')}
            </button>
          </div>
        </div>

        <form
          className="clinical-auth-form clinical-login-form"
          onSubmit={submitLogin}
          aria-hidden={mode !== "login"}
        >
          <Link className="clinical-auth-brand" href="/">
            <span>
              <Icon name="local_hospital" />
            </span>
            <strong>MN Hospital</strong>
          </Link>
          <span className="clinical-section-kicker">{t('auth.portal')}</span>
          <h1>{t('auth.signin')}</h1>
          <p>{t('auth.loginIntro')}</p>
          <label>
            {t('auth.username')}
            <div className="clinical-auth-field">
              <Icon name="person" />
              <input
                autoComplete="username"
                value={loginForm.memberNick}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, memberNick: event.target.value })
                }
                placeholder={t('auth.usernamePlaceholder')}
                required
              />
            </div>
          </label>
          <label>
            {t('auth.password')}
            <div className="clinical-auth-field">
              <Icon name="lock" />
              <input
                autoComplete="current-password"
                value={loginForm.memberPassword}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    memberPassword: event.target.value,
                  })
                }
                type={showLoginPassword ? "text" : "password"}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((value) => !value)}
                aria-label={
                  showLoginPassword ? t('auth.hidePassword') : t('auth.showPassword')
                }
              >
                <Icon
                  name={showLoginPassword ? "visibility" : "visibility_off"}
                />
              </button>
            </div>
          </label>
          {mode === "login" && error ? (
            <p className="clinical-auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="clinical-auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? t('auth.signingIn') : t('auth.signin')}{" "}
            <Icon name="arrow_forward" />
          </button>
          <SocialAuthButtons
            mode="login"
            disabled={submitting}
            onError={setError}
          />
          <Link
            className="clinical-doctor-login-link"
            href="/account/doctor-signin"
          >
            {t('auth.doctorSignin')}
          </Link>
          <button
            className="clinical-auth-mobile-switch"
            type="button"
            onClick={() => switchMode("register")}
          >
            {t('auth.newPatient')} <b>{t('auth.createAccount')}</b>
          </button>
        </form>

        <form
          className="clinical-auth-form clinical-register-form"
          onSubmit={submitRegister}
          aria-hidden={mode !== "register"}
        >
          <Link className="clinical-auth-brand" href="/">
            <span>
              <Icon name="local_hospital" />
            </span>
            <strong>MN Hospital</strong>
          </Link>
          <span className="clinical-section-kicker">{t('auth.registerKicker')}</span>
          <h1>{t('auth.createAccount')}</h1>
          <p>{t('auth.registerIntro')}</p>
          <div className="clinical-auth-form-grid">
            <label>
              {t('auth.fullName')}
              <div className="clinical-auth-field">
                <Icon name="badge" />
                <input
                  autoComplete="name"
                  value={registerForm.memberFullName}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      memberFullName: event.target.value,
                    })
                  }
                  placeholder={t('auth.fullNamePlaceholder')}
                  required
                />
              </div>
            </label>
            <label>
              {t('auth.phoneNumber')}
              <div className="clinical-auth-field">
                <Icon name="call" />
                <input
                  autoComplete="tel"
                  value={registerForm.memberPhone}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      memberPhone: event.target.value,
                    })
                  }
                  placeholder="+82 10 0000 0000"
                  required
                />
              </div>
            </label>
          </div>
          <label>
            {t('auth.username')}
            <div className="clinical-auth-field">
              <Icon name="person" />
              <input
                autoComplete="username"
                value={registerForm.memberNick}
                onChange={(event) =>
                  setRegisterForm({
                    ...registerForm,
                    memberNick: event.target.value,
                  })
                }
                placeholder={t('auth.usernamePlaceholder')}
                required
              />
            </div>
          </label>
          <label>
            {t('auth.password')}
            <div className="clinical-auth-field">
              <Icon name="lock" />
              <input
                autoComplete="new-password"
                value={registerForm.memberPassword}
                onChange={(event) =>
                  setRegisterForm({
                    ...registerForm,
                    memberPassword: event.target.value,
                  })
                }
                type={showRegisterPassword ? "text" : "password"}
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((value) => !value)}
                aria-label={
                  showRegisterPassword ? t('auth.hidePassword') : t('auth.showPassword')
                }
              >
                <Icon
                  name={showRegisterPassword ? "visibility" : "visibility_off"}
                />
              </button>
            </div>
          </label>
          {mode === "register" && error ? (
            <p className="clinical-auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="clinical-auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? t('auth.creating') : t('auth.createAccount')}{" "}
            <Icon name="arrow_forward" />
          </button>
          <SocialAuthButtons
            mode="register"
            disabled={submitting}
            onError={setError}
          />
          <button
            className="clinical-auth-mobile-switch"
            type="button"
            onClick={() => switchMode("login")}
          >
            {t('auth.registered')} <b>{t('auth.signin')}</b>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPortal;
