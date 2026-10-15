# Facebook news setup

The homepage renders up to six cached published Page posts as dark-and-gold news cards. No Facebook token is sent to visitors. Images use Facebook-hosted URLs; a later sync refreshes them if they expire. Failed API calls preserve the last successful cache.

## Activate

1. In Meta for Developers, configure an app authorized to read the Enochian Tongues Facebook Page. Obtain a Page access token with the required Page-reading permissions (typically `pages_read_engagement`; listing your managed Pages also uses `pages_show_list`). Meta may require app review or business verification depending on the app and access level. Check the current Pages API documentation: https://developers.facebook.com/docs/pages-api/posts/.
2. Confirm the actual Page ID through Meta's Page/API tools. The ID in a public profile URL is not independently verified as the API Page ID.
3. In this GitHub repository, open Settings → Secrets and variables → Actions. Add repository secrets `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN`. Do not paste the token into chat or commit it to source files.
4. Optionally set repository variable `FACEBOOK_GRAPH_VERSION` to the supported version used by your Meta app. The implementation defaults to `v23.0`.
5. In Settings → Pages, select GitHub Actions as the publishing source. The sync workflow explicitly deploys the generated static site because commits made with GitHub's workflow token do not trigger a separate Pages build.
6. Open Actions → Sync Facebook news → Run workflow. Confirm both the sync and deployment jobs succeed, then inspect Latest News on the live home page.

The workflow runs approximately every six hours on the default branch, and can be run manually. GitHub may delay schedules or disable them after prolonged repository inactivity. Renew revoked or expired Page credentials in Secrets. It reads posts; it never publishes to Facebook.

## Current status

Custom cards and API integration code are installed. No live API request has been verified: Meta credentials must be configured first. The cache starts empty; the homepage displays a Facebook link until posts are fetched. Public Page-authored posts only are requested through `/published_posts`; unpublished and hidden entries are excluded. Only selected display fields are saved to the public cache. Comments, messages, access tokens and API response metadata are not published.
