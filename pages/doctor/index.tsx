import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import { GET_DOCTORS } from "@/apollo/doctor/query";
import Icon from "@/libs/components/common/Icon";
import {
  DoctorSort,
  DoctorSpecialty,
} from "@/libs/components/doctor/enums/doctor.enum";
import DoctorDirectoryCard from "@/libs/components/doctor/DoctorDirectoryCard";
import cardStyles from "@/libs/components/common/DirectoryCard.module.scss";
import { Doctor } from "@/libs/components/doctor/types/doctor";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useWorkspaceText } from "@/libs/components/workspace/useWorkspaceText";
import { useDoctorSpecialtyLabel } from "@/libs/i18n/useDoctorSpecialtyLabel";

const DoctorsPage = () => {
  const t = useTranslation();
  const w = useWorkspaceText();
  const specialtyLabel = useDoctorSpecialtyLabel();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  useEffect(() => {
    if (router.isReady && typeof router.query.search === "string")
      setSearch(router.query.search);
  }, [router.isReady, router.query.search]);
  const inquiry = {
    page: 1,
    limit: 12,
    sort: DoctorSort.POINTS,
    direction: "DESC",
    ...(specialty ? { docSpecialty: specialty } : {}),
    search: { ...(search ? { text: search } : {}) },
  };
  const { data, loading, error } = useQuery(GET_DOCTORS, {
    variables: { input: inquiry },
    fetchPolicy: "cache-and-network",
  });
  const doctors = data?.getDoctors?.list ?? [];
  const submitHandler = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="clinical-inner-page">
      <section className="clinical-inner-hero">
        <div>
          <div className="clinical-crumb">
            <Link href="/">{t("nav.home")}</Link> / {t("nav.doctors")}
          </div>
          <span className="clinical-eyebrow">{t("doctors.eyebrow")}</span>
          <h1>
            {t("doctors.hero1")}
            <br />
            <em>{t("doctors.hero2")}</em>
          </h1>
          <p>{t("doctors.intro")}</p>
        </div>
      </section>
      <section className="clinical-inner-section">
        <h2>{t("doctors.find")}</h2>
        <form
          className="clinical-filter-bar clinical-doctor-filter"
          onSubmit={submitHandler}
        >
          <label>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("doctors.searchPlaceholder")}
              aria-label={t("doctors.searchAria")}
            />
          </label>
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            aria-label={t("doctors.filterSpecialty")}
          >
            <option value="">{t("doctors.allDepartments")}</option>
            {Object.values(DoctorSpecialty).map((value) => (
              <option key={value} value={value}>
                {specialtyLabel(value)}
              </option>
            ))}
          </select>
          <select aria-label={t("doctors.filterAvailability")}>
            <option>{t("doctors.anyAvailability")}</option>
            <option>{t("doctors.today")}</option>
            <option>{t("doctors.week")}</option>
          </select>
          <button className="clinical-primary-button" type="submit">
            {t("doctors.search")}
          </button>
        </form>
        <div className={cardStyles.grid}>
          {doctors.map((doctor: Doctor) => (
            <DoctorDirectoryCard doctor={doctor} key={doctor._id} />
          ))}
        </div>
        {error && <p role="alert">{w("catalogUnavailable")}</p>}
        {!loading && !error && !doctors.length && <p>{w("catalogEmpty")}</p>}
        {loading && (
          <p className="clinical-query-status">{t("doctors.loading")}</p>
        )}
      </section>
    </div>
  );
};

export default withLayoutMain(DoctorsPage);
