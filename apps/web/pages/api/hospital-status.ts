import type { NextApiRequest, NextApiResponse } from 'next';

export interface HospitalStatus {
	yearsExperience: string;
	expertDoctors: string;
	patientSatisfaction: string;
	emergencyCare: string;
}

export const defaultHospitalStatus: HospitalStatus = {
	yearsExperience: process.env.HOSPITAL_YEARS_EXPERIENCE || '—',
	expertDoctors: process.env.HOSPITAL_VERIFIED_DOCTOR_COUNT || '—',
	patientSatisfaction: process.env.HOSPITAL_VERIFIED_SATISFACTION || '—',
	emergencyCare: process.env.HOSPITAL_EMERGENCY_HOURS || '—',
};

export default function handler(_request: NextApiRequest, response: NextApiResponse<HospitalStatus>) {
	response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
	response.status(200).json(defaultHospitalStatus);
}
