import type { NextApiRequest, NextApiResponse } from 'next';

export interface HospitalStatus {
	yearsExperience: string;
	expertDoctors: string;
	patientSatisfaction: string;
	emergencyCare: string;
}

export const defaultHospitalStatus: HospitalStatus = {
	yearsExperience: '25+',
	expertDoctors: '150+',
	patientSatisfaction: '99%',
	emergencyCare: '24/7',
};

export default function handler(_request: NextApiRequest, response: NextApiResponse<HospitalStatus>) {
	response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
	response.status(200).json(defaultHospitalStatus);
}
