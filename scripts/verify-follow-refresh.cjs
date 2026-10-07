const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
	return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);

const { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } = require('@apollo/client');
const { refreshFollowViews } = require('../libs/components/follow/refreshFollowViews.ts');
const { GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS, GET_MEMBER_FOLLOWERS } = require('../apollo/follow/query.ts');
const { SUBSCRIBE_DOCTOR, UNSUBSCRIBE_DOCTOR } = require('../apollo/follow/mutation.ts');
const PROFILE = gql`query FollowRegressionProfile($doctorId: String!) { getDoctor(doctorId: $doctorId) { _id docFollowers } }`;
const doctorId = '000000000000000000000001';
const memberId = '000000000000000000000002';
const subscriptions = [];
const requests = [];
let following = false;

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: new ApolloLink(operation => new Observable(observer => {
		requests.push(operation.operationName);
		let data;
		switch (operation.operationName) {
			case 'SubscribeDoctor':
			case 'UnsubscribeDoctor': {
				following = operation.operationName === 'SubscribeDoctor';
				const field = following ? 'subscribeDoctor' : 'unsubscribeDoctor';
				data = { [field]: { __typename: 'DoctorFollowing', _id: 'follow-fixture', doctorId, memberId } };
				break;
			}
			case 'FollowRegressionProfile':
				data = { getDoctor: { __typename: 'Doctor', _id: doctorId, docFollowers: Number(following) } };
				break;
			case 'GetDoctorFollowers':
				data = { getDoctorFollowers: {
					list: following ? [{ __typename: 'DoctorFollower', _id: 'follow-fixture', memberId,
						memberData: { __typename: 'Member', _id: memberId, memberNick: 'fixture', memberFullName: 'Fixture Patient', memberImage: '', memberType: 'PATIENT' },
						followerDoctorData: null,
					}] : [], metaCounter: [{ total: Number(following) }],
				} };
				break;
			case 'GetDoctorFollowings':
				data = { getDoctorFollowings: {
					list: following ? [{ __typename: 'DoctorFollowing', _id: 'follow-fixture', doctorId,
						doctorData: { __typename: 'Doctor', _id: doctorId, docFullName: 'Fixture Doctor', docImage: '', docSpecialty: 'SURGEON' },
					}] : [], metaCounter: [{ total: Number(following) }],
				} };
				break;
			case 'GetMemberFollowers':
				data = { getMemberFollowers: { list: [], metaCounter: [{ total: 0 }] } };
				break;
			default: throw new Error(`Unexpected operation: ${operation.operationName}`);
		}
		observer.next({ data });
		observer.complete();
	})),
});

async function watch(query, variables) {
	const observable = client.watchQuery({ query, variables });
	await new Promise((resolve, reject) => {
		subscriptions.push(observable.subscribe({ next(result) { if (!result.loading) resolve(); }, error: reject }));
	});
	return observable;
}

(async () => {
	const followers = await Promise.all([50, 100].map(limit => watch(GET_DOCTOR_FOLLOWERS, { input: { page: 1, limit, search: { doctorId } } })));
	const followings = await watch(GET_DOCTOR_FOLLOWINGS, { input: { page: 1, limit: 50, search: { memberId } } });
	const profile = await watch(PROFILE, { doctorId });
	await watch(GET_MEMBER_FOLLOWERS, { input: { page: 1, limit: 50, search: { followingId: memberId } } });

	await client.mutate({ mutation: SUBSCRIBE_DOCTOR, variables: { input: doctorId } });
	assert.equal(followers[0].getCurrentResult().data.getDoctorFollowers.list.length, 0, 'Mutation alone reproduces the stale follower list');
	await refreshFollowViews(client, 'doctor', () => profile.refetch());
	for (const query of followers) {
		const result = query.getCurrentResult().data.getDoctorFollowers;
		assert.equal(result.metaCounter[0].total, 1);
		assert.equal(result.list[0].memberData.memberFullName, 'Fixture Patient');
	}
	assert.equal(profile.getCurrentResult().data.getDoctor.docFollowers, 1);
	assert.equal(followings.getCurrentResult().data.getDoctorFollowings.list.length, 1);

	await client.mutate({ mutation: UNSUBSCRIBE_DOCTOR, variables: { input: doctorId } });
	await refreshFollowViews(client, 'doctor', () => profile.refetch());
	for (const query of followers) assert.equal(query.getCurrentResult().data.getDoctorFollowers.list.length, 0);
	assert.equal(profile.getCurrentResult().data.getDoctor.docFollowers, 0);
	assert.equal(followings.getCurrentResult().data.getDoctorFollowings.list.length, 0);
	assert.equal(requests.filter(name => name === 'GetMemberFollowers').length, 1, 'Unrelated member followers were not refreshed');
	console.log('PASS: follow and unfollow refresh visible lists, both pagination sizes, following lists, and the profile count.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
	subscriptions.forEach(subscription => subscription.unsubscribe());
	client.stop();
});
