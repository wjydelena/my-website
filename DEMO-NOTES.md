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


## v1.8 · Confirm Flash Sale and return to product list
- The new uploaded reference supersedes the previous Step 2: only manual/specified start options, manual selected by default, 10-second countdown, empty duration placeholder, Cancel / Confirm footer. Step 1 Next and all existing row/batch/nested-picker interactions remain.
- Confirm saves a local per-product Flash Sale and closes the drawer. The corresponding product displays the original reference's expanded unstarted promotion block, price, total purchase limit, collapse arrow and edit/delete icons cropped from 12.png. Untouched total purchase limits use the shown demo value 50; existing product names, stock, selection and $100.00 defaults remain. Nested added products are merged into the list without duplicating existing products or replacing their metadata.
- Cancel, close, Escape and backdrop never commit a promotion or an edit. Edit reuses the two supplied steps with saved values and updates the same promotion ID. Delete removes only that promotion. Records remain attached through search, reordering, selling-mode tabs and layout editing; the base-product conversion also carries their metadata. No live-business service or submission is called.
- Replaced the previous no-final-submit limitation with the user-provided confirmation outcome. The specified-time radio remains selectable, without inventing an unprovided date/time form.
- UI Flow integrates confirmation/cancellation/collapse/edit/delete into the existing visual-review journey. Seven redundant 1440px wide-overview capture occurrences were replaced with seven new confirmation states, preserving every previous distinct capture ID/viewport and staying at 32 journeys / 256 captures.

### v1.8 verification
- Build passed. Native targeted checks passed for confirm/cancel, per-product associations, nested addition/metadata preservation, collapse, edit-without-duplication, cancel edit, delete-only-promotion, 1120px containment and saved duration. Selected-product, Go LIVE/Practice, price-$100, batch editing and entry-education regressions passed. Step 2 keyboard focus cycles through Cancel/Confirm and Enter submits the local confirmation.
- Repeated fresh runs of the confirmation paths recorded no runtime exceptions. A one-off initial event did not recur in the two following complete runs. Later ancillary tests failed to load because the preview service had stopped; after restoring it they passed.
- Exact summary bounds at 1440x900: x117,y253,w473.39,h88; next product y361, preserving 20px list gap. Footer Cancel/Confirm: 86/94 by 40px, gap8px, right/bottom20px.
- Reviewed fresh full-page screenshots and the cropped promotion comparison. Promotion segmentation follows its header/details; final crop score97.33. The full configuration score99.2 is not relied on as a fidelity claim because some automatically segmented bands cut through cards. Manual source/reference geometry and full screenshots are the layout evidence; no pixel-perfect claim.
