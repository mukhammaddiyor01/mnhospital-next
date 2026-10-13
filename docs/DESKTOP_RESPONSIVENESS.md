# Desktop viewport adaptation

The public hospital shell grows with the browser viewport rather than staying at 1300px. CSS controls the layout; no screen detection, forced browser zoom, transform scaling, or persisted device settings are used.

Above 1120px the page has fluid outer gutters, 216–360px advertisement rails, and a flexible center column. The page has a 2600px upper limit for ultrawide screens. Header, footer, navigation and fixed chat controls use the same layout dimensions. From 1600px, hero text and height, header controls, rail images and selected headings grow within bounded ranges. Service and doctor directory grids add columns when sufficient space exists.

At 1120px and below, existing tablet/mobile rules remain in control. Booking/payment keeps a readable center canvas up to 960px; it does not stretch forms across the full monitor. Staff workspace styles are outside this public-shell change.

Browser layout checks performed with 1440, 1920, 2560 and 390px viewport overrides (desktop scrollbars consume 15px). Home shell widths were approximately 1325, 1766, 2355 and 375px respectively. Center navigation matched the center column. Document scroll width equaled client width in each check. A desktop boundary check at 1121px also had no horizontal overflow. Public service cards were measured with actual catalog responses.

The user's browser zoom and OS display scaling remain under user control. This layout responds to available CSS viewport width, not a monitor's physical inch size.
