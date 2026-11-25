# Design patterns

Organize each mobile feature as `app/` route → `src/features/<name>/` view → view-model hook → API adapter → pure model. The initial home feature has a view and view-model only because no API operation is connected. Use explicit function names, small modules, typed inputs, and readable error states. Avoid a generic service layer with no concrete behavior.
