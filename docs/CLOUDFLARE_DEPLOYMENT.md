# Cloudflare Pages deployment

Build with `npm run build:cloudflare && npm test`, using Node.js 22 and
`dist-cloudflare` as the output directory. The ordinary `npm run build` output
in `dist` remains suitable for GitHub Pages and retains the original media.

The Cloudflare preparation step copies the production site, removes GitHub's
`CNAME` file, and checks the entire deployment against the free plan's file count
and 25 MiB individual asset limit. Unexpected oversized files fail the build.

## Original forklift MP4

`public/assets/templates/forklift-trailer.mp4` is an original 35,947,900-byte file.
It is preserved unchanged in the repository and standard build. The Cloudflare
bundle serves its existing URL through a 302 redirect to the immutable public
GitHub copy at commit `f9c9dbd976d2916ba355cdc1d69fca21a0241985`.
The on-page WebM trailer remains a normal local Cloudflare asset.

## Domain constraint

Cloudflare rejected `playframe.qd.je` as a DNS zone on 23 October 2026 because it
requires the registrable root domain. The current Public Suffix List does not
include `qd.je`. The deSEC zone apex also contains NS, MX, and TXT records, so a
CNAME cannot be placed there alongside those records. Do not replace the mail
or nameserver records to force an apex CNAME.

A `www.playframe.qd.je` CNAME is possible with external DNS; alternatively a
separately registered domain can be onboarded to Cloudflare. The public address
and cutover must be decided before changing live DNS or canonical URLs.
