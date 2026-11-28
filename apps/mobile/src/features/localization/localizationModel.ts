export const languageOptions = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한국어' },
  { code: 'uz', label: 'O‘Z' },
] as const;

export type MobileLanguage = typeof languageOptions[number]['code'];

const englishMessages = {
  'language.label': 'Choose language',
  'home.title': 'Care, wherever you are',
  'home.description': 'Mobile booking and account features will connect after the API and session contracts are verified.',
  'home.services': 'Explore services',
  'home.servicesHint': 'Opens the public hospital services catalog',
  'services.listLabel': 'Hospital services',
  'services.home': 'Home',
  'services.homeHint': 'Returns to the MN Hospital welcome screen',
  'services.title': 'Services',
  'services.subtitle': 'Explore current hospital services.',
  'services.empty': 'No services are available right now.',
  'services.loading': 'Loading services',
  'services.retry': 'Retry',
  'services.loadMore': 'Load more',
  'services.configurationError': 'Set EXPO_PUBLIC_API_URL to an HTTPS GraphQL endpoint without credentials.',
  'services.unavailable': 'Services are unavailable. Please try again.',
} as const;

export type MobileCopyKey = keyof typeof englishMessages;

const messages: Record<MobileLanguage, Record<MobileCopyKey, string>> = {
  en: englishMessages,
  ko: {
    'language.label': '언어 선택',
    'home.title': '어디서나 이어지는 진료',
    'home.description': 'API와 세션 계약을 검증한 후 모바일 예약 및 계정 기능을 연결합니다.',
    'home.services': '진료 서비스 보기',
    'home.servicesHint': '공개 병원 서비스 목록을 엽니다',
    'services.listLabel': '병원 진료 서비스',
    'services.home': '홈',
    'services.homeHint': 'MN Hospital 시작 화면으로 돌아갑니다',
    'services.title': '진료 서비스',
    'services.subtitle': '현재 제공 중인 병원 서비스를 확인하세요.',
    'services.empty': '현재 이용 가능한 서비스가 없습니다.',
    'services.loading': '서비스를 불러오는 중',
    'services.retry': '다시 시도',
    'services.loadMore': '더 보기',
    'services.configurationError': '자격 증명 없이 HTTPS GraphQL 엔드포인트로 EXPO_PUBLIC_API_URL을 설정하세요.',
    'services.unavailable': '현재 서비스를 불러올 수 없습니다. 다시 시도해 주세요.',
  },
  uz: {
    'language.label': 'Tilni tanlang',
    'home.title': 'Qayerda bo‘lsangiz ham, g‘amxo‘rlik yoningizda',
    'home.description': 'Mobile booking va account funksiyalari API hamda session contractlari tasdiqlangandan keyin ulanadi.',
    'home.services': 'Xizmatlarni ko‘rish',
    'home.servicesHint': 'Shifoxonaning ochiq xizmatlar katalogini ochadi',
    'services.listLabel': 'Shifoxona xizmatlari',
    'services.home': 'Bosh sahifa',
    'services.homeHint': 'MN Hospital boshlang‘ich ekraniga qaytadi',
    'services.title': 'Xizmatlar',
    'services.subtitle': 'Shifoxonaning amaldagi xizmatlarini ko‘ring.',
    'services.empty': 'Hozircha mavjud xizmatlar yo‘q.',
    'services.loading': 'Xizmatlar yuklanmoqda',
    'services.retry': 'Qayta urinish',
    'services.loadMore': 'Yana ko‘rsatish',
    'services.configurationError': 'EXPO_PUBLIC_API_URL ni credentialsiz HTTPS GraphQL endpointiga sozlang.',
    'services.unavailable': 'Xizmatlar hozir mavjud emas. Qayta urinib ko‘ring.',
  },
};

export function translate(language: MobileLanguage, key: MobileCopyKey): string {
  return messages[language][key];
}
