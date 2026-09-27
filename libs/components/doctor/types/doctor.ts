import { DoctorSort, DoctorSpecialty } from '../enums/doctor.enum';

export interface Doctor {
	_id: string;
	docSpecialty?: DoctorSpecialty;
	docNick: string;
	docPhone: string;
	docMail?: string;
	docFullName: string;
	docImage: string;
	docAddress: string;
	docDesc: string;
	docExperience: number;
	docRoom: string;
	docPoints: number;
	docPatients: number;
	meLiked?: Array<{ memberId: string; likeRefId: string; myFavorite: boolean }>;
	createdAt: string;
	updatedAt: string;
}

export interface Doctors {
	list: Doctor[];
	metaCounter: Array<{ total: number }>;
}

export interface DoctorsInquiry {
	page: number;
	limit: number;
	docSpecialty?: DoctorSpecialty;
	sort?: DoctorSort;
	direction?: 'ASC' | 'DESC';
	search: { text?: string };
}
