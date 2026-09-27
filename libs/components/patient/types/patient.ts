import { PatientBloodType, PatientGender } from '../enums/patient.enum';

export interface Patient {
	_id: string;
	patientFullName: string;
	patientPhone: string;
	patientMail?: string;
	patientGender: PatientGender;
	patientBloodType?: PatientBloodType;
	patientBirthDate: string;
}
