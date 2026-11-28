import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
const copy = {
	settlement: ['Order settlement', 'Buyurtma to‘lovi', '주문 결제'],
	appointment: ['Appointment', 'Qabul', '진료 예약'],
	payment: ['Payment', 'To‘lov', '결제'],
	reception: ['Reception task', 'Qabulxona vazifasi', '접수 업무'],
	awaiting: ['Awaiting payment', 'To‘lov kutilmoqda', '결제 대기'],
	unbooked: [
		'Checkout not finished',
		'Booking yakunlanmagan',
		'결제 단계 미완료',
	],
	receive: ['Record cash received', 'Naqd pul olindi', '현금 수납 기록'],
	receiptConfirm: [
		'Confirm only after receiving this cash payment.',
		'Faqat naqd pulni olgandan keyin tasdiqlang.',
		'현금 수납 후에만 확인하세요.',
	],
	prepare: [
		'Accept check-in task',
		'Check-in vazifasini qabul qilish',
		'체크인 업무 수락',
	],
	accept: ['Accept task', 'Vazifani qabul qilish', '업무 수락'],
	taskNeeded: [
		'Accept a check-in task before checking in the patient.',
		'Patientni check-in qilishdan oldin check-in vazifasini qabul qiling.',
		'환자 체크인 전에 체크인 업무를 수락하세요.',
	],
	independent: [
		'Doctor confirmation and payment are separate. Cash stays pending until reception records its receipt.',
		'Doctor tasdig‘i va to‘lov alohida. Qabulxona pul olganini qayd etguncha naqd to‘lov pending bo‘ladi.',
		'의사 승인과 결제는 별개입니다. 현금 결제는 접수처 수납 기록 전까지 대기 상태입니다.',
	],
	tasksIndependent: [
		'Task status describes reception work; appointment status describes the patient’s visit.',
		'Vazifa holati qabulxona ishini, qabul holati esa patient tashrifini bildiradi.',
		'업무 상태는 접수 업무를, 진료 예약 상태는 환자 방문을 나타냅니다.',
	],
	completed: ['Completed', 'Yakunlangan', '완료'],
	arrivalInstruction: [
		'Patient arrival and check-in',
		'Patientning kelishi va check-in',
		'환자 도착 및 체크인',
	],
	selectedAppointment: [
		'Selected appointment',
		'Tanlangan qabul',
		'선택한 진료 예약',
	],
	done: ['Saved', 'Saqlandi', '저장됨'],
	start: ['Start visit', 'Qabulni boshlash', '진료 시작'],
	confirmState: [
		'Confirm this appointment status change?',
		'Qabul holatini o‘zgartirishni tasdiqlaysizmi?',
		'진료 예약 상태 변경을 확인하시겠습니까?',
	],
	confirm: ['Confirm appointment', 'Qabulni tasdiqlash', '진료 예약 승인'],
	finish: ['Complete visit', 'Qabulni yakunlash', '진료 완료'],
	paid: ['Paid', 'To‘langan', '결제 완료'],
	failed: ['Failed', 'Muvaffaqiyatsiz', '실패'],
	cancelled: ['Cancelled', 'Bekor qilingan', '취소됨'],
	refunded: ['Refunded', 'Qaytarilgan', '환불됨'],
	cash: ['Cash', 'Naqd', '현금'],
	online: ['Online', 'Onlayn', '온라인'],
	refresh: ['Refresh', 'Yangilash', '새로고침'],
	details: ['Open booking', 'Buyurtmani ochish', '예약 열기'],
} as const;
export function useAppointmentFlowText() {
	const { language } = usePreferences();
	return (key: keyof typeof copy) =>
		copy[key][{ EN: 0, UZ: 1, KR: 2 }[language]];
}

export function useBookingSettlementLabel() {
	const f = useAppointmentFlowText();
	return (status: string) =>
		({
			PENDING: f('awaiting'),
			CONFIRMED: f('paid'),
			COMPLETED: f('completed'),
			CANCELLED: f('cancelled'),
		})[status] ?? status;
}
