// Read-only presentation checks: no live account, follow or like mutations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
let checks = 0;
const check = (condition, label) => { assert.ok(condition, label); checks++; };
const root = path.resolve(__dirname, '..');
const load = (file, stubs) => {
  const filename = path.join(root, file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(root);
  mod.require = (id) => Object.hasOwn(stubs, id) ? stubs[id] : Module.prototype.require.call(mod, id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
  return mod.exports;
};
const common = {
  '@/libs/components/common/ProfileAvatar': ({ name }) => React.createElement('span', {}, name),
  '@/libs/components/common/CardInteraction.module.scss': { card: 'card', overlay: 'overlay' },
  'next/link': ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children),
  '@/libs/config': { resolveApiAsset: (asset) => asset?.startsWith('http') ? asset : `http://localhost:2001/${asset}` },
  '@/libs/i18n/useTranslation': { useTranslation: () => (key) => key },
  '../preference/PreferenceProvider': { usePreferences: () => ({ language: 'EN' }) },
  '../common/Icon': ({ name }) => React.createElement('i', { 'aria-hidden': true }, name),
};
const followQueries = Object.fromEntries(['GET_MEMBER_FOLLOWERS', 'GET_DOCTOR_FOLLOWERS', 'GET_MEMBER_FOLLOWINGS', 'GET_DOCTOR_FOLLOWINGS'].map((name) => [name, name]));
let responses = {};
let calls = [];
const { default: FollowLists } = load('libs/components/follow/FollowLists.tsx', {
  ...common,
  '@/apollo/follow/query': followQueries,
  '@apollo/client': { useQuery: (query, options) => { calls.push({ query, options }); return options.skip ? {} : responses[query] ?? {}; } },
});
const page = (field, count) => ({ data: { [field]: { list: [], metaCounter: count === 0 ? [] : [{ total: count }] } } });
const profileId = 'a'.repeat(24);
const renderFollow = (kind = 'patient', id = profileId) => renderToStaticMarkup(React.createElement(FollowLists, { profileId: id, kind }));
responses = { GET_MEMBER_FOLLOWERS: page('getMemberFollowers', 42), GET_MEMBER_FOLLOWINGS: page('getMemberFollowings', 12), GET_DOCTOR_FOLLOWINGS: page('getDoctorFollowings', 8), GET_DOCTOR_FOLLOWERS: page('getDoctorFollowers', 9) };
let html = renderFollow();
check(html.includes('<strong>42</strong>'), 'Patient follower count uses server total');
check(html.includes('<strong>20</strong>'), 'Following adds patient and doctor relations');
check(html.includes('aria-haspopup="dialog"'), 'Counters open an accessible dialog');
check(!html.includes('<dialog open'), 'Lists stay closed initially');
check(calls.find((call) => call.query === 'GET_DOCTOR_FOLLOWERS').options.skip, 'Patient never queries doctor follower identity');
check(calls.find((call) => call.query === 'GET_MEMBER_FOLLOWERS').options.variables.input.search.followingId === profileId, 'Follower query uses the existing profile search');
calls = [];
html = renderFollow('doctor');
check(html.includes('<strong>9</strong>'), 'Doctor follower count uses doctor API');
check(calls.find((call) => call.query === 'GET_MEMBER_FOLLOWERS').options.skip, 'Doctor never queries patient follower identity');
responses.GET_DOCTOR_FOLLOWINGS = { error: new Error('Unavailable') };
html = renderFollow();
check(html.includes('<strong>—</strong>'), 'Partial following failure is unknown, not false zero');
responses.GET_DOCTOR_FOLLOWINGS.previousData = page('getDoctorFollowings', 8).data;
html = renderFollow();
check(html.includes('<strong>20</strong>'), 'Failed pagination retains previously loaded server totals');
responses = { GET_MEMBER_FOLLOWERS: page('getMemberFollowers', 0), GET_MEMBER_FOLLOWINGS: page('getMemberFollowings', 0), GET_DOCTOR_FOLLOWINGS: page('getDoctorFollowings', 0) };
html = renderFollow();
check((html.match(/<strong>0<\/strong>/g) ?? []).length === 2, 'Empty aggregate counters render zero');
calls = [];
renderFollow('patient', 'invalid');
check(calls.every((call) => call.options.skip), 'Invalid identities do not reach API');

const { default: Departments } = load('libs/components/homepage/DepartmentSwiper.tsx', {
  ...common,
  'swiper/react': { Swiper: ({ children }) => React.createElement('section', {}, children), SwiperSlide: ({ children }) => React.createElement('div', {}, children) },
  'swiper/modules': {},
});
const service = { _id: 'b'.repeat(24), serviceTitle: 'Cardiology consultation', serviceDesc: 'Clinical care', serviceType: 'CARDIOLOGY', serviceImages: ['uploads/cardio.png'], serviceViews: 128, serviceLikes: 7 };
html = renderToStaticMarkup(React.createElement(Departments, { services: [service], usingFallback: false }));
check(html.includes('http://localhost:2001/uploads/cardio.png'), 'Card resolves the existing API image');
check(html.includes('7 <small>home.department.likes'), 'Likes come from stored serviceLikes');
check(html.includes('128 <small>home.department.views'), 'Views come from stored serviceViews');
check(html.includes(`/service/${service._id}`), 'Service detail route is unchanged');
html = renderToStaticMarkup(React.createElement(Departments, { services: [{ ...service, serviceLikes: 0, serviceViews: 0 }], usingFallback: false }));
check((html.match(/0 <small>/g) ?? []).length === 2, 'Real zero likes/views remain zero');
html = renderToStaticMarkup(React.createElement(Departments, { services: [{ ...service, serviceImages: [] }], usingFallback: true }));
check(html.includes('/img/hospital-care-1.png'), 'Missing image has a local hospital placeholder');
check(html.includes('home.department.preview'), 'Fallback clearly marked as preview');
check((html.match(/— <small>/g) ?? []).length === 2, 'Preview never invents engagement numbers');
const { default: ProfileCard } = load('libs/components/dashboard/StaffProfileCard.tsx', {
  ...common, '@/libs/components/common/Icon': common['../common/Icon'],
});
html = renderToStaticMarkup(React.createElement(ProfileCard, {
  name: 'Alex Park', nickname: 'alex', roleLabel: 'Patient', heading: 'Personal information',
  facts: [{ label: 'Phone', value: '+82 sample' }],
  connections: React.createElement('button', {}, '12 Followers'),
  navigation: React.createElement('nav', {}, 'Medical profile'),
  children: React.createElement('button', {}, 'Edit'),
}));
check(html.indexOf('12 Followers') < html.indexOf('Personal information'), 'Connections remain beside the identity above account facts');
check(html.indexOf('Medical profile') < html.indexOf('Personal information'), 'Profile navigation precedes account details');
check(html.includes('id="account-details"'), 'Account section navigation has a stable target');

const roles = { PATIENT: 'PATIENT', DOCTOR: 'DOCTOR', RECEPTIONIST: 'RECEPTIONIST', ADMIN: 'ADMIN' };
let session = { _id: profileId, memberType: roles.PATIENT };
let mutations = 0;
const records = {
  getMyMemberProfile: { _id: profileId, memberNick: 'alex', memberFullName: 'Alex Park', memberPhone: 'Patient phone', memberMail: 'patient@example.test', memberDesc: 'Patient description' },
  getMyDoctorProfile: { _id: profileId, docNick: 'minji', docFullName: 'Minji Kim', docPhone: 'Doctor phone', docMail: 'doctor@example.test', docAddress: 'Doctor address', docDesc: 'Doctor description', docExperience: 12, docRoom: 'Room 204', docSpecialty: 'CARDIOLOGIST' },
  getMyReceptionistProfile: { _id: profileId, receptionistNick: 'yuna', receptionistFullName: 'Yuna Lee', receptionistPhone: 'Reception phone', receptionistMail: 'reception@example.test', receptionistAddress: 'Reception address', receptionistDesc: 'Reception description' },
  getMyAdminProfile: { _id: profileId, adminNick: 'hospital.admin', adminPhone: 'Admin phone', adminMail: 'admin@example.test', adminDesc: 'Admin description' },
};
const { default: Editor } = load('libs/components/workspace/AccountProfileEditor.tsx', {
  ...common,
  '@apollo/client': { gql: require('@apollo/client').gql, useReactiveVar: () => session, useQuery: (_, options) => options.skip ? {} : { data: records }, useMutation: () => [() => { mutations++; throw new Error('Unexpected write'); }, { loading: false }] },
  '@/apollo/store': { userVar: () => session },
  '@/apollo/member/query': { GET_MY_MEMBER_PROFILE: 'member' },
  '@/apollo/staff-workspace/query': { GET_DOCTOR_PROFILE: 'doctor', GET_RECEPTIONIST_PROFILE: 'reception' },
  '@/apollo/auth/mutation': {},
  '@/libs/auth/session': {},
  '@/libs/components/member/enums/member.enum': { MemberType: roles },
  '@/libs/components/dashboard/StaffProfileCard': ProfileCard,
  '@/libs/components/follow/FollowLists': ({ kind, profileId: id }) => React.createElement('div', { 'data-follow-kind': kind, 'data-profile-id': id }),
  '@/libs/i18n/useDoctorSpecialtyLabel': { useDoctorSpecialtyLabel: () => (value) => value },
  './useWorkspaceText': { useWorkspaceText: () => (key) => key },
  './ImageUpload': () => null,
  '@/libs/components/common/Icon': common['../common/Icon'],
});
for (const role of Object.values(roles)) {
  session = { _id: profileId, memberType: role };
  html = renderToStaticMarkup(React.createElement(Editor, { role }));
  check(html.includes('mn-profile-record'), `${role} uses the shared account record design`);
  check(html.includes('mn-profile-security'), `${role} retains password controls`);
  check(html.includes('data-follow-kind') === [roles.PATIENT, roles.DOCTOR].includes(role), `${role} only shows supported follow roles`);
  if (role === roles.DOCTOR) {
    check(html.includes('Room 204') && html.includes('managedByHospital'), 'Doctor assignments stay visible and hospital-managed');
    check(!html.includes('Admin phone') && !html.includes('Patient phone'), 'Doctor record does not mix role-specific fields');
  }
}
session = { _id: profileId, memberType: roles.PATIENT };
html = renderToStaticMarkup(React.createElement(Editor, { role: roles.DOCTOR }));
check(!html.includes('Minji Kim'), 'Wrong-role session does not render doctor identity');
check(mutations === 0, 'Profile presentation performs no mutation');
console.log(`PROFILE_PRESENTATION_VERIFIED ${checks} checks`);
