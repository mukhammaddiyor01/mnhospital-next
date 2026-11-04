import { useQuery } from '@apollo/client';
import { GET_MY_PATIENT_PROFILE } from '@/apollo/patient/query';

interface PatientRecord {
	memberId: string;
	patientBloodType?: string | null;
	patientGender?: string | null;
	patientBirthDate?: string | null;
	patientIdNumber?: string | null;
}

export const isPatientProfileComplete = (patient?: PatientRecord | null) => Boolean(
	patient?.patientBloodType &&
	patient.patientGender &&
	patient.patientBirthDate &&
	patient.patientIdNumber?.trim(),
);

export const usePatientProfileCompletion = (memberId: string, isPatient: boolean) => {
	const { data, error, loading } = useQuery<{ getMyPatientProfile: PatientRecord | null }>(GET_MY_PATIENT_PROFILE, {
		skip: !memberId || !isPatient,
		fetchPolicy: 'cache-and-network',
	});
	const patient = data?.getMyPatientProfile;
	const belongsToCurrentMember = patient?.memberId === memberId;
	return Boolean(memberId && isPatient && !loading && (
		belongsToCurrentMember
			? !isPatientProfileComplete(patient)
			: !error || /No data is found/i.test(error.message)
	));
};
