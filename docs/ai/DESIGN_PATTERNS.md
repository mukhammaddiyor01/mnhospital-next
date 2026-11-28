# Design patterns

Organize each mobile feature as `app/` route → `src/features/<name>/` view → view-model hook → API adapter → pure model. The initial home feature has a view and view-model only because no API operation is connected. Use explicit function names, small modules, typed inputs, and readable error states. Avoid a generic service layer with no concrete behavior.

For a feature with real data, the route chooses the screen; the screen renders state and forwards events; the view-model controls request lifecycle; the adapter calls GraphQL or device APIs; the model contains pure rules and contract types. Dependencies point toward pure rules. A screen must not call SecureStore or decide server permission, and a model must not import React.

Use one owner for each kind of state: local input stays in the screen/view-model; server data belongs to the chosen query cache; identity comes from the verified server session. On identity change, cancel or ignore stale responses and remove private cache data. Do not represent permission using only a disabled button.

The first real mobile feature, public services, shows the pattern without a cache library: `app/services.tsx` is the route; `ServicesScreen.tsx` renders; `useServicesViewModel.ts` owns loading/pagination/retry; `serviceApi.ts` performs the public GraphQL request; `serviceModel.ts` validates the small response shape and merges pages by unique server ID. This flow has no private cache or session dependency.

Cross-screen mobile localization uses one narrowly scoped context rather than a generic global store. `localizationModel.ts` owns typed language codes, keys, and pure lookup; the provider owns the current in-memory choice; the switcher and screens render it. View-models expose semantic error codes instead of presentation strings so business orchestration stays independent of language.

Public services keeps reload ownership in `useServicesViewModel.ts`: retry and pull-to-refresh share one guarded reload action. The screen only forwards the native refresh gesture and renders its state; it does not create transport requests itself.

`serviceApi.ts` owns the bounded public-request signal. It forwards caller cancellation into an inner signal, disposes its timer/listener after settlement, and lets the view-model retain its existing generic error mapping. This keeps timeout mechanics out of the screen and leaves the caller's cancellation authority intact.

`serviceModel.ts` owns public-catalog request and response shape bounds: page numbers are positive safe integers and the parsed list cannot exceed its declared page size. The adapter sends only the validated page; the screen never parses untrusted transport data.
