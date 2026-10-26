# Facebook news setup

The homepage renders up to six cached published Page posts as dark-and-gold news cards. No Facebook token is sent to visitors. Images use Facebook-hosted URLs; a later sync refreshes them if they expire. Failed API calls preserve the last successful cache.

## Activate

1. In Meta for Developers, configure an app authorized to read the Enochian Tongues Facebook Page. Obtain a Page access token with the required Page-reading permissions (typically `pages_read_engagement`; listing your managed Pages also uses `pages_show_list`). Meta may require app review or business verification depending on the app and access level. Check the current Pages API documentation: https://developers.facebook.com/docs/pages-api/posts/.
2. Confirm the actual Page ID through Meta's Page/API tools. The ID in a public profile URL is not independently verified as the API Page ID.
3. In this GitHub repository, open Settings → Secrets and variables → Actions. Add repository secrets `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN`. Do not paste the token into chat or commit it to source files.
4. Optionally set repository variable `FACEBOOK_GRAPH_VERSION` to the supported version used by your Meta app. The implementation defaults to `v23.0`.
5. The production site is hosted in Namecheap cPanel at https://enochiantongues.com/. Keep GitHub Actions enabled to refresh the public JSON cache. GitHub Pages is only a secondary deployment; it does not upload changes to cPanel.
6. Open Actions → Sync Facebook news → Run workflow. Confirm both the sync and deployment jobs succeed, then inspect Latest News at https://enochiantongues.com/.

The workflow runs approximately every six hours on the default branch, on site-file pushes to main, and can be run manually. GitHub may delay schedules or disable them after prolonged repository inactivity. Renew revoked or expired Page credentials in Secrets. It reads posts; it never publishes to Facebook.

## Current status

Activated October 15, 2026: Meta credentials are saved in GitHub Actions Secrets, Page ID 844747345393745 is confirmed, and the initial import and Pages deployment succeeded with two posts. Site-file pushes to main also trigger the sync and deployment workflow. Public Page-authored posts only are requested through `/published_posts`; unpublished and hidden entries are excluded. Only selected display fields are saved to the public cache. Comments, messages, access tokens and API response metadata are not published.


## Production feed settings

The home page loads the latest public cache from:
`https://raw.githubusercontent.com/jjswebdev/enochian-tongues/main/data/facebook-posts.json`

If that request fails, times out after eight seconds, or returns invalid data, it tries the bundled `data/facebook-posts.json`. A valid empty feed leaves the Facebook link visible. No Page access token is exposed in either source.

Upload `assets/news.js` and the updated `index.html` to cPanel when changing this integration. Once installed, scheduled news refreshes appear without uploading files again. New posts appear first; the page displays up to six eligible posts. The three exclusions in `scripts/sync-facebook.mjs` remain in place.

Changing the website domain does not require replacing the Page ID or token: the browser reads a public JSON file, and GitHub Actions handles authenticated Facebook access. Do not change credentials merely for this hosting migration.
