import type { PreferenceLanguage } from '@/libs/components/preference/types/preference';

// Curated public catalog copy. Match source text rather than IDs so an admin
// edit is never replaced by a stale translation. Unknown copy stays unchanged.
const rows: readonly (readonly [string, string, string])[] = [
  [
    "Dentistry",
    "치과 진료",
    "Stomatologiya"
  ],
  [
    "Procedure",
    "시술",
    "Muolaja"
  ],
  [
    "Free check up",
    "검진",
    "Tekshiruv"
  ],
  [
    "Neurology",
    "신경과 진료",
    "Nevrologiya"
  ],
  [
    "Family Medicine",
    "가정의학과 진료",
    "Oilaviy tibbiyot"
  ],
  [
    "Skin Screening Test",
    "피부 검사",
    "Teri tekshiruvi"
  ],
  [
    "Gynecology",
    "부인과 진료",
    "Ginekologiya"
  ],
  [
    "Plastic Surgery",
    "성형외과 진료",
    "Plastik jarrohlik"
  ],
  [
    "Urology Consultation",
    "비뇨의학과 상담",
    "Urolog maslahati"
  ],
  [
    "Consultation",
    "진료 상담",
    "Shifokor maslahati"
  ],
  [
    "Neurosurgery",
    "신경외과 진료",
    "Neyrojarrohlik"
  ],
  [
    "Men's Health Issues",
    "남성 건강 진료",
    "Erkaklar salomatligi"
  ],
  [
    "Women Doctor Obestetrics",
    "여성 의료진 산부인과 진료",
    "Ayol shifokor bilan akusherlik qabuli"
  ],
  [
    "Good Dentistry",
    "치과 진료 안내",
    "Stomatologiya xizmati haqida"
  ],
  [
    "Good Procedure",
    "시술 안내",
    "Muolaja haqida"
  ],
  [
    "Take care about your child!",
    "자녀의 건강을 돌보세요.",
    "Farzandingiz salomatligiga e’tibor bering."
  ],
  [
    "Beauty comes at cost;)",
    "미용 진료 비용을 확인해 주세요.",
    "Go‘zallik muolajasi narxini tekshiring."
  ],
  [
    "Women's health is very important for us!",
    "여성 건강을 중요하게 생각합니다.",
    "Ayollar salomatligi biz uchun muhim."
  ],
  [
    "Talk about your health with Professionals",
    "의료진과 건강에 대해 상담하세요.",
    "Salomatligingiz haqida mutaxassis bilan maslahatlashing."
  ],
  [
    "Good Service",
    "진료 서비스 안내",
    "Tibbiy xizmat haqida"
  ],
  [
    "You can get Consultation about your health!",
    "건강에 관한 진료 상담을 받으실 수 있습니다.",
    "Salomatlik bo‘yicha shifokor maslahatini olishingiz mumkin."
  ],
  [
    "Professional Surgery",
    "외과 진료 안내",
    "Jarrohlik xizmati haqida"
  ],
  [
    "Men Health Problems",
    "남성 건강 문제에 관한 진료",
    "Erkaklar salomatligi bilan bog‘liq muammolar"
  ],
  [
    "Women are welcomed",
    "여성 환자를 위한 진료 안내",
    "Ayollar uchun qabul haqida"
  ],
  [
    "Dentistry by John",
    "치과 진료 · John",
    "Stomatologiya · John"
  ],
  [
    "Procedure by Nathan",
    "시술 · Nathan",
    "Muolaja · Nathan"
  ],
  [
    "Neurology by Dr Khan",
    "신경과 진료 · Dr Khan",
    "Nevrologiya · Dr Khan"
  ],
  [
    "Family Medicine by Mark",
    "가정의학과 진료 · Mark",
    "Oilaviy tibbiyot · Mark"
  ],
  [
    "Plastic Surgery by Dr Leo",
    "성형외과 진료 · Dr Leo",
    "Plastik jarrohlik · Dr Leo"
  ],
  [
    "Gynecology by Dr Dina",
    "부인과 진료 · Dr Dina",
    "Ginekologiya · Dr Dina"
  ],
  [
    "Urology Consultation by Dr Kevin",
    "비뇨의학과 상담 · Dr Kevin",
    "Urolog maslahati · Dr Kevin"
  ],
  [
    "Dentistry by Dr Ryan",
    "치과 진료 · Dr Ryan",
    "Stomatologiya · Dr Ryan"
  ],
  [
    "Consultation by David",
    "진료 상담 · David",
    "Shifokor maslahati · David"
  ],
  [
    "Urology",
    "비뇨의학과 진료",
    "Urologiya"
  ],
  [
    "Obstetrics",
    "산과 진료",
    "Akusherlik"
  ]
] as const;
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
const translated = new Map(rows.map(row => [normalize(row[0]), row]));
export function catalogText(value: string | null | undefined, language: PreferenceLanguage): string {
  if (!value) return '';
  if (language === 'EN') return normalize(value) === 'free check up' ? 'Checkup' : value;
  const row = translated.get(normalize(value));
  return row ? row[language === 'KR' ? 1 : 2] : value;
}

const titleRows = rows.slice(0, 13);
export function catalogSearchText(value: string): string {
  const query = normalize(value);
  if (!query) return '';
  const exact = rows.find(row => row.slice(1).some(label => normalize(label) === query));
  if (exact) return exact[0];
  const matching = titleRows.filter(row => row.slice(1).some(label => normalize(label).includes(query)));
  // Shared specialty terms remain broad searches rather than selecting one result.
  const aliases: Record<string, string> = {
    '치과': 'Dentistry', '신경': 'Neuro', '신경과': 'Neurology', '신경외과': 'Neurosurgery',
    '외과': 'Surgery',
    '성형외과': 'Plastic Surgery', '비뇨': 'Urology', '비뇨의학과': 'Urology',
    '부인과': 'Gynecology', '가정의학과': 'Family Medicine', '산부인과': 'Obstetrics',
    '피부': 'Skin', '검진': 'check', 'checkup': 'Free check up', 'check-up': 'Free check up', '상담': 'Consultation',
  };
  return aliases[query] || (matching.length === 1 ? matching[0][0] : value.trim());
}
