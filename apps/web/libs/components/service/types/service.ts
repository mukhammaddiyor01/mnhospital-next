import {
	ServiceRoom,
	ServiceRoomName,
	ServiceStatus,
	ServiceType,
} from '../enums/service.enum';

export interface Service {
	packageBaseServiceId?: string | null;
	packageRegularPrice?: number | null;
	packageItems?:
		| { serviceId: string; title: string; price: number; duration: number }[]
		| null;

	_id: string;
	serviceName: string;
	departmentId: string;
	serviceType: ServiceType;
	serviceStatus: ServiceStatus;
	serviceRoomName: ServiceRoomName;
	serviceRoom: string;
	serviceTitle: string;
	servicePrice: number;
	serviceDiscountPercent?: number | null;
	serviceViews: number;
	serviceLikes: number;
	serviceComments: number;
	serviceRank: number;
	serviceImages?: string[];
	serviceDesc?: string;
	serviceDuration?: string;
	memberId: string;
	memberData?: import('../../doctor/types/doctor').Doctor;
}

export interface Services {
	list: Service[];
	metaCounter: Array<{ total: number }>;
}

export interface ServicesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		discountedOnly?: boolean;
		priceRange?: { start: number; end: number };
		memberId?: string;
	departmentId?: string;
	serviceTypeList?: ServiceType[];
	serviceStatusList?: ServiceStatus[];
	serviceRoomNameList?: ServiceRoomName[];
	text?: string;
	};
}

export type ServiceRoomValue = ServiceRoom | string;
