# Design patterns

Organize each mobile feature as `app/` route → `src/features/<name>/` view → view-model hook → API adapter → pure model. The initial home feature has a view and view-model only because no API operation is connected. Use explicit function names, small modules, typed inputs, and readable error states. Avoid a generic service layer with no concrete behavior.

For a feature with real data, the route chooses the screen; the screen renders state and forwards events; the view-model controls request lifecycle; the adapter calls GraphQL or device APIs; the model contains pure rules and contract types. Dependencies point toward pure rules. A screen must not call SecureStore or decide server permission, and a model must not import React.

Use one owner for each kind of state: local input stays in the screen/view-model; server data belongs to the chosen query cache; identity comes from the verified server session. On identity change, cancel or ignore stale responses and remove private cache data. Do not represent permission using only a disabled button.

The first real mobile feature, public services, shows the pattern without a cache library: `app/services.tsx` is the route; `ServicesScreen.tsx` renders; `useServicesViewModel.ts` owns loading/pagination/retry; `serviceApi.ts` performs the public GraphQL request; `serviceModel.ts` validates the small response shape. This flow has no private cache or session dependency.
