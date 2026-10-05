# Complete page audit — October 4, 2026

**131 pages, 262 desktop/mobile cases checked; no unresolved failures.**

## Inventory

- 19 published pages + 91 posts = 110 published content URLs.
- 19 archive pages (3 initial archives + 16 pagination pages).
- 1 retained retired page and 1 query-only attachment page.
- Separately: 166 attachment permalink redirects and 757 original/resized media-file URLs.

## Method and findings

Every row below was opened in Chromium at 1440×1000 and 390×1000. All cases returned HTTP 200 with one header/footer, no broken local images and no uncaught page errors. The 260 live-source comparisons matched full primary text, source links, titles and sampled computed fonts/colors/positions/geometry. All 91 article bodies and their shared About block are included; templates without a main element are not skipped. The retired page was checked against its retained baseline because its former live URL returns 404.

Paired full-page screenshots were captured and compared. Maximum final pixel difference above a 32-channel-value tolerance was **0.281%** (threshold 0.5%). The animated reviews area was masked for screenshot comparison only; separate browser tests verify its eight reviews and controls. The ticker was frozen for screenshots only and separately tested for movement. Three mobile screenshot-only anomalies were rechecked in fresh browser contexts and passed (0.057–0.060% differences); original anomaly details remain in the JSON report. The audit script now isolates every viewport case. This is evidence of matching captured views, not a claim that every browser or future source change is identical.

The first sweep identified and fixed a roughly 19px header offset caused by placing the skip link inside the site root. The initial main-only text assertion was also replaced with a full primary-content contract.

Reproduce with `npm run audit:pages` while the local preview runs. Full screenshots are under ignored `artifacts/page-audit/` and `artifacts/page-audit-retry/`; structured checked-in results are in [page-audit.json](page-audit.json).

## Page-by-page results

| Page | Type | Desktop | Mobile | Maximum differing pixels |
| --- | --- | --- | --- | --- |
| [Gaw Poe](https://www.gawpoe.com/) | Page | Pass | Pass | 0.000% |
| [3D printing company plans to challenge arbitrator’s $11 million award](https://www.gawpoe.com/3d-printing-company-plans-to-challenge-arbitrators-11-million-award/) | Post | Pass | Pass | 0.060% |
| [9th Circ. Grants Atty Fee Appeal In Eye Drop Pricing Suit](https://www.gawpoe.com/9th-circ-grants-atty-fee-appeal-in-eye-drop-pricing-suit/) | Post | Pass | Pass | 0.060% |
| [9th Circ. Partially Kicks Back 5-Hour Energy Antitrust Suit](https://www.gawpoe.com/9th-circ-partially-kicks-back-5-hour-energy-antitrust-suit/) | Post | Pass | Pass | 0.058% |
| [9th Circ. Partly Revives $44.4M Jury Verdict Against Swisher](https://www.gawpoe.com/9th-circ-partly-revives-44-4m-jury-verdict-against-swisher/) | Post | Pass | Pass | 0.059% |
| [9th Circ. Urged To revive 5-hour energy price bias suit](https://www.gawpoe.com/9th-circ-urged-to-revive-5-hour-energy-price-bias-suit/) | Post | Pass | Pass | 0.060% |
| [9th Circ. Won’t Rehear Eye Drop Antitrust Suit Despite Dissent](https://www.gawpoe.com/9th-circ-wont-rehear-eye-drop-antitrust-suit-despite-dissent/) | Post | Pass | Pass | 0.060% |
| [9th Circuit restores attorney fees slashed over firm size](https://www.gawpoe.com/9th-circuit-restores-attorney-fees-slashed-over-firm-size/) | Post | Pass | Pass | 0.059% |
| [About Us](https://www.gawpoe.com/about/) | Page | Pass | Pass | 0.037% |
| [Antitrust](https://www.gawpoe.com/antitrust/) | Page | Pass | Pass | 0.000% |
| [Appeals court awards $500K to ex-San Francisco player Marija Galic](https://www.gawpoe.com/appeals-court-awards-500k-to-ex-san-francisco-player-marija-galic/) | Post | Pass | Pass | 0.059% |
| [Appeals court restores punitive-damages award in USF women’s basketball case](https://www.gawpoe.com/appeals-court-restores-punitive-damages-award-in-usf-womens-basketball-case/) | Post | Pass | Pass | 0.059% |
| [Appeals](https://www.gawpoe.com/appeals/) | Page | Pass | Pass | 0.000% |
| [Are the Critics Wrong? How the Robinson-Patman Act Has Been Misunderstood by Its Detractors](https://www.gawpoe.com/are-the-critics-wrong-how-the-robinson-patman-act-has-been-misunderstood-by-its-detractors/) | Post | Pass | Pass | 0.054% |
| [As the FTC Hints at Renewed Enforcement of theRobinson-Patman Act, the Usual (Dull) Knives Come Out](https://www.gawpoe.com/as-the-ftc-hints-at-renewed-enforcement-of-therobinson-patman-act-the-usual-dull-knives-come-out/) | Post | Pass | Pass | 0.012% |
| [Chris-Wimmer2](https://www.gawpoe.com/?attachment_id=1344) | Attachment | Pass | Pass | 0.067% |
| [JGREENWALT](https://www.gawpoe.com/author/jgreenwalt/) | Archive | Pass | Pass | 0.000% |
| [JGREENWALT – Page 2](https://www.gawpoe.com/author/jgreenwalt/page/2/) | Archive | Pass | Pass | 0.281% |
| [JGREENWALT – Page 3](https://www.gawpoe.com/author/jgreenwalt/page/3/) | Archive | Pass | Pass | 0.000% |
| [JGREENWALT – Page 4](https://www.gawpoe.com/author/jgreenwalt/page/4/) | Archive | Pass | Pass | 0.000% |
| [JGREENWALT – Page 5](https://www.gawpoe.com/author/jgreenwalt/page/5/) | Archive | Pass | Pass | 0.007% |
| [JGREENWALT – Page 6](https://www.gawpoe.com/author/jgreenwalt/page/6/) | Archive | Pass | Pass | 0.006% |
| [JGREENWALT – Page 7](https://www.gawpoe.com/author/jgreenwalt/page/7/) | Archive | Pass | Pass | 0.000% |
| [Nick Riseman](https://www.gawpoe.com/author/nick/) | Archive | Pass | Pass | 0.000% |
| [Nick Riseman – Page 2](https://www.gawpoe.com/author/nick/page/2/) | Archive | Pass | Pass | 0.000% |
| [Nick Riseman – Page 3](https://www.gawpoe.com/author/nick/page/3/) | Archive | Pass | Pass | 0.000% |
| [Big Law rates for small firms? US appeals court takes up fee fight](https://www.gawpoe.com/big-law-rates-for-small-firms-us-appeals-court-takes-up-fee-fight/) | Post | Pass | Pass | 0.057% |
| [Business Litigation](https://www.gawpoe.com/business-litigation/) | Page | Pass | Pass | 0.000% |
| [Cannabis Drink Maker Can’t Get Rival’s Product Blocked](https://www.gawpoe.com/cannabis-drink-maker-cant-get-rivals-product-blocked/) | Post | Pass | Pass | 0.058% |
| [Catastrophic Injury](https://www.gawpoe.com/catastrophic-injury/) | Page | Pass | Pass | 0.000% |
| [Uncategorized](https://www.gawpoe.com/category/uncategorized/) | Archive | Pass | Pass | 0.000% |
| [Uncategorized – Page 2](https://www.gawpoe.com/category/uncategorized/page/2/) | Archive | Pass | Pass | 0.000% |
| [Uncategorized – Page 3](https://www.gawpoe.com/category/uncategorized/page/3/) | Archive | Pass | Pass | 0.000% |
| [Uncategorized – Page 4](https://www.gawpoe.com/category/uncategorized/page/4/) | Archive | Pass | Pass | 0.000% |
| [Uncategorized – Page 5](https://www.gawpoe.com/category/uncategorized/page/5/) | Archive | Pass | Pass | 0.281% |
| [Uncategorized – Page 6](https://www.gawpoe.com/category/uncategorized/page/6/) | Archive | Pass | Pass | 0.094% |
| [Uncategorized – Page 7](https://www.gawpoe.com/category/uncategorized/page/7/) | Archive | Pass | Pass | 0.000% |
| [Uncategorized – Page 8](https://www.gawpoe.com/category/uncategorized/page/8/) | Archive | Pass | Pass | 0.013% |
| [Uncategorized – Page 9](https://www.gawpoe.com/category/uncategorized/page/9/) | Archive | Pass | Pass | 0.167% |
| [Christopher Wimmer](https://www.gawpoe.com/christopher-wimmer/) | Page | Pass | Pass | 0.037% |
| [Christopher Wimmer1](https://www.gawpoe.com/christopher-wimmer1/) | Retained legacy | Pass | Pass | Baseline |
| [Contact Us](https://www.gawpoe.com/contact-us/) | Page | Pass | Pass | 0.091% |
| [Convenience stores sue Pepsi and Frito-Lay, alleging price discrimination](https://www.gawpoe.com/convenience-stores-sue-pepsi-and-frito-lay-alleging-price-discrimination/) | Post | Pass | Pass | 0.060% |
| [Dream of Leaving Big Law to Launch a Litigation Boutique? These Two Lawyers Made it Work](https://www.gawpoe.com/dream-of-leaving-big-law-to-launch-a-litigation-boutique-these-two-lawyers-made-it-work/) | Post | Pass | Pass | 0.050% |
| [Drugmaker Gilead Alleges Counterfeiting Ring Sold Its HIV Drugs](https://www.gawpoe.com/drugmaker-gilead-alleges-counterfeiting-ring-sold-its-hiv-drugs/) | Post | Pass | Pass | 0.050% |
| [Emotional Abuse in College Sports](https://www.gawpoe.com/emotional-abuse-in-college-sports/) | Post | Pass | Pass | 0.054% |
| [Ex-USF basketball player awarded $750,000 in case against school, head coach Molly Goodenbour](https://www.gawpoe.com/ex-usf-basketball-player-awarded-750000-in-case-against-school-head-coach-molly-goodenbour/) | Post | Pass | Pass | 0.055% |
| [Eye Drops Must Sell On Even Terms Under Rare Antitrust Win](https://www.gawpoe.com/eye-drops-must-sell-on-even-terms-under-rare-antitrust-win/) | Post | Pass | Pass | 0.060% |
| [Flood of ‘Outlaw’ Sex Pill Lawsuits Draws Posse of Defense Lawyers Ready to Fight](https://www.gawpoe.com/flood-of-outlaw-sex-pill-lawsuits-draws-posse-of-defense-lawyers-ready-to-fight/) | Post | Pass | Pass | 0.050% |
| [Flora Vigo](https://www.gawpoe.com/flora-vigo/) | Page | Pass | Pass | 0.032% |
| [FRACTIONAL GENERAL COUNSEL](https://www.gawpoe.com/fractional-general-counsel/) | Page | Pass | Pass | 0.000% |
| [Oral arguments in Basketball Abuse Case](https://www.gawpoe.com/galic-v-goodenbour/) | Post | Pass | Pass | 0.054% |
| [Gaw \| Poe LLP Assists in Sending Real Estate Investor to Prison](https://www.gawpoe.com/gaw-poe-llp-assists-in-sending-real-estate-investor-to-prison/) | Post | Pass | Pass | 0.040% |
| [Gaw \| Poe LLP Attorney Mark Poe Wins Two Different $10+ Million Appeals On The Same Day](https://www.gawpoe.com/gaw-poe-llp-attorney-mark-poe-wins-two-different-10-million-appeals-on-the-same-day/) | Post | Pass | Pass | 0.037% |
| [Gaw \| Poe LLP Awarded Over $895,000 in Attorney’s Fees and Costs in Civil Rico Lawsuit](https://www.gawpoe.com/gaw-poe-llp-awarded-over-895000-in-attorneys-fees-and-costs-in-civil-rico-lawsuit/) | Post | Pass | Pass | 0.050% |
| [Gaw \| Poe LLP Completely Prevails on Behalf of Plaintiff in Breach of Contract and Alter Ego Lawsuit](https://www.gawpoe.com/gaw-poe-llp-completely-prevails-on-behalf-of-plaintiff-in-breach-of-contract-and-alter-ego-lawsuit/) | Post | Pass | Pass | 0.041% |
| [Gaw \| Poe LLP Earns the 37th Largest Verdict in the Nation for 2016](https://www.gawpoe.com/gaw-poe-llp-earns-the-37th-largest-verdict-in-the-nation-for-2016/) | Post | Pass | Pass | 0.043% |
| [Gaw \| Poe LLP Files Class Action Lawsuit Against CMB Export, LLC for Breach of Fiduciary Duties in Connection With Ivanpah Solar Plant Investment](https://www.gawpoe.com/gaw-poe-llp-files-class-action-lawsuit-against-cmb-export-llc-for-breach-of-fiduciary-duties-in-connection-with-ivanpah-solar-plant-investment/) | Post | Pass | Pass | 0.104% |
| [Gaw \| Poe LLP Files Class Action Lawsuit Against Only Fans for Automatically Billing Customers’ Credit Cards](https://www.gawpoe.com/gaw-poe-llp-files-class-action-lawsuit-against-onlyfans-for-automatically-billing-customers-credit-cards/) | Post | Pass | Pass | 0.032% |
| [Gaw \| Poe LLP Obtains $11.28 Million Arbitration Award Against 3D Systems Corp.](https://www.gawpoe.com/gaw-poe-llp-obtains-11-28-million-arbitration-award-against-3d-systems-corp/) | Post | Pass | Pass | 0.045% |
| [Gaw \| Poe LLP Obtains $4.4 Million Judgment Against One of the World’s Largest Pencilmakers](https://www.gawpoe.com/gaw-poe-llp-obtains-4-4-million-judgment-against-one-of-the-worlds-largest-pencilmakers/) | Post | Pass | Pass | 0.044% |
| [Gaw \| Poe LLP Obtains $44.4 Million Jury Verdict Against Swisher International, Inc.](https://www.gawpoe.com/gaw-poe-llp-obtains-44-4-million-jury-verdict-against-swisher-international-inc/) | Post | Pass | Pass | 0.042% |
| [Gaw \| Poe LLP Obtains a Civil Rico Jury Verdict Against Law Firm That Filed “Sex Pills” Lawsuits](https://www.gawpoe.com/gaw-poe-llp-obtains-a-civil-rico-jury-verdict-against-law-firm-that-filed-sex-pills-lawsuits/) | Post | Pass | Pass | 0.045% |
| [Gaw \| Poe LLP Obtains Class Certification and Defeats Motion for Summary Judgment in Lawsuit Concerning Ivanpah Solar Plant Investment](https://www.gawpoe.com/gaw-poe-llp-obtains-class-certification-and-defeats-motion-for-summary-judgment-in-lawsuit-concerning-ivanpah-solar-plant-investment/) | Post | Pass | Pass | 0.045% |
| [Gaw \| Poe LLP Obtains Class Certification for Adwords Advertisers](https://www.gawpoe.com/gaw-poe-llp-obtains-class-certification-for-adwords-advertisers/) | Post | Pass | Pass | 0.040% |
| [Gaw \| Poe LLP Obtains Inaugural Rankings in Chambers USA Legal Guide 2026](https://www.gawpoe.com/gaw-poe-llp-obtains-inaugural-rankings-in-chambers-usa-legal-guide-2026/) | Post | Pass | Pass | 0.054% |
| [Gaw \| Poe LLP Obtains Seven-Figure Robinson-Patman Act Jury Verdict Against Manufacturer of Clear Eyes; Wins Third of Three Jury Trials Held in 2023](https://www.gawpoe.com/gaw-poe-llp-obtains-seven-figure-robinson-patman-act-jury-verdict-against-manufacturer-of-clear-eyes-wins-third-of-three-jury-trials-held-in-2023/) | Post | Pass | Pass | 0.039% |
| [Gaw \| Poe LLP Obtains Six-Figure Settlement for Client](https://www.gawpoe.com/gaw-poe-llp-obtains-six-figure-settlement-for-client/) | Post | Pass | Pass | 0.047% |
| [Gaw \| Poe LLP partner Mark Poe discusses new AdSense lawsuit filed against Google](https://www.gawpoe.com/gaw-poe-llp-partner-mark-poe-discusses-new-adsense-lawsuit-filed-against-google/) | Post | Pass | Pass | 0.053% |
| [Gaw \| Poe LLP partner Randolph Gaw again named a Rising Star](https://www.gawpoe.com/gaw-poe-llp-partner-randolph-gaw-again-named-a-rising-star/) | Post | Pass | Pass | 0.056% |
| [Gaw \| Poe LLP Partner Randolph Gaw Again Selected to List of Super Lawyers](https://www.gawpoe.com/gaw-poe-llp-partner-randolph-gaw-again-selected-to-list-of-super-lawyers/) | Post | Pass | Pass | 0.056% |
| [Gaw \| Poe LLP partner Randolph Gaw named a Rising Star](https://www.gawpoe.com/gaw-poe-llp-partner-randolph-gaw-named-a-rising-star/) | Post | Pass | Pass | 0.056% |
| [Gaw \| Poe LLP partner Randolph Gaw quoted by Business Insider concerning Google’s practice of withholding payments from AdSense publishers](https://www.gawpoe.com/gaw-poe-llp-partner-randolph-gaw-quoted-by-business-insider-concerning-googles-practice-of-withholding-payments-from-adsense-publishers/) | Post | Pass | Pass | 0.047% |
| [Gaw \| Poe LLP Partner Randolph Gaw Selected to List of Super Lawyers](https://www.gawpoe.com/gaw-poe-llp-partner-randolph-gaw-selected-to-list-of-super-lawyers/) | Post | Pass | Pass | 0.056% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Again Selected to List of Super Lawyers](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-again-selected-to-list-of-super-lawyers/) | Post | Pass | Pass | 0.058% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Both Selected to List of Super Lawyers for Fifth Straight Year](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-both-selected-to-list-of-super-lawyers-for-fifth-straight-year/) | Post | Pass | Pass | 0.057% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Both Selected to List of Super Lawyers for Fourth Straight Year](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-both-selected-to-list-of-super-lawyers-for-fourth-straight-year/) | Post | Pass | Pass | 0.057% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Both Selected to List of Super Lawyers for SIXTH Straight Year](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-both-selected-to-list-of-super-lawyers-for-sixth-straight-year/) | Post | Pass | Pass | 0.057% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Both Selected to List of Super Lawyers for Third Straight Year](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-both-selected-to-list-of-super-lawyers-for-third-straight-year/) | Post | Pass | Pass | 0.057% |
| [Gaw \| Poe LLP Partners Randolph Gaw and Mark Poe Selected to List of Super Lawyers](https://www.gawpoe.com/gaw-poe-llp-partners-randolph-gaw-and-mark-poe-selected-to-list-of-super-lawyers/) | Post | Pass | Pass | 0.058% |
| [Gaw \| Poe LLP prevails at trial again](https://www.gawpoe.com/gaw-poe-llp-prevails-at-trial-again/) | Post | Pass | Pass | 0.047% |
| [Gaw \| Poe LLP recognized for largest antitrust verdict in California for 2016](https://www.gawpoe.com/gaw-poe-llp-recognized-for-largest-antitrust-verdict-in-california-for-2016/) | Post | Pass | Pass | 0.062% |
| [Gaw \| Poe LLP represents inventor in lawsuit against Scotts Miracle-Gro](https://www.gawpoe.com/gaw-poe-llp-represents-inventor-in-lawsuit-against-scotts-miracle-gro/) | Post | Pass | Pass | 0.055% |
| [Gaw \| Poe LLP, Stella Systems Prevail on MedeAnalytics’ Motion for Preliminary Injunction](https://www.gawpoe.com/gaw-poe-llp-stella-systems-prevail-on-medeanalytics-motion-for-preliminary-injunction/) | Post | Pass | Pass | 0.036% |
| [Gaw \| Poe LLP Successfully Defends Client at Arbitration Against Leading Hawaii Law Firm](https://www.gawpoe.com/gaw-poe-llp-successfully-defends-client-at-arbitration-against-leading-hawaii-law-firm/) | Post | Pass | Pass | 0.041% |
| [Gaw \| Poe LLP Successfully Defends Jury Verdict on Appeal](https://www.gawpoe.com/gaw-poe-llp-successfully-defends-jury-verdict-on-appeal/) | Post | Pass | Pass | 0.048% |
| [Gaw \| Poe LLP wins another jury trial](https://www.gawpoe.com/gaw-poe-llp-wins-another-jury-trial/) | Post | Pass | Pass | 0.043% |
| [Gaw \| Poe Partners Randolph Gaw and Mark Poe Admitted to Practice Before U.S. Supreme Court](https://www.gawpoe.com/gaw-poe-partners-randolph-gaw-and-mark-poe-admitted-to-practice-before-u-s-supreme-court/) | Post | Pass | Pass | 0.060% |
| [Getaround early investor sues car-sharing startup for $1.79 million](https://www.gawpoe.com/getaround-early-investor-sues-car-sharing-startup-for-1-79-million/) | Post | Pass | Pass | 0.046% |
| [Getaround’s Alleged Earliest Investor Files Suit for Alleged Fraud Against the Carsharing Company, CEO Sam Zaid, CFO Adam Kosmicki](https://www.gawpoe.com/getarounds-alleged-earliest-investor-files-suit-for-alleged-fraud-against-the-carsharing-company-ceo-sam-zaid-cfo-adam-kosmicki/) | Post | Pass | Pass | 0.037% |
| [Google Advertisers’ $7M Deal In False Traffic Suit OK’d](https://www.gawpoe.com/google-advertisers-7m-deal-in-false-traffic-suit-okd/) | Post | Pass | Pass | 0.058% |
| [Google to Refund Advertisers After Suit Over Fraud Scheme](https://www.gawpoe.com/google-to-refund-advertisers-after-suit-over-fraud-scheme/) | Post | Pass | Pass | 0.049% |
| [How a legal brawl over ‘male enhancement’ pills led to a RICO verdict against this LA firm](https://www.gawpoe.com/how-a-legal-brawl-over-male-enhancement-pills-led-to-a-rico-verdict-against-this-la-firm/) | Post | Pass | Pass | 0.058% |
| [In battle over booze pricing, is the FTC out of touch or retro-chic?](https://www.gawpoe.com/in-battle-over-booze-pricing-is-the-ftc-out-of-touch-or-retro-chic/) | Post | Pass | Pass | 0.059% |
| [Inside the $44 million lawsuit Jacksonville-based Swisher International lost](https://www.gawpoe.com/inside-the-44-million-lawsuit-jacksonville-based-swisher-international-lost/) | Post | Pass | Pass | 0.061% |
| [Is $1,314 Per Hour Too Much For A Small Firm? Court Says No](https://www.gawpoe.com/is-1314-per-hour-too-much-for-a-small-firm-court-says-no/) | Post | Pass | Pass | 0.060% |
| [It’s Not The Size Of The Firm, It’s How You Use It: Ninth Circuit Smacks Down Fee-Shaming Of Small Law](https://www.gawpoe.com/its-not-the-size-of-the-firm-its-how-you-use-it-ninth-circuit-smacks-down-fee-shaming-of-small-law/) | Post | Pass | Pass | 0.060% |
| [Judge Challenges OnlyFans’ Dismissal Bid in Subscription Renewal Class Action](https://www.gawpoe.com/judge-challenges-onlyfans-dismissal-bid-in-subscription-renewal-class-action/) | Post | Pass | Pass | 0.057% |
| [Judge Rules In Epic Battle Over Prominent Market And Castro Site](https://www.gawpoe.com/judge-rules-in-epic-battle-over-prominent-market-and-castro-site/) | Post | Pass | Pass | 0.052% |
| [Judge Who Took Axe to Lawyers’ Rates Says Size (of Firm) Matters](https://www.gawpoe.com/judge-who-took-axe-to-lawyers-rates-says-size-of-firm-matters/) | Post | Pass | Pass | 0.060% |
| [Justices Reject 5-Hour Energy’s Attack On Unfair Pricing Test](https://www.gawpoe.com/justices-reject-5-hour-energys-attack-on-unfair-pricing-test/) | Post | Pass | Pass | 0.059% |
| [Justices Won’t Hear Appeal Of Long-Running Swisher Case](https://www.gawpoe.com/justices-wont-hear-appeal-of-long-running-swisher-case/) | Post | Pass | Pass | 0.060% |
| [Randolph Gaw interviewed on Khurram’s Quorum Podcast](https://www.gawpoe.com/khurrams-quorum-podcase/) | Post | Pass | Pass | 0.055% |
| [Kristin Menon](https://www.gawpoe.com/kristin-menon/) | Page | Pass | Pass | 0.037% |
| [Oral arguments in Clear Eyes Robinson Patman Case](https://www.gawpoe.com/la-international-corp-v-prestige-brands-holdings/) | Post | Pass | Pass | 0.052% |
| [Law Firm Must Face RICO Claims Over Sex Pill Litigation ‘Scheme,’ Judge Rules](https://www.gawpoe.com/law-firm-must-face-rico-claims-over-sex-pill-litigation-scheme-judge-rules/) | Post | Pass | Pass | 0.050% |
| [Lawsuit based on a surreptitiously recorded phone call claims Google doesn’t refund advertisers who spend money on fraudulent clicks](https://www.gawpoe.com/lawsuit-based-on-a-surreptitiously-recorded-phone-call-claims-google-doesnt-refund-advertisers-who-spend-money-on-fraudulent-clicks/) | Post | Pass | Pass | 0.045% |
| [Mark Poe](https://www.gawpoe.com/mark-poe/) | Page | Pass | Pass | 0.027% |
| [Meta Hit With Textbook Authors’ IP Suit Over AI Training](https://www.gawpoe.com/meta-hit-with-textbook-authors-ip-suit-over-ai-training/) | Post | Pass | Pass | 0.060% |
| [Ninth Circuit Orders Reinstatement of $44 Million Jury Verdict Against Maker of Swisher Sweets Cigars](https://www.gawpoe.com/ninth-circuit-orders-reinstatement-of-44-million-jury-verdict-against-maker-of-swisher-sweets-cigars/) | Post | Pass | Pass | 0.031% |
| [Ninth Circuit Snuffs Out Gibson Dunn’s $44M Save in Fight over Cigarillos](https://www.gawpoe.com/ninth-circuit-snuffs-out-gibson-dunns-44m-save-in-fight-over-cigarillos/) | Post | Pass | Pass | 0.052% |
| [Okay for Jury to Hear Anti-Japanese Remarks at Federal Fraud Trial?](https://www.gawpoe.com/okay-for-jury-to-hear-anti-japanese-remarks-at-federal-fraud-trial/) | Post | Pass | Pass | 0.030% |
| [OnlyFans Users Ask 9th Circ. To Revive Calif. Auto-Renew Suit](https://www.gawpoe.com/onlyfans-users-ask-9th-circ-to-revive-calif-auto-renew-suit/) | Post | Pass | Pass | 0.058% |
| [Paul Martin](https://www.gawpoe.com/paul-martin/) | Page | Pass | Pass | 0.046% |
| [Pepsi, Frito-Lay Accused of favoring chains with chip prices](https://www.gawpoe.com/pepsi-frito-lay-accused-of-favoring-chains-with-chip-prices/) | Post | Pass | Pass | 0.060% |
| [Practice Areas](https://www.gawpoe.com/practice-areas/) | Page | Pass | Pass | 0.000% |
| [Press](https://www.gawpoe.com/press/) | Page | Pass | Pass | 0.001% |
| [Randolph Gaw Named Fellow of Litigation Counsel of America](https://www.gawpoe.com/randolph-gaw-named-fellow-of-litigation-counsel-of-america/) | Post | Pass | Pass | 0.046% |
| [RANDOLPH GAW NAMED SENIOR FELLOW OF LITIGATION COUNSEL OF AMERICA](https://www.gawpoe.com/randolph-gaw-named-senior-fellow-of-litigation-counsel-of-america/) | Post | Pass | Pass | 0.042% |
| [Randolph Gaw](https://www.gawpoe.com/randolph-gaw/) | Page | Pass | Pass | 0.026% |
| [Small businesses claim unfair snack pricing by frito-lay](https://www.gawpoe.com/small-businesses-claim-unfair-snack-pricing-by-frito-lay/) | Post | Pass | Pass | 0.056% |
| [Swisher Accused Of Anti-Competitive Cigarillo Sabotage](https://www.gawpoe.com/swisher-accused-of-anti-competitive-cigarillo-sabotage/) | Post | Pass | Pass | 0.030% |
| [Team](https://www.gawpoe.com/team/) | Page | Pass | Pass | 0.000% |
| [The Elevator Pitch](https://www.gawpoe.com/the-elevator-pitch/) | Post | Pass | Pass | 0.022% |
| [Tobacco Co. Calls Rival’s $10M Fee Bid A Waste Of Time](https://www.gawpoe.com/tobacco-co-calls-rivals-10m-fee-bid-a-waste-of-time/) | Post | Pass | Pass | 0.059% |
| [Tobacco Co. Gets $10.8M In Fees For Breach Of Contract Win](https://www.gawpoe.com/tobacco-co-gets-10-8m-in-fees-for-breach-of-contract-win/) | Post | Pass | Pass | 0.060% |
| [Oral arguments in Trendsettah v. Swisher III](https://www.gawpoe.com/trendsettah-v-swisher/) | Post | Pass | Pass | 0.057% |
| [Trial Work](https://www.gawpoe.com/trial-work/) | Page | Pass | Pass | 0.000% |
| [United Airlines Passenger Files Lawsuit Over Alleged Mechanic Mishap in Flight 931 USA – English](https://www.gawpoe.com/united-airlines-passenger-files-lawsuit-over-alleged-mechanic-mishap-in-flight-931-usa-english/) | Post | Pass | Pass | 0.040% |
| [US appeals court says law firm’s size doesn’t limit legal fees](https://www.gawpoe.com/us-appeals-court-says-law-firms-size-doesnt-limit-legal-fees/) | Post | Pass | Pass | 0.060% |
| [Victor Meng](https://www.gawpoe.com/victor-meng/) | Page | Pass | Pass | 0.034% |
