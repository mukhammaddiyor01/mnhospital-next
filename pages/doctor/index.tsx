import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import Icon from '@/libs/components/common/Icon';
import { DoctorSort, DoctorSpecialty } from '@/libs/components/doctor/enums/doctor.enum';
import { resolveApiAsset } from '@/libs/config';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useDoctorSpecialtyLabel } from '@/libs/i18n/useDoctorSpecialtyLabel';

const DoctorsPage = () => {
	const t = useTranslation();
	const specialtyLabel = useDoctorSpecialtyLabel();
	const router = useRouter();
	const [search, setSearch] = useState('');
	const [specialty, setSpecialty] = useState('');
	useEffect(() => { if (router.isReady && typeof router.query.search === 'string') setSearch(router.query.search); }, [router.isReady, router.query.search]);
	const inquiry = { page: 1, limit: 12, sort: DoctorSort.POINTS, direction: 'DESC', ...(specialty ? { docSpecialty: specialty } : {}), search: { ...(search ? { text: search } : {}) } };
	const { data, loading } = useQuery(GET_DOCTORS, { variables: { input: inquiry }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const doctors = data?.getDoctors?.list ?? [];
	const submitHandler = (event: FormEvent) => { event.preventDefault(); };
	const initials = (name?: string) => name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MN';
	const portraitClass = (index: number) => index === 1 ? 'teal' : index === 2 ? 'slate' : 'blue';

	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div>
			<div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('nav.doctors')}</div>
			<span className="clinical-eyebrow">{t('doctors.eyebrow')}</span>
			<h1>{t('doctors.hero1')}<br /><em>{t('doctors.hero2')}</em></h1>
			<p>{t('doctors.intro')}</p>
		</div></section>
		<section className="clinical-inner-section">
			<h2>{t('doctors.find')}</h2>
			<form className="clinical-filter-bar clinical-doctor-filter" onSubmit={submitHandler}>
				<label><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('doctors.searchPlaceholder')} aria-label={t('doctors.searchAria')} /></label>
				<select value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label={t('doctors.filterSpecialty')}>
					<option value="">{t('doctors.allDepartments')}</option>
					<option value={DoctorSpecialty.GENERAL_PRACTITIONER}>{t('doctors.general')}</option>
					<option value={DoctorSpecialty.CARDIOLOGIST}>{t('doctors.cardiology')}</option>
					<option value={DoctorSpecialty.DENTIST}>{t('doctors.dentistry')}</option>
					<option value={DoctorSpecialty.PEDIATRICIAN}>{t('doctors.pediatrics')}</option>
				</select>
				<button className="clinical-primary-button" type="submit">{t('doctors.search')}</button>
			</form>
			<div className="clinical-directory-grid">{doctors.map((doctor: any, index: number) => <article className="clinical-directory-card" key={doctor._id}>
				<Link aria-label={`${t('doctors.viewProfile')} ${doctor.docFullName || doctor.docNick || t('doctors.nameFallback')}`} href={`/doctor/${doctor._id}`}><div className={`clinical-directory-portrait clinical-portrait-${portraitClass(index)}${doctor.docImage ? '' : ' is-placeholder'}`} style={doctor.docImage ? { backgroundImage: `url(${resolveApiAsset(doctor.docImage)})` } : undefined}>{!doctor.docImage && <span>{initials(doctor.docFullName || doctor.docNick)}</span>}</div></Link>
				<div className="clinical-directory-info"><div><h3><Link href={`/doctor/${doctor._id}`}>{doctor.docFullName || doctor.docNick || t('doctors.nameFallback')}</Link></h3><p>{specialtyLabel(doctor.docSpecialty)}</p></div><div className="clinical-directory-bottom"><span>{Number(doctor.docExperience) > 0 ? `${doctor.docExperience} ${t('doctors.experience')}` : ''}</span><Link href={`/appointment?doctor=${doctor._id}`}>{t('doctors.book')}</Link></div></div>
			</article>)}</div>
			{loading ? <p className="clinical-query-status">{t('doctors.loading')}</p> : !doctors.length && <p className="clinical-empty-state">{t('doctors.empty')}</p>}
		</section>
	</div>;
};

export default withLayoutMain(DoctorsPage);
