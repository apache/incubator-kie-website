---
id: release-procedure
title: Release Procedure
sidebar_position: 1
---

This document describes how to perform an Apache KIE release. It covers the repositories involved, how branches and tags are named, and every step from creating a release candidate to publishing the final release.

:::note
Starting with **10.3**, all Java components (Drools, OptaPlanner, Kogito Runtimes, and Kogito Apps) were merged into a single repository called `incubator-kie`. This means the release process is now a **two-repo** workflow (one command or Jenkins job per repository) instead of the multi-repo process used in 10.2.
:::

---

## Overview

Apache KIE releases are done via Jenkins jobs, by executing scripts hosted in each of the two release repositories — [`apache/incubator-kie`](https://github.com/apache/incubator-kie) and [`apache/incubator-kie-tools`](https://github.com/apache/incubator-kie-tools). The only manual steps are closing and releasing the Nexus staging repository for `incubator-kie`, and the vote itself.

This page is the **single source of truth** for the release procedure. The `docs/RELEASING.md` files in both repositories only point here.

- For the release steps, keep reading.
- For the checklists of a minor release, a patch release and a failed vote, go to [Quick Reference Checklists](#2-quick-reference-checklists).
- For what to do when a Jenkins job fails, and whether it is safe to re-run it, go to [Troubleshooting](#3-troubleshooting).
- For who can run a release, which credentials the jobs use, where the output goes and what staging means, go to [Release Setup](#4-release-setup).
- For the toolchain versions and the release scripts of each repository, go to [Repositories & Requirements](#5-repositories--requirements).
- For how branches, tags and versions are named, go to [Branches & Tags](#6-branches--tags).
- For running the release scripts on your own machine instead of Jenkins, go to [Running the Release Locally](#7-running-the-release-locally).
- For the differences between the 10.2 and the 10.3+ release process, go to [What Changed from 10.2 to 10.3](#8-what-changed-from-102-to-103).

---

## 1. Release Steps

Releases are run via Jenkins. Every Jenkins job below lives in the stream folder of its repository — `https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/` for `incubator-kie` and `https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/` for `incubator-kie-tools` — where `{STREAM_NAME}` is the release stream (e.g. `10.3.x`). To run the scripts on your own machine instead, see [Running the Release Locally](#7-running-the-release-locally).

---

### Step 1 — Prepare for a New Minor Series

> **When:** Once per minor release series, before creating the first RC.
> **Example:** Preparing for `10.3.0` before any RC exists.

#### 1a. Create the Jenkins folder for the new stream

The `10.3.x` stream folder is created from the `main` stream folder. Remember: `main` moves forward, and every release stream derives its Jenkins folder from it. Each repository has its own `main` folder, so do this once per repository:

| Repository | `main` folder to copy | Copy it as |
|---|---|---|
| `apache/incubator-kie` | https://ci-builds.apache.org/job/KIE/job/drools/job/main/ | https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/ |
| `apache/incubator-kie-tools` | https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/ | https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/ |

1. Open the `main` folder of the repository (links above).
2. Copy it as `{STREAM_NAME}` (e.g. `10.3.x`).
3. In the copied folder, point the jobs at the stream branch `{STREAM_NAME}` of the repository.

Ignore the other folders next to `main` (`10.0.x`, `10.1.x`, `10.2.x`, ...). They belong to older, already released streams.

Do this once per minor series. Patch releases (`10.3.1`, ...) reuse the same folder.

#### 1b. Build the CI Builder Image

Trigger [`apache/incubator-kie :: release-build-kie-kogito-ci`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-build-kie-kogito-ci/) (`.ci/jenkins/Jenkinsfile.ci-image-build`) to build and publish the CI builder Docker image:
- `IMAGE_TAG`: set to the release stream (e.g. `10.3.x-latest` or `10.3.x`).

Ensure the image tag is built and pushed before starting the release candidate pipeline by checking that the tag is listed at [hub.docker.com/r/apache/incubator-kie-kogito-ci-build/tags](https://hub.docker.com/r/apache/incubator-kie-kogito-ci-build/tags).


### Step 2 — Build & Stage a Release Candidate

> **When:** Each time you're willing to create a new Release Candidate (RC) (e.g. `10.3.0-rc1`, `10.3.0-rc2`).

This step builds all artifacts, signs them, and uploads them to staging for community verification. See [Where the output goes](#where-the-output-goes) for what staging means.

#### Job Parameters

Trigger the `release-candidate` Jenkins job for both repositories. `{STREAM_NAME}` is the name of the stream folder created in Step 1a, e.g. `10.3.x`:

- `apache/incubator-kie :: release-candidate` - https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-candidate/
- `apache/incubator-kie-tools :: release-candidate` - https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-candidate/

For `10.3.x`, these are https://ci-builds.apache.org/job/KIE/job/drools/job/10.3.x/job/release-kie-release-candidate/ and https://ci-builds.apache.org/job/KIE/job/kie-tools/job/10.3.x/job/kie-tools-release-candidate/.

Set only the parameters below; all other parameters keep their default values:

| Run | `incubator-kie` | `incubator-kie-tools` |
|---|---|---|
| **First RC of a new minor** (`10.3.0-rc1`) | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc1`<br/>`CREATE_STREAM_BRANCH=true` | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc1`<br/>`CREATE_STREAM_BRANCH=true`<br/>`UPDATE_STREAM_VERSION=true` |
| **Later RC** (`10.3.0-rc2`) | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc2` | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc2` |
| **Patch** (`10.3.1-rc1`) | `RELEASE_VERSION=10.3.1`<br/>`TAG_NAME=10.3.1-rc1` | `RELEASE_VERSION=10.3.1`<br/>`TAG_NAME=10.3.1-rc1` |

:::warning
Set `CREATE_STREAM_BRANCH=true` (and `UPDATE_STREAM_VERSION=true` for `incubator-kie-tools`) **only** for the very first RC of a new minor (`10.3.0-rc1`). The job fails if `10.3.x` already exists. For `rc2`, patch releases, and all later runs, leave them `false`.
:::

On the first RC run, the job creates `10.3.x` from `main`, sets the development version (`10.3.999`; `10.3.999-SNAPSHOT` for `incubator-kie`), pushes the branch, and builds the RC on it, all in the same build. Later runs build from `10.3.x`, which the job derives from `RELEASE_VERSION`.

#### 2a. `incubator-kie`

Trigger [`apache/incubator-kie :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-candidate/) (`.ci/jenkins/Jenkinsfile.103xplus.release-candidate`) with the parameters for your run from the table above.

#### 2b. Close the Nexus staging repository

After Step 2a (Java deploy) succeeds:
1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Find your `orgapachekie-XXXX` repository.
3. Click **Close**.
4. Copy the staging repository URL — you will need it in the voting email.

If the deploy failed part-way, **Drop** the partial staging repository instead of closing it (see [Troubleshooting](#3-troubleshooting)).

#### 2c. `incubator-kie-tools`

Trigger [`apache/incubator-kie-tools :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-candidate/) (`.ci/jenkins/Jenkinsfile.103xplus.release-candidate`) with the parameters for your run from the table above.

Jenkins builds, signs, and uploads all artifacts to Apache SVN Dev Dist at:
`https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1/`

#### Artifacts staged in SVN Dev Dist

<details>
<summary><b>Full artifact list (click to expand)</b></summary>

**VS Code Extensions (`.vsix`)**
- `apache-kie-10.3.0-incubating-bpmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-business-automation-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-dmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-drl-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-extended-services-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-kogito-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-pmml-vscode-extension.vsix`

**Chrome Extensions (`.zip`)**
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension.zip`
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension-editors.zip`

**Web Apps, Accelerators, NPM Packages & Sources (`.zip`)**
- `apache-kie-10.3.0-incubating-sandbox-webapp.zip`
- `apache-kie-10.3.0-incubating-sandbox-accelerator-quarkus.zip`
- `apache-kie-10.3.0-incubating-tools-npm-packages.zip`
- `apache-kie-10.3.0-incubating-sources.zip`

**Helm Charts (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-sandbox-helm-chart.tar.gz`
- `apache-kie-10.3.0-incubating-runtime-tools-console-helm-chart.tar.gz`

**Container Images (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-cors-proxy-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-management-console-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-base-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-dmn-form-webapp-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-quarkus-blank-app-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-extended-services-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-webapp-image.tar.gz`

**Upload Service Binaries (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-linux-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-arm64.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-windows-x86.tar.gz`

Each file is accompanied by a `.asc` PGP signature and a `.sha512` checksum.

</details>

---

### Step 3 — Verify and Vote

Verification and voting are one continuous activity. The Release Manager (RM) performs the initial verification, opens the vote, and all other voters independently repeat the same verification before casting their binding vote. Apache KIE uses a two-stage vote: first within the project (PPMC), then with the Apache Incubator (IPMC).

#### 3a. Verify the RC

The RM verifies the RC artifacts (signatures, checksums, licenses, build from source). See [How to verify a release candidate](/community/devs/verify) for the full checklist. Do not open the vote before this step passes.

#### 3b. PPMC Vote

- Send a `[VOTE]` email to `dev@kie.apache.org`.
- The vote must be open for at least **72 hours**.
- At least **3 binding +1 votes** from PPMC members are required to pass.
- For the standard email format (with RC tags, staging links, and KEYS), refer to previous vote threads in the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

#### 3c. IPMC Vote

- Once the PPMC vote passes, send a `[RESULT][VOTE]` email to `dev@kie.apache.org`.
- Then send a `[VOTE]` email to `general@incubator.apache.org`.
- The vote must be open for at least **72 hours**.
- At least **3 binding +1 votes** from IPMC members are required to pass.
- For the standard email format, refer to previous vote threads in the [general@incubator.apache.org archive](https://lists.apache.org/list.html?general@incubator.apache.org).

**If the vote fails**, apply the required fixes to `10.3.x` in both repositories and go back to Step 2 with the next RC tag (e.g. `10.3.0-rc2`).

---

### Step 4 — Tag the Official Release & Create GitHub Releases

> **When:** After the IPMC vote passes.

Run the `release-promote` Jenkins job in both repositories to tag the winning RC commit and create the GitHub Release. The `incubator-kie-tools` job also moves the approved RC in Apache SVN from `dev` to `release`:

#### 4a. `incubator-kie`

Trigger [`apache/incubator-kie :: release-promote`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-promote/) (`.ci/jenkins/Jenkinsfile.103xplus.release-promote`) with:
- `PROJECT_VERSION`: `10.3.0`
- `GIT_TAG`: the approved RC tag (e.g. `10.3.0-rc1`)
- `BUILD_BRANCH_NAME`: `10.3.x`

#### 4b. `incubator-kie-tools`

Trigger [`apache/incubator-kie-tools :: release-promote`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/release-kie-release-promote/) (`.ci/jenkins/Jenkinsfile.103xplus.release-promote`) with:
- `RELEASE_VERSION`: `10.3.0`
- `BASE_REF`: the approved RC tag (e.g. `10.3.0-rc1`)

This job:
1. Creates the official tag `10.3.0` and the GitHub Release, which is required before Step 5b runs.
2. Moves `dist/dev/incubator/kie/10.3.0-rc1` to `dist/release/incubator/kie/10.3.0` in Apache SVN. The whole directory moves, meaning every artifact listed in [Artifacts staged in SVN Dev Dist](#artifacts-staged-in-svn-dev-dist) with its `.asc` and `.sha512`. The `incubator-kie` Java artifacts are not in SVN; they are released from Nexus in Step 5a.
3. Deletes the other `10.3.0-rcN` directories left in `dist/dev` (for example, the RCs that failed their vote).

The SVN step fails, without changing anything, if the RC is not in `dev` or if `release/10.3.0` already exists. See [Troubleshooting](#33-incubator-kie-tools--jenkinsfile103xplusrelease-promote).

---

### Step 5 — Publish to Public Registries

#### 5a. Promote Nexus staging to Maven Central

The `incubator-kie` Java artifacts stay in the Nexus staging repository that was **closed** in Step 2b. Only after the vote passes is that same repository **released**. This is a manual step, because the `release-promote` job only tags and does not touch Nexus.

1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Select the same `orgapachekie-XXXX` repository that was closed in Step 2b and referenced in the vote email.
3. Click **Release**.

#### 5b. Publish KIE Tools artifacts

*(The GitHub Release was already created by the Step 4b `release-promote` job).*

Trigger [`apache/incubator-kie-tools :: release-publish`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-publish/) (`.ci/jenkins/Jenkinsfile.103xplus.release-publish`) with:
- `BASE_REF`: `10.3.0-rc1` (the voted RC tag)
- `RELEASE_VERSION`: `10.3.0`
- `GITHUB_RELEASE_TAG`: `10.3.0`

This automatically publishes:
- NPM packages → npm registry
- VS Code extensions → Visual Studio Marketplace
- Chrome extensions → Chrome Web Store
- Container images → Docker Hub (`docker.io/apache/incubator-kie-*`)
- Helm charts → Docker Hub OCI registry
- GitHub Pages → updated

If it fails part-way, **read the [Troubleshooting](#3-troubleshooting) section before re-running**. Some publishers are not idempotent.

---

### Step 6 — Announce the Release

Send the official release announcement email to:
- `dev@kie.apache.org`
- `announce@apache.org`

For the standard email format, refer to previous announcement threads in the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

---

## 2. Quick Reference Checklists

### Minor Release (first release from a new branch, e.g. `10.3.0`)

| # | Step | Where | Notes |
|---|---|---|---|
| 1 | Create the `10.3.x` Jenkins folder from `main` & build CI image | Step 1a/1b | Once per minor series; trigger `release-build-kie-kogito-ci` with `IMAGE_TAG` matching release stream |
| 2 | Build & stage `10.3.0-rc1` | Step 2a/2c | Both repos: set `RELEASE_VERSION`, `TAG_NAME` and `CREATE_STREAM_BRANCH=true` (plus `UPDATE_STREAM_VERSION=true` for `incubator-kie-tools`) — the job creates `10.3.x` (it does not exist yet) and builds the RC in one go |
| 3 | Close the Nexus staging repository | Step 2b | Copy the staging URL for the vote email |
| 4 | Verify the RC | Step 3a | See [How to verify a release candidate](/community/devs/verify) |
| 5 | PPMC vote on `dev@kie.apache.org` | Step 3b | 72 h, 3 binding +1 |
| 6 | IPMC vote on `general@incubator.apache.org` | Step 3c | 72 h, 3 binding +1 |
| 7 | Run `release-promote` job in both repos | Step 4 | Creates the official `10.3.0` Git tag and GitHub Release for both repos; the `incubator-kie-tools` job also moves SVN `dev` → `release` and deletes superseded RCs |
| 8 | Release Nexus staging → Maven Central | Step 5a | Manual action in Nexus UI |
| 9 | Run `release-publish` job | Step 5b | GitHub Release was already created in step 7 (Step 4b); pass `GITHUB_RELEASE_TAG=10.3.0` |
| 10 | Send announcement email | Step 6 | |

### Patch Release (e.g. `10.3.1`)

The `10.3.x` branch and its Jenkins folder already exist — skip Step 1.
Apply bug fixes to `10.3.x` in both repos, then follow Steps 2–6 using version `10.3.1`.

### Failed Vote (e.g. `10.3.0-rc1` fails)

Apply required fixes to `10.3.x` in both repos, then repeat Steps 2–3 with the next RC tag (`10.3.0-rc2`) until a vote passes, and continue with Steps 4–6. The branch already exists, so the jobs do not cut it again.

---

## 3. Troubleshooting

When a job fails, open the console log, find the **last stage that started**, and use the table of that job. "State left behind" is what the failed run already changed outside Jenkins; it decides whether a re-run is safe.

Most failures come from wrong parameters or credentials. Before any re-run, check the [job parameters](#job-parameters) and use the correct values: version and RC tag.

**Tag already exists.** Both RC jobs push the RC tag *before* they build, so after any later failure the tag is on `origin` and a re-run with the same tag is rejected. Check it with `git ls-remote --tags origin '10.3.0-rc1*'`. If nothing was staged or announced for that RC, delete it (`git push origin :refs/tags/10.3.0-rc1`) and re-run. Otherwise use the next RC number (`10.3.0-rc2`), unused in **both** repositories. Never delete or move a tag that was voted on or published.

### 3.1 `incubator-kie` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Initialize & Validate | None | Yes | Fix the parameter. `TAG_NAME` must start with `RELEASE_VERSION`. |
| Create Stream Branch | `10.3.x` on `origin`, if the push succeeded | **Yes** | Set `CREATE_STREAM_BRANCH=false`; re-run normally from `10.3.x`. |
| Execute Release Scripts — before tag push | None | Yes | Set `PUSH_TAG=false` or `DRY_RUN=true`; investigate the failure and re-run with the same tag. |
| Execute Release Scripts — after tag push | RC tag on `origin` | **No** with the same tag | See *Tag already exists*. Delete the tag if no staging content was uploaded, then re-run. Otherwise use the next RC number. |
| Execute Release Scripts — after deploy starts | Partial staging repository in Nexus | **No** | **Drop** the partial staging repository in the Nexus UI, then see *Tag already exists*. |

### 3.2 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Create stream branch | `10.3.x` on `origin`, if the push succeeded | **No**, with `CREATE_STREAM_BRANCH=true` | The branch already exists. Re-run with `CREATE_STREAM_BRANCH=false`, and `UPDATE_STREAM_VERSION=true` only if the version update is not done yet. |
| Check release version against package.json | None | Yes | `Version mismatch`: fix `RELEASE_VERSION`, or check that the build ran on the expected branch. |
| Create and push RC tag | RC tag on `origin` | **No** | See *Tag already exists*. If the parameters were left at the defaults, a `0.0.0-rc1` tag was pushed: delete it and re-run with the correct values. |
| Publish to Apache SVN (for voting) | RC tag on `origin`; possibly a partial directory in `dist/dev/incubator/kie/10.3.0-rc1/` | **No**, with the same tag | `401` / `Authorization failed`: the job must use the Jenkins credential `kie-svn-credentials`, which has push access to Apache SVN. Fix the credential, then follow *Tag already exists*. |


### 3.3 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-promote`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Validate parameters | None | Yes | `BASE_REF` must be an RC tag of `RELEASE_VERSION` (e.g. `10.3.0-rc1` for `10.3.0`). |
| Tag final release | None | Yes | Fix the cause and re-run. |
| Create GitHub Release | Official tag `10.3.0` on `origin` | Yes | The tag already exists and is reused. Check the GitHub Release, then re-run. |
| Promote artifacts in Apache SVN | Official tag and GitHub Release already created | Yes | `RC ... not found in dev`: `BASE_REF` does not match a directory in `dist/dev/incubator/kie/`. `release/10.3.0 already exists`: the move was already done, so check `dist/release` and do not re-run. `401` / `Authorization failed`: the Jenkins credential `kie-svn-credentials` needs write access to `dist/release`. |

### 3.4 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-publish`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Validate parameters | None | Yes | Set the voted RC tag as `BASE_REF`, and a `GITHUB_RELEASE_TAG` whose GitHub Release already exists (Step 4b). |
| Build and Publish to Registries | **Some registries published, others not.** `release-all.sh` continues after a failure and lists the failed components at the end | **No**, not blindly | Check each registry first and publish only what is missing. NPM packages already published are skipped. The VS Code Marketplace, Chrome Web Store and OCI (Helm) registry reject an existing version. Container images are overwritten. A GitHub asset with an existing name fails: delete it on the GitHub Release first. |

---

## 4. Release Setup

### Who can run a release

A release is run by an Apache KIE **Release Manager (RM)**, a PPMC member or a committer designated by the PPMC. Running the Jenkins jobs requires:

- Permission to trigger jobs in the Apache KIE Jenkins instance.
- Write access to `apache/incubator-kie` and `apache/incubator-kie-tools` (to push stream branches and tags).
- Your GPG key in the [Apache KIE KEYS file](https://downloads.apache.org/incubator/kie/KEYS) when you sign locally.
- An ASF account with access to `repository.apache.org` (Nexus) to close and release the staging repository. These are the only manual Nexus steps. The SVN `dev` → `release` move is done by the `release-promote` job with the `kie-svn-credentials` Jenkins credential.

### Credentials used by the Jenkins jobs

These are configured in Jenkins, not typed in by the RM. Running locally needs the equivalent values in your environment.

| Credential | Used by | Local equivalent |
|---|---|---|
| Maven `settings.xml` with the `apache.releases.https` server (Config File Provider, default id `kie-release-authn-settings`) | `incubator-kie` release job | `MAVEN_SETTINGS=/path/to/settings.xml` |
| GPG signing key (secret file, default id `GPG_KEY_FILE`) and optional passphrase | `incubator-kie` release job; `incubator-kie-tools` release-candidate job | Your local GPG agent, or `MAVEN_GPG_PASSPHRASE` |
| GitHub push credential (username/password) | Pushing stream branches and tags in both repositories | SSH key or token with push access |
| ASF SVN credential (id `kie-svn-credentials`) | `incubator-kie-tools` release-candidate job (upload to `dist/dev`) and release-promote job (move to `dist/release`) | `svn` with your ASF account |
| npm token, VS Code Marketplace PAT, Chrome Web Store tokens, Docker Hub and Helm registry credentials, GitHub token | `incubator-kie-tools` release-publish job | `NPM_TOKEN`, `VSCE_PAT`, `CHROME_*`, `DOCKER_*`, `HELM_*`, `GITHUB_TOKEN` |

### Where the output goes

| Output | Location |
|---|---|
| Java artifacts (JARs, POMs, sources, Javadocs) | Nexus staging repository `orgapachekie-XXXX` at [repository.apache.org](https://repository.apache.org) |
| Tools RC artifacts, signatures and checksums | `https://dist.apache.org/repos/dist/dev/incubator/kie/<rc-version>/` |
| Tools released artifacts, signatures and checksums | `https://dist.apache.org/repos/dist/release/incubator/kie/<version>/` (moved by `release-promote`) |
| Release tags | `X.Y.Z-rcN` and `X.Y.Z` in each repository |
| Tools public artifacts | npm, VS Code Marketplace, Chrome Web Store, Docker Hub, GitHub Release |

### Jenkins jobs

| Repository | Jenkinsfile | Purpose |
|---|---|---|
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.ci-image-build` | Builds and pushes the CI builder Docker image (`apache/incubator-kie-kogito-ci-build:<IMAGE_TAG>`) for the release stream |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.release-candidate` | Stream branch cut (optional), RC tag, build, deploy to Nexus staging |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.release-promote` | Tag official release and create GitHub Release for `incubator-kie` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-candidate` | Stream branch cut (optional), RC tag, build, sign, upload to SVN `dist/dev` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-promote` | Tag official release, create GitHub Release for `incubator-kie-tools`, and move the approved RC in Apache SVN from `dist/dev` to `dist/release` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-publish` | Publish to public registries (npm, VS Code Marketplace, Docker Hub, etc.) |


---

## 5. Repositories & Requirements

A KIE release involves two repositories:

| Repository | What it contains | Language / tooling |
|---|---|---|
| [`incubator-kie`](https://github.com/apache/incubator-kie) | Drools, OptaPlanner, jBPM, Kogito | Java / Maven |
| [`incubator-kie-tools`](https://github.com/apache/incubator-kie-tools) | VS Code extensions, Chrome extensions, web apps like KIE Sandbox, container images, Helm charts | Node.js / Go / pnpm |

All release scripts live inside each repository:
- **`incubator-kie`**: [`script/release/`](https://github.com/apache/incubator-kie/tree/main/script/release/) — each script supports `--dry-run`. See the [`README.md`](https://github.com/apache/incubator-kie/blob/main/script/release/README.md) there for the per-script reference.
- **`incubator-kie-tools`**: [`scripts/release/`](https://github.com/apache/incubator-kie-tools/tree/main/scripts/release/) — see the [`README.md`](https://github.com/apache/incubator-kie-tools/blob/main/scripts/release/README.md) there for details.


### `incubator-kie` 

| Item | Value |
|---|---|
| Stream branch | `10.3.x` |
| RC tag | `10.3.0-rc1` |
| Final tag | `10.3.0` |
| Build command | `./script/release/release-all.sh --version 10.3.0 --tag 10.3.0-rc1 --skip-tests` |
| Deploy command | add `--deploy --push-tag` to the build command |
| Produced artifacts | JARs, POMs, sources, and Javadocs deployed to Apache Nexus Staging |
| Update version | `./script/release/01-update-version.sh <version>` *(automated by `release-all.sh`)* |

For the exact toolchain versions required (JDK, Maven, Docker), see the [`README.md`](https://github.com/apache/incubator-kie/blob/main/script/release/README.md) in `script/release/`.

### `incubator-kie-tools` 
| Item | Value |
|---|---|
| Stream branch | `10.3.x` |
| RC tag | `10.3.0-rc1` |
| Final tag | `10.3.0` |
| Build command (RC) | `./scripts/release/release-all.sh 10.3.0 --rc` |
| Publish command | `./scripts/release/release-all.sh 10.3.0 --publish` |
| Produced artifacts | VS Code extensions (`.vsix`), Chrome extensions, web app ZIPs, NPM packages ZIP, Sources ZIP, container image tarballs, Helm chart tarballs, upload-service binaries — all in `release-artifacts/` |

For the exact toolchain versions required (Node.js, pnpm, Go, Bash, Docker), see the [`README.md`](https://github.com/apache/incubator-kie-tools/blob/main/scripts/release/README.md) in `scripts/release/`.

:::warning
`release-all.sh` does not fail when Docker is not running; it prints a warning and **skips the container images**. Before you sign and upload an RC, check that the container image tarballs are present in `release-artifacts/`.
:::


---

## 6. Branches & Tags

### How branches and tags are named

| Name format | Example | Purpose |
|---|---|---|
| `main` | `main` | Ongoing development |
| `X.Y.x` | `10.3.x` | Stream branch for a minor release series |
| `X.Y.Z-rcN` | `10.3.0-rc1` | Release candidate tag |
| `X.Y.Z` | `10.3.0` | Final release tag |

### Version numbers on branches

- **`main`** always runs `999-SNAPSHOT` (Java) or `0.0.0` (Tools) — a placeholder version that is never released.
- **Stream branch (`10.3.x`)** runs `10.3.999-SNAPSHOT` (Java) or `10.3.999` (Tools) — again a placeholder, never released.
- **RC and final tags** point to a temporary commit where the version is set to the exact release version (e.g. `10.3.0`). That temporary commit is created locally and immediately deleted after tagging — only the tag is pushed.

### Git timeline diagram

```
main:    ---c-------c---c---c----------------------------------> main
                                                v999-SNAPSHOT
              |
              '----D---c---c---c---c-------------------------> 10.3.x
                   |   |                   v 10.3.999-SNAPSHOT
                   |   |
                   |   '--R--> tag 10.3.0-rc2 ✅
                   |           tag 10.3.0
                   |
                   '--R--> tag 10.3.0-rc1 ❌ (vote failed)
```

**Diagram key:**

| Symbol | Meaning |
|---|---|
| `c` | Regular commit |
| `D` | Dev-version commit — sets version to `X.Y.999-SNAPSHOT` on the stream branch |
| `R` | Release commit — sets version to exact release version (e.g. `10.3.0`) on a temporary local branch, tagged, then discarded |
| `✅` | Vote passed |
| `❌` | Vote failed — a new RC is needed |

---

## 7. Running the Release Locally

:::note
This section is for development and exceptional situations only. Release Managers should run the release through the Jenkins jobs described in [Release Steps](#1-release-steps).
:::

The release scripts can be executed on your own machine. Each script in `incubator-kie` supports `--dry-run`. You need the credentials listed in [Credentials used by the Jenkins jobs](#credentials-used-by-the-jenkins-jobs) available locally.

### Release candidate — `incubator-kie`

```bash
git checkout 10.3.x && git pull

# Dry run — builds everything locally, no remote changes
./script/release/release-all.sh \
  --version 10.3.0 \
  --tag 10.3.0-rc1 \
  --skip-tests \
  2>&1 | tee /tmp/kie-release-run.log

# Real run — creates the RC commit, pushes the tag, and deploys to Nexus staging
MAVEN_SETTINGS=/path/to/settings.xml \
MAVEN_GPG_PASSPHRASE="<your-gpg-passphrase>" \
./script/release/release-all.sh \
  --version 10.3.0 \
  --tag 10.3.0-rc1 \
  --skip-tests \
  --deploy \
  --push-tag \
  2>&1 | tee /tmp/kie-release-run.log
```

### Release candidate — `incubator-kie-tools`

```bash
git checkout 10.3.x && git pull
pnpm bootstrap

# Step 1 — Build all RC artifacts into release-artifacts/
./scripts/release/release-all.sh 10.3.0 --rc 2>&1 | tee release-10.3.0-rc.log

# Step 2 — Sign each artifact
cd release-artifacts
for f in *; do
    gpg --no-tty --batch --pinentry-mode loopback --output "${f}.asc" --detach-sig "${f}" || exit 1
    sha512sum "${f}" > "${f}.sha512" || exit 1
done

# Step 3 — Upload to Apache SVN Dev Dist
svn import . https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    -m "Apache KIE 10.3.0-rc1 artifacts"
```

### Promote — `incubator-kie`

```bash
# Fetch the approved RC tag first
git fetch origin "refs/tags/10.3.0-rc1:refs/tags/10.3.0-rc1"

# Create and push the final release tag (or use the script)
./script/release/05-tag-release.sh --rc-tag 10.3.0-rc1 --push

# Create the GitHub Release
gh release create 10.3.0 \
  --repo apache/incubator-kie \
  --target 10.3.x \
  --title "10.3.0" \
  --generate-notes
```

### Promote — `incubator-kie-tools`

```bash
# Fetch the approved RC tag first
git fetch origin "refs/tags/10.3.0-rc1:refs/tags/10.3.0-rc1"

# Create and push the final release tag
git tag -a 10.3.0 10.3.0-rc1 -m "Release 10.3.0"
git push origin 10.3.0

# Create the GitHub Release (required before release-publish)
gh release create 10.3.0 \
  --repo apache/incubator-kie-tools \
  --title "10.3.0" \
  --generate-notes

# Move the approved RC in Apache SVN from dev to release
svn move -m "Release Apache KIE 10.3.0" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0

# Remove any other RC of 10.3.0 still in dev (for example, an RC that failed its vote)
svn delete -m "Remove superseded RC" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc<N>
```

---

## 8. What Changed from 10.2 to 10.3

| Area | 10.2 | 10.3+ |
|---|---|---|
| **Java repositories** | 4 separate repos (`drools`, `optaplanner`, `kogito-runtimes`, `kogito-apps`) | 1 unified reactor in `incubator-kie` |
| **Java build** | `mvn clean install` in each repo separately | `./script/release/release-all.sh` covers all Java modules |
| **Java release** | One Jenkins job per repo | `Jenkinsfile.103xplus.release-candidate` (RC), `Jenkinsfile.103xplus.release-promote` (tag) |
| **KIE Tools release** | Multiple per-component Jenkinsfiles | `Jenkinsfile.103xplus.release-candidate` (RC), `Jenkinsfile.103xplus.release-promote` (tag), `Jenkinsfile.103xplus.release-publish` |
| **Tools source archive** | One combined ZIP | `apache-kie-<version>-incubating-sources.zip`, produced by `scripts/release/create-source-tarball.sh` |
| **Removed packages** | Included deprecated components | `dashbuilder-*`, `sonataflow-*`, `yard-*`, `serverless-logic-*` are no longer released |
