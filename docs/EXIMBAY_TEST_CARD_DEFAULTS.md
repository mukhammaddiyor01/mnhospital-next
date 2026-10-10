# Eximbay sandbox test defaults

All sandbox checkout entry points share `EximbayTestCard`: the booking payment page and patient payment details. The read-only default values are the official overseas Visa test card: `4000000000000002`, expiry `12/33`, CVC `123`, optional authentication code `111`. Each value has a copy button with accessible feedback and manual-copy fallback.

The component is rendered only when the server payment mode is SANDBOX. Cash, simulated, disabled and other modes do not display it. SDK checkout payloads and payment verification are unchanged. These are public test fixtures, not patient card details.

The v3 hosted SDK does not document card-number, expiry or CVC prefill inputs. The defaults are therefore provided on the hospital checkout, not injected into the third-party payment form. The patient copies them into Eximbay's own Visa/Overseas form.

Sources:
- https://secureapi.test.eximbay.com/openapi/demo/eng/sandbox_test.jsp
- https://developer.eximbay.com/eng/eximbay/api_sdk/javascript-sdk.html

Verification: `node scripts/verify-eximbay-test-card.cjs` checks all four values, three translations, copy controls, mode restrictions and shared entry points; frontend production build.
