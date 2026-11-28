import { useTranslation } from '@/libs/i18n/useTranslation';

const ServiceLoading = () => {
	const t = useTranslation();
	return <div className="service-loading" role="status" aria-label={t('serviceDetail.loading')}>
	<div className="service-loading-icon" />
	<div className="service-loading-line service-loading-line-wide" />
	<div className="service-loading-line service-loading-line-medium" />
	<div className="service-loading-copy" />
	<div className="service-loading-copy service-loading-copy-short" />
	<div className="service-loading-meta" />
</div>;
};

export default ServiceLoading;
