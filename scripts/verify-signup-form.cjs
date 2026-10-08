const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const { ApolloError } = require('@apollo/client');
const { GraphQLError } = require('graphql');
const filename = path.join(__dirname, '../libs/auth/signupForm.ts');
const compiled = new Module(filename, module);
compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
const { prepareSignup, authFormError } = compiled.exports;
const fixture = {
	memberFullName: ' Fixture Patient ', memberNick: ' patient ',
	memberPassword: ' Password123 ', memberPhone: '+82 (10) 1234-5678',
};
const input = prepareSignup(fixture).input;
assert.deepEqual(input, {
	memberFullName: 'Fixture Patient', memberNick: 'patient',
	memberPassword: ' Password123 ', memberPhone: '+821012345678',
});
assert.equal(fixture.memberPhone, '+82 (10) 1234-5678');
for (const phone of ['+82 10 1234 5678', '010-1234-5678', '+998 90 123 45 67'])
	assert.equal(prepareSignup({ ...fixture, memberPhone: phone }).error, undefined);
for (const phone of ['010123123213', '123', 'not a number', '+82+1012345678'])
	assert.equal(prepareSignup({ ...fixture, memberPhone: phone }).error, 'auth.invalidPhone');
for (const [field, values, error] of [
	['memberFullName', [' ', 'a', 'a'.repeat(101)], 'auth.invalidFullName'],
	['memberNick', [' ', 'ab', 'a'.repeat(31)], 'auth.invalidUsername'],
	['memberPassword', ['1234567', 'a'.repeat(33)], 'auth.invalidPassword'],
]) {
	for (const value of values)
		assert.equal(prepareSignup({ ...fixture, [field]: value }).error, error);
}
for (const length of [8, 32])
	assert.equal(prepareSignup({ ...fixture, memberPassword: 'a'.repeat(length) }).error, undefined);
const fallback = 'Registration failed', connection = 'Server unavailable';
assert.equal(authFormError(new ApolloError({ networkError: new TypeError('Failed to fetch') }), fallback, connection), connection);
assert.equal(authFormError(new TypeError('Load failed'), fallback, connection), connection);
assert.equal(authFormError(new ApolloError({ graphQLErrors: [new GraphQLError('Phone already in use')] }), fallback, connection), 'Phone already in use');
assert.equal(authFormError(new Error('Bad Request Exception'), fallback, connection), fallback);
assert.equal(authFormError(null, fallback, connection), fallback);
console.log('SIGNUP_FORM_VERIFIED normalization, API validation limits, and Apollo error handling');
