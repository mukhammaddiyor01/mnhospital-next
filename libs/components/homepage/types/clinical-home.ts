import { Service } from '../../service/types/service';
import { Doctor } from '../../doctor/types/doctor';

export interface ClinicalServiceCard extends Pick<Service, '_id' | 'serviceTitle' | 'serviceDesc' | 'servicePrice' | 'serviceViews'> {
	serviceType?: string;
	serviceImages?: string[];
	serviceLikes?: number;
	serviceStatus?: string;
	serviceRank?: number;
	serviceDuration?: string;
	meLiked?: { myFavorite?: boolean }[];
}

export interface ClinicalDoctorCard extends Pick<Doctor, '_id' | 'docFullName' | 'docSpecialty' | 'docExperience' | 'docPoints'> {
	docImage?: string;
	docNick?: string;
}

export interface ClinicalArticle {
	_id: string;
	articleCategory?: string;
	articleTitle: string;
	articleContent: string;
	articleViews?: number;
}
