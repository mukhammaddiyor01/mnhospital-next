import { Doctor } from '../../doctor/types/doctor';
import { Service } from '../../service/types/service';

export interface HomeServiceCard extends Pick<Service, '_id' | 'serviceTitle' | 'serviceDesc' | 'servicePrice'> {
	icon: string;
	label: string;
}

export interface HomeDoctorCard extends Pick<Doctor, '_id' | 'docFullName' | 'docSpecialty' | 'docExperience' | 'docPoints'> {
	role: string;
	image: string;
	availability: string;
}
