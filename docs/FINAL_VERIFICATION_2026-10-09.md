# MN Hospital — yangilangan tekshiruv, 2026-10-09

✅ — ko‘rsatilgan doirada tasdiqlangan. 🟡 — qisman tayyor yoki yakuniy tekshiruvi qolgan. ❌ — mavjud emas.

Tekshiruv joriy lokal working tree, muvaffaqiyatli production build nusxasi va haqiqiy API bo‘yicha bajarildi. Ayrim oldingi UI o‘zgarishlari hali commit qilinmagan. Internetdagi production deployment, haqiqiy pul yechish va barcha brauzer/dashboard CRUD ssenariylari tekshirildi degan da’vo yo‘q. Dashboard URLining HTTP 200 qaytarishi foydalanuvchi autentifikatsiyadan o‘tganini anglatmaydi; role/ownership alohida haqiqiy API testlarida tekshirildi.

## Natijalar

- Backend: 52 suite, 393 test o‘tdi. Unit run ichida 13 integration test skip qilindi; keyin ular alohida MongoDB checkout testida 13/13 o‘tdi.
- Yangi izolyatsiyalangan MongoDB bazasida 248 login, role, ownership, refresh, cookie rotation, logout, preference, messaging va session/WebSocket access tekshiruvi o‘tdi. Test bazasi yakunda tozalandi; amaldagi hospital hujjatlari o‘zgartirilmadi.
- Frontend: 42 auth, 70 dark-contrast, 8 calendar va 32 service-option tekshiruvi o‘tdi; signup normalization/validation/error handling tekshiruvi o‘tdi.
- GraphQL: 108 eksport qilingan contract; barcha literal/generated workspace hujjatlari bilan 397 hujjat va 160 API maydoni, zero errors.
- AI: amaldagi API orqali maxfiy ma’lumotsiz booking savoli yuborildi; HTTP 200, `READY`, 77 belgili haqiqiy provider javobi qaytdi. Javob va kalit qiymatlari hisobotga kiritilmadi.
- 132 TSX faylda 14 literal `img`/`Image`: alt atributi yo‘q element topilmadi. 8 ta bo‘sh alt dekorativ/yonidagi matn orqali nomlangan tasvirlarda bor; bu avtomatik semantik accessibility sertifikati emas.
- 157 literal href joyi ko‘rildi: statik ichki broken link va `#` placeholder topilmadi. 44 dinamik href to‘liq statik tekshiruvdan o‘tmaydi. Production nusxada 16 sahifa + favicon HTTP 200, noma’lum route HTTP 404 qaytardi. Auth sahifalari uchun bu faqat HTML/gate smoke testi.
- Mobil override 390×844; scrollbar bilan document viewport 375px: yuklangan homepage, service detail va appointment sahifalarida document width ham 375px, horizontal overflow yo‘q. Service → appointment tanlovi ayni xizmat/narx bilan ochildi. Bu barcha private dashboard breakpointlari tekshirildi degani emas.
- Production nusxada warm homepage HTML javobi uch o‘lchovda 2–3ms. Bu localhost HTML response vaqti; LCP/INP/CLS, real tarmoq, font/image loading va hosting tezligi bilan teng emas.

## Loyiha bo‘yicha 14 band

| # | Ish | Hozirgi holat va qolgan qism |
| --- | --- | --- |
| 1 | Notification schema va API | ✅ Schema, list/detail, read va ownership testlari o‘tdi. |
| 2 | Notification event triggerlar | ✅ Appointment, booking/payment, reception, report va messaging triggerlari bor; regression testlari o‘tdi. |
| 3 | Messaging | ✅ Shaxsiy suhbat/message/read APIlari bor. Guest chat endi MongoDBga saqlanadi va oxirgi 50 xabar yuklanadi. |
| 4 | WebSocket | ✅ Bir API jarayoni uchun private delivery/session nazorati bor; gateway testlari va bloklangan sessionni uzish testi o‘tdi. Ko‘p instance uchun shared pub/sub tekshiruvi qilinmagan. |
| 5 | User preference API | ✅ Barcha rollarda owned preference, partial update va defaults testlari o‘tdi. |
| 6 | Dark/light mode | 🟡 Theme control barcha staff rollarida bor; dark palette bo‘yicha 70 check o‘tdi. Admin light ko‘rinishida qorong‘i ranglarni saqlaydigan role CSS hali bor. |
| 7 | KR/UZ/EN localization | 🟡 Asosiy UI, specialty va option matnlari uch tilda. Ayrim status/marketing matnlari va bazadagi service/article kontenti to‘liq lokalizatsiya qilinmagan. |
| 8 | AI chatbot | ✅ Backend provider, chat UI va public hospital catalog integratsiyasi bor; haqiqiy provider `READY` javobi tasdiqlandi. Private medical data va booking amallarini bajarish bu assistant doirasiga kirmaydi. |
| 9 | Admin dashboard | 🟡 Patient, booking, appointment, article/comment, payment, room, task, notice, ad, messages va notifications ulangan. Contract va role testlari o‘tdi; har bir CRUDning brauzer E2E tekshiruvi qolgan. |
| 10 | Doctor dashboard | 🟡 Service/calendar, appointment, booking, report, article, profile va chat ulangan; API ownership testlari o‘tdi. To‘liq klinik browser ssenariysi qolgan. |
| 11 | Receptionist dashboard | 🟡 Appointment, booking, cash payment, task/result, report, profile va chat ulangan; backend regression/access testlari o‘tdi. To‘liq browser ssenariysi qolgan. |
| 12 | Frontend yakuniy integratsiya | 🟡 397 hujjat/160 API maydoni mos; public service → booking tekshirildi. Barcha 4 rolda UI login → ish amali → notification/message E2E qolgan. |
| 13 | Refresh token | ✅ Token issuance, rotation, replay/origin nazorati, HttpOnly cookie va logout revocation haqiqiy Mongo/API bilan tekshirildi. |
| 14 | Role, ownership va regression | ✅ Qamrab olingan amallar uchun 248 real access va 393 backend test o‘tdi. Bu har bir kelajakdagi yoki barcha mumkin bo‘lgan ssenariylarga kafolat emas. |

## Rasmdagi 20 ta release tekshiruvi

| # | Tekshiruv | Natija |
| --- | --- | --- |
| 1 | Privacy policy | ❌ Sahifa topilmadi; `/privacy` HTTP 404. |
| 2 | Terms & conditions | ❌ Sahifa topilmadi; `/terms` HTTP 404. |
| 3 | Secrets off frontend | ✅ Joriy tracked frontendda private environment/credential fayli yoki aniqlangan sir yo‘q; Kakao browser OAuth client ID alohida private secret emas. Backendning eski Eximbay kaliti bo‘yicha quyidagi ochiq ish saqlanadi. |
| 4 | Force HTTPS | 🟡 Lokal HTTP normal. Repoda production HTTPS redirect/HSTS/proxy konfiguratsiyasi topilmadi; deployed host tekshirilmagan. |
| 5 | Cookie consent banner | ❌ Banner va consent boshqaruvi topilmadi. Cookie siyosatining yuridik muvofiqligi bu texnik auditda baholanmadi. |
| 6 | Meta title + description | 🟡 Umumiy public title/description bor; service/doctor/article uchun individual SEO metadata, staff uchun description/noindex tekshiruvi qolgan. |
| 7 | Social preview image | ❌ `og:image`/social preview metadata topilmadi. |
| 8 | Favicon | ✅ `/favicon.png` HTTP 200 va layoutlarda ulanadi. |
| 9 | Sitemap + robots.txt | ❌ Ikkala route HTTP 404. |
| 10 | Alt text | ✅ Ko‘rilgan barcha literal image elementlarida alt bor; dekorativ rasmlarda `alt=""` ishlatilgan. |
| 11 | Image compression | 🟡 Next Image/lazy loading ayrim joylarda bor. 3 lokal hero PNG 1,92–2,06MB, logo 561KB; lokal rasmlar jami 6,55MB. Uploadlar uchun umumiy compression pipeline topilmadi. |
| 12 | Page load speed | 🟡 Lokal production HTML javobi o‘lchandi; real production Core Web Vitals va mobil tarmoq testi qolgan. |
| 13 | Color contrast | 🟡 70 dark-theme palette tekshiruvi o‘tdi. Admin light va barcha individual light/hover/error holatlari bo‘yicha yakuniy audit qolgan. |
| 14 | Mobile friendly | 🟡 Tekshirilgan public homepage/service/bookingda overflow yo‘q. Barcha staff jadval/formlari va qurilma o‘lchamlari hali to‘liq tekshirilmagan. |
| 15 | Custom 404 | ✅ Lokalizatsiyalangan sahifa bor; noma’lum URL HTTP 404. |
| 16 | Broken links | 🟡 Statik ichki linklarda xato topilmadi; tanlangan route smoke testlari o‘tdi. Barcha dinamik detail va tashqi reklamalar tekshirilmagan; live adlarda `example.com` test URLlari bor. |
| 17 | Form validation | ✅ Signup, backend DTO, service duration/calendar/option va checkout validation regression testlari o‘tdi. |
| 18 | Spam protection | 🟡 AI uchun rate/concurrency limit bor. Login/signup, comment va guest chat uchun umumiy rate limiting/CAPTCHA himoyasi topilmadi. |
| 19 | Analytics | ❌ Analytics integratsiyasi topilmadi. |
| 20 | One clear CTA | ✅ Asosiy public maqsad “Book an Appointment”; service variantida ham bookingga olib boruvchi bitta asosiy tugma bor. |

## Muhim ochiq ishlar

1. Oldingi security auditda GitHub tarixida topilgan Eximbay test kalitining provayderda bekor qilinishi/rotatsiyasi tasdiqlanmagan. Joriy hujjat tozalangan, ammo tarix qolgan.
2. Oldingi lockfile audit natijasi: backend 1 critical/16 high, frontend 2 critical/2 high dependency ogohlantirishi. Bu tekshiruvda dependencylar yangilanmadi. Production relizdan oldin yangilash va regression kerak.
3. Privacy/terms, SEO/social preview, robots/sitemap, HTTPS konfiguratsiyasi va umumiy abuse himoyasi bo‘yicha release ishlari qolgan.
4. Admin light, katta rasmlar, database kontent lokalizatsiyasi, real hospital marketing/contact/testimonial ma’lumotlari va barcha rollar UI E2E qolgan. Homepage marketing/accreditation/testimonial matnlarining haqiqiyligini kod testi tasdiqlamaydi.

Hisobot natijalarini production-ready yoki “100% barcha ssenariylar tekshirildi” deb talqin qilmaslik kerak. Avvalgi tasdiqlangan API va integration ishlari yo‘q deb qayta belgilanishi ham noto‘g‘ri.
