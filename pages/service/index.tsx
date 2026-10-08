import Link from "next/link";
import { FormEvent, useState } from "react";
import { useQuery } from "@apollo/client";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import Icon from "@/libs/components/common/Icon";
import { ServiceType } from "@/libs/components/service/enums/service.enum";
import { GET_SERVICES } from "@/apollo/service/query";
import { useClinicSettings } from "@/libs/payments/useClinicSettings";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useServiceTypeLabel } from "@/libs/i18n/useServiceTypeLabel";

import ServiceDirectoryCard from "@/libs/components/service/ServiceDirectoryCard";
import { Service } from "@/libs/components/service/types/service";
import cardStyles from "@/libs/components/common/DirectoryCard.module.scss";

const ServicesPage = () => {
  const t = useTranslation();
  const clinic = useClinicSettings();
  const typeLabel = useServiceTypeLabel();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const inquiry = {
    page,
    limit: 6,
    sort: "serviceRank",
    direction: "DESC",
    search: {
      ...(search ? { text: search } : {}),
      ...(type ? { serviceTypeList: [type] } : {}),
    },
  };
  const { data, loading, error } = useQuery(GET_SERVICES, {
    variables: { input: inquiry },
    fetchPolicy: "cache-and-network",
  });
  const services = data?.getServices?.list ?? [];
  const totalCounter = data?.getServices?.metaCounter;
  const total = Array.isArray(totalCounter)
    ? (totalCounter[0]?.total ?? services.length)
    : (totalCounter?.total ?? services.length);
  const submitHandler = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  return (
    <div className="clinical-inner-page">
      <section className="clinical-inner-hero">
        <div>
          <div className="clinical-crumb">
            <Link href="/">{t("nav.home")}</Link> / {t("nav.services")}
          </div>
          <span className="clinical-eyebrow">{t("services.eyebrow")}</span>
          <h1>
            {t("services.hero1")}
            <br />
            <em>{t("services.hero2")}</em>
          </h1>
          <p>{t("services.intro")}</p>
        </div>
      </section>
      <section className="clinical-inner-section">
        <h2>{t("services.heading")}</h2>
        <p>{t("services.description")}</p>
        <form className="clinical-filter-bar" onSubmit={submitHandler}>
          <label>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("services.searchPlaceholder")}
              aria-label={t("services.searchAria")}
            />
          </label>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
            aria-label={t("services.filterDepartment")}
          >
            <option value="">{t("services.allDepartments")}</option>
            <option value={ServiceType.CARDIOLOGY}>
              {t("services.cardiology")}
            </option>
            <option value={ServiceType.LABORATORY}>
              {t("services.laboratory")}
            </option>
            <option value={ServiceType.PEDIATRICS}>
              {t("services.pediatrics")}
            </option>
            <option value={ServiceType.NEUROLOGY}>
              {t("services.neurology")}
            </option>
          </select>
          <button className="clinical-primary-button" type="submit">
            {t("services.search")}
          </button>
        </form>
        <div className={cardStyles.grid}>
          {services.map((service: Service) => (
            <ServiceDirectoryCard
              key={service._id}
              service={service}
              currency={clinic.currency}
            />
          ))}
        </div>
        {loading && (
          <p className="clinical-query-status">{t("services.loading")}</p>
        )}
        {error && <p role="alert">{t("activity.unavailable")}</p>}
        {!loading && !error && !services.length && (
          <p role="status">{t("booking.unavailable")}</p>
        )}
        <div className="clinical-pagination">
          <span>
            {t("services.showing")
              .replace("{shown}", String(services.length))
              .replace("{total}", String(total))}
          </span>
          <div>
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              ←
            </button>
            <b>{page}</b>
            <button
              disabled={page * 6 >= total || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              →
            </button>
          </div>
        </div>
        <Link
          className="clinical-primary-button clinical-inline-button"
          href="/appointment"
        >
          {t("services.book")} <span>↗</span>
        </Link>
      </section>
    </div>
  );
};

export default withLayoutMain(ServicesPage);
