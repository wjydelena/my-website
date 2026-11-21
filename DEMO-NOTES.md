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
- Drawer entry motion: 10px right-to-left over 200ms, disabled under reduced-motion preference. The pre-LIVE Coupon image remains static with no popup.
- Original live-console features remain inherited. Version 1 source and Canvas node are not changed.

## Validation
- Production build succeeds.
- Targeted native-browser checks passed for selection, cancellation, confirmation, deduplication, search/reset, focus handling, 1120px width and constrained-height drawer scrolling, selected-row transfer and existing Prompter access. No page runtime exceptions in these checks.
- All three requested states were screenshot-compared at 1440×900 with DPR 2, using original extracted assets and TikTok Text fonts. Minor antialiasing and subpixel differences remain; no pixel-perfect claim.
- Fixed viewport clips were used after narrow-width testing; a stale beyond-viewport screenshot was discarded.
- An automatic final comparison mispaired the Chat region with an Analytics row, so its aggregate score is not treated as reliable. Full paired screenshots were visually reviewed instead.
- Frozen Flow retains all 32 original journey identities and 256 capture occurrences. Repeated overview/education captures with equivalent coverage in other journeys were reassigned to the pre-LIVE entry, both picker tabs and confirmed result; original non-capture interaction steps were retained. All legacy journeys include the local Go LIVE setup. Full replay is deferred, not claimed as tested.

- Create promotion menus show only LIVE flash sale, Group deal and Price cut. Order-level promotion options and their section are removed; existing visuals and option-click behavior are unchanged.

- Per-product Promo now follows 4.png: compact Create Flash Sale / Create Price Cut / Create Group Deal menu. The footer Create promotion chooser is unchanged.
- Flash Sale follows 5.png and 6.png through the product step and configuration step. The clicked product is carried in; original name, price and stock use actual picker data rather than conflicting screenshot examples. Product inputs, checked-row batch edits and nested Add product use local draft state.
- Scope ends at the supplied configuration screen. Its final Next does not open an invented following screen or submit a real promotion; no Price Cut/Group Deal creation screens, variation SKU rows, recurring schedule or scheduled-start date form were supplied.
- Blank-area clicks no longer replay Customize layout education; automatic first-entry introduction and the layout editor are retained.
- New Flow states reuse three redundant 1440px overview capture occurrences. All previous distinct capture IDs remain represented, with 32 journeys and 256 capture occurrences.


## v1.7 · All product-related demo prices $100.00
- User-authorized pricing override supersedes the earlier choice to preserve picker source prices. My shop, Showcase, selected product cards, default LIVE products, crossed-out prices, Flash Sale original/deal prices, nested product addition, Price Cut/Group Deal examples, auction/bid prices, gift amount/minimum-spend examples, product purchase activity and moderator product-price messages all use $100.00.
- Prompter product and video-preview prices continue to derive from the same product data. Editing remains supported; clearing a deal-price input remains possible without changing its default for untouched/new rows.
- Product names/images, stock, purchase limits, quantities, claim counts, timings, percentages, GMV, existing layout/animations and the two-step Flash Sale scope are unchanged.
- Promotion action labels in UI Flow are synchronized; all 32 journeys and 256 capture occurrences are retained. Version 1 is not modified.
