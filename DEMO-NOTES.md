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


## v1.9 · Restore the user's entered Flash Sale price and purchase limits
- Confirm now stores the actual deal-price, total purchase limit and customer purchase limit strings, without replacing cleared/empty values with $100.00 or 50. The new requirement supersedes the v1.8 hidden 50-limit fallback.
- The per-product summary displays the saved deal price in currency format and the saved total limit. Empty settings display an em dash rather than a fabricated numeric setting. Editing reloads these same stored values, including zero or deliberately cleared fields; Cancel still does not change the saved settings.
- Base-product default prices remain $100.00. Flash Sale prices can differ when entered by the user. Layout, other promotion examples and existing interactions are unchanged.
- The existing confirmation UI Flow explicitly enters 50 before capturing that configured example; all 32 journeys / 256 captures remain.

- v1.9 verification passed: $59.90/17/customer2 creation; $19.95/32/customer4 edit; cancelled edits retain saved values; batch $27.30/45/customer6 applies to both products; zero and cleared values do not trigger fallbacks. Fresh screenshot reviewed; no runtime exceptions.


## v1.10 · 3.png navigation and Version 1 product feedback
- Navigation is white with the 3.png divider, light-gray Customize button and white Prompter capsule; globe is retained in both entry and LIVE states. Sidebar assets/spacing are unchanged from the shared reference.
- Customize layout is now a static button. Its education and editor entry are not mounted. This supersedes the earlier first-entry education requirement for this Demo only; Version 1 remains untouched.
- Product cards reuse the Version 1 8px frame and 120ms gray hover feedback, including darker rank and collapsed promotion backgrounds. Promotions start collapsed, expand from the card metadata/blank region or heading and use the exact shared Version 1 white details/row/More-Start styling and original flash asset.
- Actual campaign values are retained. Edit and remove remain available from the promotion More menu; Start/Stop is local demo state, as in Version 1, not a business request. Checkbox, Promo, drag and row actions remain independent of the expansion overlay.
- Targeted native checks passed: white navigation on entry, mouse/keyboard no-op layout entry before/after Go LIVE and at 1120px; collapsed default, hover colors, full-card expansion, white aligned panel, checkbox/Promo isolation, edit/remove; expanded heading and row computed styles match Version 1 source. Screenshots reviewed after correcting inherited double margin. Entered price/total/customer, batch, zero, blank and cancel-edit regression passed with no runtime exceptions.
- UI Flow keeps its 32 journeys. 21 now-unreachable editor journeys are replaced by mouse/keyboard no-op coverage; other valid journeys stay intact. Product editing no longer tries an editor Cancel. Flash Sale captures explicitly expand the newly collapsed block and use the More menu for edit/remove. 156 capture occurrences, within bounds. No full Flow replay requested or claimed.


## v1.11 · Subtle Add products hover and white Promo
- Empty-state Add products gets a subtle gray darkening; footer and picker Add product(s) get a subtle darker teal. Background feedback uses 120ms and respects reduced motion.
- +Promo right padding is 12px; its wrapper/button width adapts to prevent crowding. Product-card hover makes the enabled Promo button white.
- Native computed-style and menu checks passed after restoring a stopped preview service. No functional or data changes; UI Flow remains unchanged.


## v1.12 · Flash Sale translucent modal drawer
- Replace the opaque #7b7b7b backdrop with 40% translucent black so underlying navigation and product information remain visible. This supersedes the earlier opaque-backdrop reference requirement.
- Modal semantics, original 1000px right drawer, steps, saved values and close behavior are unchanged.
- Build and native checks passed for transparency, retained underlying content in both steps, original width and Escape return. Fresh screenshot visually reviewed. UI Flow unchanged.


## v1.14 · Reference Create Price Cut drawer
- Added a 992px right-side Price Cut modal matching 5.1.png's pale floor, Duration card, product card/table and fixed Cancel/Create footer. The accepted translucent backdrop remains so underlying console information is visible. Actual selected product names, images, stock and original prices are retained instead of substituting screenshot examples.
- Duration presets: 15/30/45 seconds, 1/2/5/10/20 minutes. Custom active state includes h/min/s fields initialized to 00/02/30; Apply stores seconds and returns focus to the trigger. Menu width/input spacing were refined against the uploaded actual white menu bounds.
- Batch edit always opens. Options exactly match the reference labels: Bulk edit lowest price, Bulk edit participants, Bulk edit quantities. Options are disabled with no selected list rows, enable after selection and immediately disable after clearing selection. Choosing an option focuses the first selected field; editing it applies only to selected rows.
- Per-product suggested price Apply, direct fields, row removal, shared Add more picker, nested Escape, and modal closure work. Create validates required settings and saves per-product Price Cut values; summary More menu supports saved-value edit/cancel/delete. Row Promo carries the clicked product; footer Create promotion / Price cut carries the current product list.
- Existing Flash Sale records survive Price Cut creation on the same product. Base prices remain unchanged. This is local prototype state, with no business backend calls. Guide is retained as reference appearance/title only; no guide content was supplied.
- Build and native QA passed for all duration presets/options, Custom active state and Apply, disabled/enabled/re-disabled bulk menu, selected-row scope for all three fields, nested picker, actual saved values, edit/cancel/delete, both entry points, coexistence with Flash Sale, narrow containment/scroll and Escape. No runtime exceptions. Existing Flash Sale input-value regression passed. Fresh main-drawer and Custom screenshots were visually reviewed. No pixel-perfect/full-flow replay claim.
- UI Flow retains 32 journeys; one redundant disabled-layout journey is repurposed for Price Cut creation, conditional batch editing, Custom, saved-value edit/cancel/delete and footer entry. Other journeys remain. 166 capture occurrences.


## v1.15 · Single-product Create Group Deal
- Single-product +Promo / Create Group Deal opens the reference 5.2.png drawer with Type and Duration side by side, the product table (Type, Group size, Group deal price, Group deal stock), and fixed Cancel / Create footer. Single group deal is the supplied type; no unprovided type variants or guide content are invented.
- Duration displays exactly numeric 1–6, including selectable 6, without adding an unspecified unit. Group size uses the same numeric dropdown styling. Actual selected product names, images, base prices and inventory remain; suggested Apply uses 70% of the actual base price.
- Add more product retains existing draft fields, excludes duplicates and supports nested Escape. Batch options are disabled without selected rows and apply size / price / stock changes only to selected rows. Create validates and saves actual values; More supports edit, cancel and remove of the corresponding Group Deal only.
- Group Deal records merge separately by campaign id. Group Deal, Price Cut and Flash Sale coexist on the same product without replacing one another; existing base product metadata is retained. This remains local prototype state without business backend writes.
- Build and targeted native checks passed: single-product entry, six Duration options, numeric selection / Escape, suggestion Apply, add products, all three batch edits and selection gating, actual saved values, edit/cancel/delete, promotion coexistence, narrow viewport containment and runtime errors (none). Price Cut and Flash Sale entered-value regressions also passed. Fresh drawer / duration screenshots reviewed. Initial drawer-region visual comparison was 98.87 with no low regions; final minor spacing and metadata wrapping refinements reviewed visually. Product images/content differ intentionally because actual product data is preserved.
- Existing UI Flow journeys remain; Group Deal states appended to the existing promotion settings journey. 32 journeys / 173 capture occurrences. Definition frozen without a full replay. Version 1 remains unchanged.

## v1.16 · Promotion card states and direct edit/delete
- Restore Section 1.png's two-expanded, one-expanded and one-collapsed card states. Expanded details are white, collapsed summaries are light gray, and the heading arrow reflects expansion. Direct delete/edit icons align with each promotion's metadata. Promo and product-level action backgrounds follow expanded/hover/default states.
- Flash Sale, Price Cut and Group Deal rows use direct Delete and Edit settings buttons, replacing the pre-LIVE More/Start controls. Delete removes only that campaign and updates the count; deleting the last campaign hides the promo summary without deleting the product. A later new campaign defaults to collapsed; other remaining expanded campaigns stay expanded.
- Edit opens the existing corresponding creation drawer with saved values, using Edit Flash Sale / Edit Price Cut / Edit Group Deal for visible title, dialog and close labels. Existing creation fields, footer actions, save-by-campaign-ID, cancel, and creation behavior are retained.
- Actual product metadata, inventory and base prices remain unchanged. Group Deal's previously accepted numeric 1–6 duration is retained without inventing a unit. All changes are local prototype behavior; Version 1 is not revised.
- Build and focused native regressions passed for all three card states, two direct actions per promo, edit titles/saved values, update/cancel/delete, counts, selected-row batch editing, actual entered values including zero/cleared Flash Sale settings, promo coexistence, and narrow drawer containment. No runtime exceptions observed in the exercised regressions.
- Fresh card screenshots were visually reviewed. First-card comparison: 96.1 overall, no below-threshold regions; reference 538×236 vs rendered 537×236. Product/sample-text differences are intentional, not replaced with fabricated reference data. No pixel-perfect claim.
- UI Flow retains 32 journeys and 177 capture occurrences. Obsolete promo More steps are removed and direct edit/delete targets synchronized. Four representative card/deletion states are added to the existing promotion journey. Definition is frozen without a complete replay; targeted regression is not a full replay claim.
