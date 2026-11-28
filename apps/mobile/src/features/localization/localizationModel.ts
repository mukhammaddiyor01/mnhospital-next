export const languageOptions = [
  { code: 'en', label: 'EN', locale: 'en-US' },
  { code: 'ko', label: '한국어', locale: 'ko-KR' },
  { code: 'uz', label: 'O‘Z', locale: 'uz-UZ' },
] as const;

export type MobileLanguage = typeof languageOptions[number]['code'];

// [English, Korean, Uzbek]
const messages = {
  'language.label': ['Choose language', '언어 선택', 'Tilni tanlang'],
  'tabs.home': ['Home', '홈', 'Bosh sahifa'],
  'tabs.services': ['Services', '진료 서비스', 'Xizmatlar'],
  'tabs.doctors': ['Doctors', '의료진', 'Shifokorlar'],
  'tabs.articles': ['Articles', '건강 정보', 'Maqolalar'],
  'home.title': ['Care, wherever you are', '어디서나 이어지는 진료', 'Qayerda bo‘lsangiz ham, g‘amxo‘rlik yoningizda'],
  'home.description': [
    'Browse hospital services, doctors and health articles.',
    '병원 진료 서비스, 의료진, 건강 정보를 확인하세요.',
    'Shifoxona xizmatlari, shifokorlar va sog‘liq haqidagi maqolalarni ko‘ring.',
  ],
  'home.seeAll': ['See all', '전체 보기', 'Hammasi'],
  'services.listLabel': ['Hospital services', '병원 진료 서비스', 'Shifoxona xizmatlari'],
  'services.price': ['List price', '정가', 'Narxi'],
  'services.discount': ['Discount', '할인', 'Chegirma'],
  'services.duration': ['Duration', '소요 시간', 'Davomiyligi'],
  'services.book': ['Book on mnhospital.uz', 'mnhospital.uz에서 예약', 'mnhospital.uz saytida band qilish'],
  'services.bookHint': ['Opens the website in your browser', '브라우저에서 웹사이트를 엽니다', 'Saytni brauzerda ochadi'],
  'doctors.listLabel': ['Hospital doctors', '병원 의료진', 'Shifoxona shifokorlari'],
  'doctors.experience': ['Years of experience', '경력(년)', 'Tajriba (yil)'],
  'doctors.address': ['Address', '주소', 'Manzil'],
  'articles.listLabel': ['Health articles', '건강 정보 목록', 'Sog‘liq haqidagi maqolalar'],
  'detail.service': ['Service', '진료 서비스', 'Xizmat'],
  'detail.doctor': ['Doctor', '의료진', 'Shifokor'],
  'detail.article': ['Article', '건강 정보', 'Maqola'],
  'common.minutes': ['min', '분', 'daqiqa'],
  'common.empty': ['Nothing is available right now.', '현재 표시할 항목이 없습니다.', 'Hozircha ma’lumot yo‘q.'],
  'common.loading': ['Loading', '불러오는 중', 'Yuklanmoqda'],
  'common.retry': ['Retry', '다시 시도', 'Qayta urinish'],
  'common.loadMore': ['Load more', '더 보기', 'Yana ko‘rsatish'],
  'common.unavailable': [
    'This information is unavailable. Please try again.',
    '정보를 불러올 수 없습니다. 다시 시도해 주세요.',
    'Ma’lumot hozir mavjud emas. Qayta urinib ko‘ring.',
  ],
  'common.configurationError': [
    'Set EXPO_PUBLIC_API_URL to an HTTPS GraphQL endpoint without credentials.',
    '자격 증명 없이 HTTPS GraphQL 엔드포인트로 EXPO_PUBLIC_API_URL을 설정하세요.',
    'EXPO_PUBLIC_API_URL ni login-parolsiz HTTPS GraphQL manziliga sozlang.',
  ],
} as const;

// Server enum values: service types, doctor specialties and article categories.
const enumLabels: Record<string, readonly [string, string, string]> = {
  CONSULTATION: ['Consultation', '상담', 'Konsultatsiya'],
  DIAGNOSTIC: ['Diagnostics', '진단', 'Diagnostika'],
  PROCEDURE: ['Procedure', '시술', 'Muolaja'],
  THERAPY: ['Therapy', '치료', 'Terapiya'],
  LABORATORY: ['Laboratory', '검사실', 'Laboratoriya'],
  DENTISTRY: ['Dentistry', '치과', 'Stomatologiya'],
  PEDIATRICS: ['Pediatrics', '소아청소년과', 'Pediatriya'],
  NEUROLOGY: ['Neurology', '신경과', 'Nevrologiya'],
  CARDIOLOGY: ['Cardiology', '심장내과', 'Kardiologiya'],
  DERMATOLOGY: ['Dermatology', '피부과', 'Dermatologiya'],
  OPHTHAL: ['Ophthalmology', '안과', 'Oftalmologiya'],
  UROLOGY: ['Urology', '비뇨의학과', 'Urologiya'],
  NEUROSURGERY: ['Neurosurgery', '신경외과', 'Neyroxirurgiya'],
  PLASTIC_SURGERY: ['Plastic surgery', '성형외과', 'Plastik jarrohlik'],
  OBSTETRICS_GYNECOLOGY: ['Obstetrics and gynecology', '산부인과', 'Akusherlik va ginekologiya'],
  FAMILY_MEDICINE: ['Family medicine', '가정의학과', 'Oilaviy tibbiyot'],
  GENERAL_PRACTITIONER: ['General practitioner', '일반의', 'Umumiy amaliyot shifokori'],
  CARDIOLOGIST: ['Cardiologist', '심장 전문의', 'Kardiolog'],
  DERMATOLOGIST: ['Dermatologist', '피부과 전문의', 'Dermatolog'],
  NEUROLOGIST: ['Neurologist', '신경과 전문의', 'Nevrolog'],
  PEDIATRICIAN: ['Pediatrician', '소아과 전문의', 'Pediatr'],
  SURGEON: ['Surgeon', '외과 전문의', 'Jarroh'],
  DENTIST: ['Dentist', '치과 의사', 'Stomatolog'],
  UROLOGIST: ['Urologist', '비뇨의학과 전문의', 'Urolog'],
  OPHTHALMOLOGIST: ['Ophthalmologist', '안과 전문의', 'Oftalmolog'],
  NEUROSURGEON: ['Neurosurgeon', '신경외과 전문의', 'Neyroxirurg'],
  PLASTIC_SURGEON: ['Plastic surgeon', '성형외과 전문의', 'Plastik jarroh'],
  OBSTETRICIAN_GYNECOLOGIST: ['Obstetrician-gynecologist', '산부인과 전문의', 'Akusher-ginekolog'],
  FAMILY_PHYSICIAN: ['Family physician', '가정의학 전문의', 'Oilaviy shifokor'],
  HEALTH: ['Health', '건강', 'Salomatlik'],
  NEWS: ['News', '소식', 'Yangiliklar'],
  TIPS: ['Tips', '생활 팁', 'Maslahatlar'],
  RESEARCH: ['Research', '연구', 'Tadqiqot'],
  ANNOUNCEMENT: ['Announcement', '공지', 'E’lon'],
};

export type MobileCopyKey = keyof typeof messages;
export const copyKeys = Object.keys(messages) as MobileCopyKey[];

const column = (language: MobileLanguage) => languageOptions.findIndex(({ code }) => code === language);

export function translate(language: MobileLanguage, key: MobileCopyKey): string {
  return messages[key][column(language)];
}

export function enumLabel(language: MobileLanguage, value: string | null): string | null {
  if (!value) return null;
  return enumLabels[value]?.[column(language)] ?? value.replace(/_/g, ' ');
}
