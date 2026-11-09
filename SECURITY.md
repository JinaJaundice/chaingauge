# Security policy

This policy explains how to report a vulnerability in ChainGauge and what to expect after a report.

## Reporting a vulnerability

Please report a vulnerability privately through the private vulnerability report of the repository on GitHub, and do not open a public issue. The report form opens from the button 'Report a vulnerability' under the Security tab of https://github.com/JinaJaundice/chaingauge.

A report is most useful when it names the page or the endpoint, the steps to reproduce the problem and the effect that it has. Please do not include another person's data.

## What the maintainer will do

The maintainer reads every report and replies when they can. The project gives no promised time for an acknowledgement or for a fix, and it sets no fixed period of coordinated disclosure. The maintainer will tell the reporter what they find, and will credit a reporter in the changelog where the reporter agrees.

## Supported versions

Only the live site and the latest commit on `main` receive security fixes.

## Scope

The following are in scope:

- the site at https://chaingauge.app and the feed at https://chaingauge.app/ratings.json
- the submission function in `api/feedback.ts`, its checks on each submission and the way it files a submission in the private queue
- the handling of submitted text, which must remain evidence and must never become an instruction to a coding agent, as `docs/CONTRIBUTIONS.md` describes
- the build and its checks in `web/scripts`.

The following are out of scope:

- a disagreement with a rating, which goes through the Contribute page at https://chaingauge.app/#/contribute
- the third-party sites that the ratings cite
- any test that sends a large number of requests to the live site. Please test against a local build, as `docs/RUNBOOK.md` describes.
