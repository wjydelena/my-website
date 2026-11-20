# Usability demo · Pre-LIVE and product picker

## Implemented
- Default entry: not-yet-live console, matching supplied 1440×900 screenshots.
- Add products: My shop (5 reference rows) and Showcase products (4 reference rows).
- Individual selection, select all/indeterminate, cross-tab draft preservation, name/ID search, Reset.
- Cancel, Close, Escape, backdrop dismissal; focus trap and trigger focus restoration.
- Confirmed selections added to Buy now; existing rows cannot be added twice.
- Go LIVE now and Practice switch to the inherited local live-console simulation. Confirmed rows carry over.

## Boundaries
- All shop data, selection and broadcasting transitions are local simulation. No business backend is connected.
- LIVE product set, Product URL, price/category/more filtering and Copy from previous LIVE are visible but disabled. Their content/workflows were not supplied.
- Added-product layout now follows supplied 11.png: ranks, 70px thumbnails, pricing, Promo/Edit/More actions and Coupon count. Actual selected product names, stock and prices are retained because reference data conflicts with picker data. Product quantity is not forced to the seven example rows. Row operations reuse local editor, promotion chooser and deletion-confirmation conventions.
- Drawer entry motion: 10px left-to-right over 200ms, disabled under reduced-motion preference. The pre-LIVE Coupon image remains static with no popup.
- Original live-console features remain inherited. Version 1 source and Canvas node are not changed.

## Validation
- Production build succeeds.
- Targeted native-browser checks passed for selection, cancellation, confirmation, deduplication, search/reset, focus handling, 1120px width and constrained-height drawer scrolling, selected-row transfer and existing Prompter access. No page runtime exceptions in these checks.
- All three requested states were screenshot-compared at 1440×900 with DPR 2, using original extracted assets and TikTok Text fonts. Minor antialiasing and subpixel differences remain; no pixel-perfect claim.
- Fixed viewport clips were used after narrow-width testing; a stale beyond-viewport screenshot was discarded.
- An automatic final comparison mispaired the Chat region with an Analytics row, so its aggregate score is not treated as reliable. Full paired screenshots were visually reviewed instead.
- Frozen Flow retains all 32 original journey identities and 256 capture occurrences. Repeated overview/education captures with equivalent coverage in other journeys were reassigned to the pre-LIVE entry, both picker tabs and confirmed result; original non-capture interaction steps were retained. All legacy journeys include the local Go LIVE setup. Full replay is deferred, not claimed as tested.
