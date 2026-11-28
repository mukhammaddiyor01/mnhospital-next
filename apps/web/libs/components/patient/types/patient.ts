import { PatientBloodType, PatientGender } from '../enums/patient.enum';

export interface Patient {
	_id: string;
	memberId: string;
	memberType: string;
	memberStatus: string;
	patientFullName?: string;
	patientImage?: string;
	patientDesc?: string;
	patientAddress?: string;
	patientIdNumber: string;
	patientGender: PatientGender;
	patientBloodType?: PatientBloodType;
	patientBirthDate: string;
}
