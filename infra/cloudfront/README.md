# AWS launch runbook

The site is static files in the S3 bucket `jameslittlefield.net` (region `us-east-1`), served through CloudFront. CloudFront fronts the S3 website endpoint. Merging to `main` uploads the files (see the deploy section of the top-level README). The steps below change the AWS settings around them. They are a one-time launch, done by hand, in the order given.

Files in this folder:

- `viewer-request.js`: the CloudFront Function. It sends trailing-slash URLs and old paths away with a 301 and rewrites clean URLs such as `/projects` to `/projects/index.html`. Its tests are in `tests/infra/viewer-request.test.ts`.

## Before you start

The AWS CLI is not installed on this Mac. Install it and sign in, or use the console path given with each step.

```bash
brew install awscli
aws configure   # access key, secret, default region us-east-1, output json
aws sts get-caller-identity   # confirms the credentials work
```

Use an IAM identity with CloudFront function and distribution rights and `s3:PutBucketWebsite` for `aws configure`; the GitHub deploy keys likely cannot do these.

Every step below also lists where to find the same setting in the AWS console, so you can skip the CLI entirely. Wherever a command needs the distribution ID, it is the `CLOUDFRONT_DISTRIBUTION_ID` repository secret (also on the CloudFront distributions page). Set it once for the shell:

```bash
export DIST_ID=<the distribution ID>
```

### Save the current settings for rollback

Write these to a folder outside the repo, not into it.

```bash
mkdir -p ~/aws-portfolio-backup
aws cloudfront get-distribution-config --id $DIST_ID > ~/aws-portfolio-backup/distribution-before.json
aws s3api get-bucket-website --bucket jameslittlefield.net > ~/aws-portfolio-backup/bucket-website-before.json
```

Console: CloudFront, the distribution, Behaviors and Error pages tabs (screenshot them), and S3, the bucket, Properties, Static website hosting.

## Launch order

1. Merge to `main`.
2. Set the bucket ErrorDocument to `404.html`.
3. Create the function.
4. Test the function.
5. Publish the function and attach it to the default behavior.
6. Swap the error responses.
7. Invalidate.

Between steps 1 and 5 the live site is in a mixed state: the new files are up, but `/projects` and the other clean URLs only work once the function is attached. Do steps 2 to 7 in one sitting.

### 1. Merge, which deploys

Merging to `main` runs the deploy job. Wait for it to finish (GitHub, Actions tab). It uploads the files and invalidates `/*`, but the old CloudFront settings are still in place.

### 2. Bucket ErrorDocument to 404.html

Today the bucket's ErrorDocument is `index.html`, which is why every unknown path returns the home page with a 404 status. Point it at the real 404 page. Open `bucket-website-before.json` first. The command below replaces the whole website configuration, so keep any other fields it contains (for example routing rules). The index document stays `index.html`.

```bash
aws s3api put-bucket-website --bucket jameslittlefield.net \
  --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"404.html"}}'
```

Console: S3, the bucket, Properties, Static website hosting, Edit, Error document `404.html`.

### 3. Create the function

From the repo root (the `fileb://` path is relative):

```bash
aws cloudfront create-function \
  --name portfolio-viewer-request \
  --function-config '{"Comment":"Trailing slash, redirects and index.html rewrite","Runtime":"cloudfront-js-2.0"}' \
  --function-code fileb://infra/cloudfront/viewer-request.js
```

The output includes an `ETag`. Keep it for the next step. The function is created in the DEVELOPMENT stage, so it does not affect live traffic yet.

Console: CloudFront, Functions, Create function, runtime `cloudfront-js-2.0`, paste the contents of `viewer-request.js`, Save changes.

To change the function after it exists, see "Updating the function later" below. Do not run `create-function` again.

### 4. Test the function

Create three event files outside the repo. Each has the same shape, with a different `uri`:

```bash
cd ~/aws-portfolio-backup
for uri in /projects/ /about /projects/open-door; do
  name=$(echo "$uri" | tr '/' '_')
  cat > "event$name.json" <<JSON
{"version":"1.0","context":{"eventType":"viewer-request"},"viewer":{"ip":"198.51.100.10"},"request":{"method":"GET","uri":"$uri","headers":{},"cookies":{},"querystring":{}}}
JSON
done
```

Run each one. Use the ETag from step 3 (or from `aws cloudfront describe-function --name portfolio-viewer-request`):

```bash
aws cloudfront test-function --name portfolio-viewer-request --if-match <ETag> \
  --stage DEVELOPMENT --event-object fileb://$HOME/aws-portfolio-backup/event_projects_.json
aws cloudfront test-function --name portfolio-viewer-request --if-match <ETag> \
  --stage DEVELOPMENT --event-object fileb://$HOME/aws-portfolio-backup/event_about.json
aws cloudfront test-function --name portfolio-viewer-request --if-match <ETag> \
  --stage DEVELOPMENT --event-object fileb://$HOME/aws-portfolio-backup/event_projects_open-door.json
```

The `FunctionOutput` in each result should be:

| uri | Expected output |
| --- | --- |
| `/projects/` | a 301 with `location` `/projects` |
| `/about` | a 301 with `location` `/` |
| `/projects/open-door` | the request with `uri` `/projects/open-door/index.html` |

`FunctionErrorMessage` should be empty and `ComputeUtilization` well under 100. Console: the function's Test tab, Event type Viewer request, set the URL path, Test function.

### 5. Publish the function and attach it

Publish (use the current ETag from `describe-function`):

```bash
aws cloudfront publish-function --name portfolio-viewer-request --if-match <ETag>
```

The output has the function ARN under `FunctionSummary.FunctionMetadata.FunctionARN`.

Then attach it as a viewer-request function on the default behavior. Fetch the config, edit it, and send it back:

```bash
aws cloudfront get-distribution-config --id $DIST_ID > ~/aws-portfolio-backup/dist-edit.json
```

In `dist-edit.json`, keep the `ETag` value aside, then reduce the file to just the `DistributionConfig` object (drop the outer `ETag` key). In `DistributionConfig.DefaultCacheBehavior`, set:

```json
"FunctionAssociations": {
  "Quantity": 1,
  "Items": [{ "FunctionARN": "<the ARN>", "EventType": "viewer-request" }]
}
```

Save it as `dist-new.json` (the bare `DistributionConfig` object) and apply it:

```bash
aws cloudfront update-distribution --id $DIST_ID --if-match <the distribution ETag> \
  --distribution-config file://$HOME/aws-portfolio-backup/dist-new.json
```

Console: CloudFront, the distribution, Behaviors, the default behavior, Edit, Function associations, Viewer request: CloudFront Functions, `portfolio-viewer-request`, Save changes.

Wait until the distribution status changes from Deploying to Deployed.

### 6. Swap the error responses

Under Error pages, today there is probably a 403 and a 404 mapping to `/index.html`. Replace both with:

| HTTP error code | Response page path | HTTP response code |
| --- | --- | --- |
| 403 | `/404.html` | 404 |
| 404 | `/404.html` | 404 |

Remove every mapping that points at `index.html`. In the CLI this is `DistributionConfig.CustomErrorResponses`:

```json
"CustomErrorResponses": {
  "Quantity": 2,
  "Items": [
    { "ErrorCode": 403, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 10 },
    { "ErrorCode": 404, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 10 }
  ]
}
```

Fetch the config again for a fresh ETag, edit, and run `update-distribution` as in step 5. Console: CloudFront, the distribution, Error pages, edit or delete the existing entries, Create custom error response.

### 7. Invalidate

```bash
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

Console: the distribution, Invalidations, Create invalidation, path `/*`.

## Updating the function later

Run from the repo root. `create-function` fails with FunctionAlreadyExists once the function exists, so use `update-function`. The association points at the function ARN, so the distribution does not need updating again.

```bash
aws cloudfront describe-function --name portfolio-viewer-request --stage DEVELOPMENT   # note the ETag
aws cloudfront update-function --name portfolio-viewer-request --if-match <ETag> \
  --function-config '{"Comment":"Trailing slash, redirects and index.html rewrite","Runtime":"cloudfront-js-2.0"}' \
  --function-code fileb://infra/cloudfront/viewer-request.js
```

`update-function` returns a new ETag. Then repeat step 4 (test, with that ETag) and step 5's publish (`publish-function --if-match <ETag>`), and invalidate `/*`.

## Optional: the managed security headers policy

CloudFront has a managed response headers policy named `SecurityHeadersPolicy` (ID `67f7725c-6f97-4210-82d7-5512b31e9d03`). The live site sends none of these headers today. The policy adds:

- `Strict-Transport-Security` with a max-age of one year (browsers remember to use HTTPS only)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

It does not add a Content-Security-Policy, and this runbook does not add one either. A CSP for this site has to allow the inline scripts Nuxt writes into each page and the request to the EmailJS API, and an untested policy can silently break the contact form. Write one later only if you can test it against a full generated build.

To use the policy, set `ResponseHeadersPolicyId` on the default behavior and update the distribution as in step 5. Console: Behaviors, the default behavior, Edit, Response headers policy, SecurityHeadersPolicy. Because HSTS is sticky for a year, add it only when you are sure the domain stays on HTTPS.

## Keep compression on

The default behavior must keep "Compress objects automatically" on (`Compress: true` in the config). It is on today: `/` and its JavaScript bundle return `content-encoding: br`. Without compression, the Open Door Lighthouse performance score drops to about 0.91 to 0.94. Do not change it while editing the behavior.

## Post-launch checks

Run these after the invalidation finishes. They send requests to the live site and change nothing.

### Status codes

```bash
for p in / /projects /contact /projects/open-door /nope /about /projects/ /projects/6 /projects/3; do
  printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://jameslittlefield.net$p"
done
```

Expected: `/` 200, `/projects` 200, `/contact` 200, `/projects/open-door` 200, `/nope` 404, `/about` 301, `/projects/` 301, `/projects/6` 301, `/projects/3` 301 (to `/projects`). To see where a redirect goes, use `curl -sI` and read `location`: `/about` goes to `/`, `/projects/` to `/projects`, and `/projects/6` to `/projects/resumeiq`.

### Query strings survive redirects

```bash
curl -sI 'https://jameslittlefield.net/about?q=a%26b' | grep -i '^location'
```

It must show `location: /?q=a%26b`. If it shows `q=a&b`, CloudFront hands the function decoded query values. The fix is to run `encodeURIComponent` on the name and the value in `buildQuery` in `viewer-request.js` (the comment above that function points here), update the test that pins the pass-through, and update and republish the function (see "Updating the function later", then invalidate).

### Leading slashes do not become an open redirect

```bash
curl -sI 'https://jameslittlefield.net//evil.com/' | grep -i '^location'
```

The `location` must not be `//evil.com`. The function collapses leading slashes, so the expected value is `/evil.com`, which is a path on this site.

### Images, fonts and the sitemap

An `_ipx` AVIF image. Pick a URL out of the home page (if it has `&amp;`, use `&`):

```bash
URL=$(curl -s https://jameslittlefield.net/ | grep -o '/_ipx/[^" ]*f_avif[^" ]*' | head -1 | sed 's/&amp;/\&/g')
curl -sI "https://jameslittlefield.net$URL" | grep -i '^content-type'
```

Expected: `content-type: image/avif`. The key contains an `&`, which is why the sync passes set the type explicitly.

One font. List the names with `ls .output/public/_nuxt/fonts` after `npm run generate`, then:

```bash
curl -sI 'https://jameslittlefield.net/_nuxt/fonts/<file>.woff2' | grep -i '^content-type'
curl -sI https://jameslittlefield.net/sitemap.xml | grep -i '^content-type'
```

Expected: `font/woff2` for the font and an XML type (`application/xml` or `text/xml`) for the sitemap. If either is wrong, add an explicit content-type pass for it in `infra/deploy/sync-passes.mjs` (the AVIF passes there are the pattern), update `tests/infra/sync-passes.test.ts`, and deploy again.

### Compression

```bash
curl -s -D - -o /dev/null -H 'accept-encoding: br' https://jameslittlefield.net/ | grep -i '^content-encoding'
```

Expected: `content-encoding: br`. This must be a full GET request: CloudFront compresses only those, so a header-only request (`curl -I`) never shows the header, even when compression is on.

### Form posts without JavaScript

```bash
curl -i -X POST https://jameslittlefield.net/contact
```

Expect a 404 (the page not found response). Before the JavaScript loads, the contact form is a plain `POST /contact`. CloudFront allows only GET and HEAD by default, so it answers 403, and the error response from step 6 turns that into the 404 page. The S3 website endpoint serves only GET and HEAD, so allowing POST would not help. This is accepted: the audience that sends before JavaScript loads, or with it off, is tiny, and the page offers a direct email link.

## After launch

- Submit `https://jameslittlefield.net/sitemap.xml` in Google Search Console and in Bing Webmaster Tools.
- Paste a case study URL (for example `/projects/open-door`) into the LinkedIn Post Inspector. After any hero screenshot change, scrape it again, because the share image URLs are keyed by props and LinkedIn can keep the old card.
- Spot-check in real Safari, beyond Playwright's WebKit (WebKit and Firefox are already automated): open a case study hash URL such as `/projects/folio#results` directly and confirm it lands on that section, and send a test message through the contact form.

## Rollback

1. Restore the saved settings first, so the new function and error responses are gone before the old site is uploaded (reverting first would run the old workflow's `--delete` while they are still live). For the distribution, copy only the `DistributionConfig` object from `~/aws-portfolio-backup/distribution-before.json` into a new file named `distribution-config-only.json` (the same trimming as step 5), then run `aws cloudfront get-distribution-config --id $DIST_ID` again for the current ETag (it changed with every update) and use it here:
   ```bash
   aws cloudfront update-distribution --id $DIST_ID --if-match <current ETag> \
     --distribution-config file://$HOME/aws-portfolio-backup/distribution-config-only.json
   ```
   For the bucket, re-apply `bucket-website-before.json` with `aws s3api put-bucket-website --bucket jameslittlefield.net --website-configuration file://$HOME/aws-portfolio-backup/bucket-website-before.json`.
2. Then revert the merge on `main` (a revert commit through a pull request). The deploy job uploads the previous site.
3. Invalidate `/*`.

Restoring the old distribution config also detaches the function, which can stay in CloudFront unused.
