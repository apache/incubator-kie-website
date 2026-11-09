---
id: release-procedure
title: Release Procedure
sidebar_position: 1
---

How to perform an Apache KIE release, from the first release candidate to the final release.

:::note
Since **10.3**, all Java components (Drools, OptaPlanner, Kogito Runtimes, Kogito Apps) live in one repository, `incubator-kie`. A release now covers **two repos** (one Jenkins job each) instead of the many repos used in 10.2.
:::

---

## Overview

Releases run as Jenkins jobs in two repositories: [`apache/incubator-kie`](https://github.com/apache/incubator-kie) and [`apache/incubator-kie-tools`](https://github.com/apache/incubator-kie-tools). The only manual steps are the Nexus staging actions for `incubator-kie` and the vote.

This page is the **single source of truth**. The `docs/RELEASING.md` files in both repositories only link here.

- Release steps: keep reading.
- [Quick Reference Checklists](#2-quick-reference-checklists): minor release, patch release, failed vote.
- [Troubleshooting](#3-troubleshooting): a job failed, is it safe to re-run?
- [Release Setup](#4-release-setup): who can release, credentials, where the output goes.
- [Repositories & Requirements](#5-repositories--requirements): toolchains and scripts.
- [Branches & Tags](#6-branches--tags): naming and versions.
- [Running the Release Locally](#7-running-the-release-locally): scripts without Jenkins.
- [What Changed from 10.2 to 10.3](#8-what-changed-from-102-to-103).

---

## 1. Release Steps

In the links below, `{STREAM_NAME}` is the release stream (e.g. `10.3.x`).

---

### Step 1 — Prepare for a New Minor Series

> **When:** Once per minor series, before the first RC (e.g. before `10.3.0-rc1`).

#### 1a. Create the Jenkins folder for the new stream

Copy each repository's `main` folder as the stream folder (e.g. `10.3.x`), so `main` can keep changing without affecting the release:

| Repository | `main` folder to copy | Copy it as |
|---|---|---|
| `apache/incubator-kie` | https://ci-builds.apache.org/job/KIE/job/drools/job/main/ | https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/ |
| `apache/incubator-kie-tools` | https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/ | https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/ |

Then point the jobs in the copy at the `{STREAM_NAME}` branch. For a new minor series this branch does not exist yet: the first `release-candidate` run in Step 2 creates it from `main` (`CREATE_STREAM_BRANCH=true`). Until then, the only jobs to run are the CI image builds in Step 1b, which do not need the branch. Ignore the older folders (`10.0.x`, `10.1.x`, `10.2.x`, ...).

#### 1b. Build the CI Builder Images

Each repository runs its Jenkins jobs in its own CI builder Docker image. Make sure both images are current before the first RC.

**`apache/incubator-kie`**

The jobs in the stream folder run in the image set by the `AGENT_DOCKER_BUILDER_IMAGE` environment variable of the folder, e.g. `docker.io/apache/incubator-kie-kogito-ci-build:10.3.x-latest`. Each stream needs its own tag.

Trigger [`apache/incubator-kie :: release-build-kie-kogito-ci`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-build-kie-kogito-ci/) (`.ci/jenkins/Jenkinsfile.ci-image-build`) with:
- `IMAGE_TAG`: `{STREAM_NAME}-latest` (e.g. `10.3.x-latest`), matching the tag in `AGENT_DOCKER_BUILDER_IMAGE`.

Check that the tag appears on [Docker Hub](https://hub.docker.com/r/apache/incubator-kie-kogito-ci-build/tags) before running the other jobs in the stream folder.

**`apache/incubator-kie-tools`**

The `release-candidate` and `release-publish` jobs run in `docker.io/apache/incubator-kie-tools-ci-build:main`. This one image is shared by all streams. Rebuild it if `.ci/incubator-kie-tools-ci-build.Dockerfile` changed on `main` since the last build (for example after a Node.js, Go, Maven or JDK upgrade).

Trigger [`apache/incubator-kie-tools :: kie-tools-ci-image-build`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/job/ci/job/kie-tools-ci-image-build/job/main/) (`.ci/jenkins/ci-jobs/Jenkinsfile.ci-image-build`) on the `main` branch with:
- `IMAGE_TAG`: `main`.

Check the **Last Updated** date of the `main` tag on [Docker Hub](https://hub.docker.com/r/apache/incubator-kie-tools-ci-build/tags) before running the `release-candidate` job.

---

### Step 2 — Build & Stage a Release Candidate

> **When:** For every Release Candidate (RC), e.g. `10.3.0-rc1`, `10.3.0-rc2`.

Builds and signs all artifacts and uploads them to staging for verification. See [Where the output goes](#where-the-output-goes).

#### Job Parameters

Run `release-candidate` in both repositories (links in 2a and 2c). Set only these parameters; leave the rest at their defaults:

| Run | `incubator-kie` | `incubator-kie-tools` |
|---|---|---|
| **First RC of a new minor** (`10.3.0-rc1`) | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc1`<br/>`CREATE_STREAM_BRANCH=true` | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc1`<br/>`CREATE_STREAM_BRANCH=true`<br/>`UPDATE_STREAM_VERSION=true` |
| **Later RC** (`10.3.0-rc2`) | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc2` | `RELEASE_VERSION=10.3.0`<br/>`TAG_NAME=10.3.0-rc2` |
| **Patch** (`10.3.1-rc1`) | `RELEASE_VERSION=10.3.1`<br/>`TAG_NAME=10.3.1-rc1` | `RELEASE_VERSION=10.3.1`<br/>`TAG_NAME=10.3.1-rc1` |

:::warning
Use `CREATE_STREAM_BRANCH=true` (and `UPDATE_STREAM_VERSION=true` for `incubator-kie-tools`) **only** for `10.3.0-rc1`. The job fails if `10.3.x` already exists. For `rc2`, patches and later runs, leave them `false`.
:::

On the first RC, the job creates `10.3.x` from `main`, sets the development version (`10.3.999`; `10.3.999-SNAPSHOT` for `incubator-kie`), pushes the branch and builds the RC. Later runs build from `10.3.x`, derived from `RELEASE_VERSION`.

#### 2a. `incubator-kie`

Trigger [`apache/incubator-kie :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-candidate/) (`.ci/jenkins/Jenkinsfile.103xplus.release-candidate`) with the parameters from the table above.

#### 2b. Close the Nexus staging repository

After Step 2a succeeds:
1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Find your `orgapachekie-XXXX` repository.
3. Click **Close**.
4. Copy the staging repository URL for the vote email.

If the deploy failed part-way, **Drop** the partial repository instead (see [Troubleshooting](#3-troubleshooting)).

#### 2c. `incubator-kie-tools`

Trigger [`apache/incubator-kie-tools :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-candidate/) (`.ci/jenkins/Jenkinsfile.103xplus.release-candidate`) with the parameters from the table above.

Jenkins builds, signs and uploads all artifacts to Apache SVN Dev Dist at:
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

The Release Manager (RM) verifies the RC and opens the vote. Every voter repeats the verification before voting. There are two stages: PPMC first, then IPMC.

#### 3a. Verify the RC

Check signatures, checksums, licenses and the build from source. See [How to verify a release candidate](/community/devs/verify). Do not open the vote until this passes.

#### 3b. PPMC Vote

Send a `[VOTE]` email to `dev@kie.apache.org`. It must stay open at least **72 hours** and get at least **3 binding +1 votes** from PPMC members.

#### 3c. IPMC Vote

After the PPMC vote passes, send a `[RESULT][VOTE]` email to `dev@kie.apache.org`, then a `[VOTE]` email to `general@incubator.apache.org`. Same rules: at least **72 hours** and **3 binding +1 votes** from IPMC members.

For the email formats, copy previous threads from the [dev@](https://lists.apache.org/list.html?dev@kie.apache.org) and [general@](https://lists.apache.org/list.html?general@incubator.apache.org) archives.

**If the vote fails**, fix `10.3.x` in both repositories and go back to Step 2 with the next RC (e.g. `10.3.0-rc2`).

---

### Step 4 — Tag the Official Release & Create GitHub Releases

> **When:** After the IPMC vote passes.

Run `release-promote` in both repositories. It tags the approved RC and creates the GitHub Release.

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
1. Creates the official tag `10.3.0` and the GitHub Release (needed before Step 5b).
2. Moves `dist/dev/incubator/kie/10.3.0-rc1` to `dist/release/incubator/kie/10.3.0` in Apache SVN, with every [staged artifact](#artifacts-staged-in-svn-dev-dist) and its `.asc` and `.sha512`. The `incubator-kie` Java artifacts are not in SVN; they are released from Nexus in Step 5a.
3. Deletes the other `10.3.0-rcN` directories in `dist/dev` (e.g. failed RCs).

The SVN step fails without changing anything if the RC is not in `dev` or `release/10.3.0` already exists. See [Troubleshooting](#33-incubator-kie-tools--jenkinsfile103xplusrelease-promote).

---

### Step 5 — Publish to Public Registries

#### 5a. Promote Nexus staging to Maven Central

**Release** the Nexus staging repository you closed in Step 2b. This is manual; `release-promote` does not touch Nexus.

1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Select the `orgapachekie-XXXX` repository from Step 2b.
3. Click **Release**.

#### 5b. Publish KIE Tools artifacts

The GitHub Release already exists from Step 4b.

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

If it fails part-way, **read [Troubleshooting](#3-troubleshooting) before re-running**. Some publishers cannot be repeated safely.

---

### Step 6 — Announce the Release

Send the official release announcement email to:
- `dev@kie.apache.org`
- `announce@apache.org`

For the email format, copy a previous announcement from the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

---

## 2. Quick Reference Checklists

### Minor Release (e.g. `10.3.0`)

1. **Step 1:** Create the `10.3.x` Jenkins folders and build the CI images of both repositories.
2. **Step 2:** Run `release-candidate` in both repos with `RELEASE_VERSION=10.3.0`, `TAG_NAME=10.3.0-rc1` and `CREATE_STREAM_BRANCH=true` (plus `UPDATE_STREAM_VERSION=true` for `incubator-kie-tools`). Then close the Nexus staging repository.
3. **Step 3:** Verify the RC, then hold the PPMC and IPMC votes.
4. **Step 4:** Run `release-promote` in both repos with the approved RC tag.
5. **Step 5:** Release the Nexus staging repository, then run `release-publish` (`GITHUB_RELEASE_TAG=10.3.0`).
6. **Step 6:** Send the announcement.

### Patch Release (e.g. `10.3.1`)

`10.3.x` and its Jenkins folders already exist, so skip Step 1. Fix `10.3.x` in both repos, then follow Steps 2–6 with version `10.3.1`.

### Failed Vote (e.g. `10.3.0-rc1` fails)

Fix `10.3.x` in both repos, then repeat Steps 2–3 with the next RC tag (`10.3.0-rc2`) until a vote passes. Continue with Steps 4–6.

---

## 3. Troubleshooting

When a job fails, find the **last stage that started** in the console log and use the table for that job. "State left behind" is what the run already changed outside Jenkins; it tells you if a re-run is safe.

Most failures are wrong parameters or credentials. Check the [job parameters](#job-parameters) before re-running.

**Tag already exists.** Both RC jobs push the RC tag *before* building, so after a later failure a re-run with the same tag is rejected. Check with `git ls-remote --tags origin '10.3.0-rc1*'`. If nothing was staged or announced for that RC, delete the tag (`git push origin :refs/tags/10.3.0-rc1`) and re-run. Otherwise use the next RC number (`10.3.0-rc2`), unused in **both** repositories. Never delete or move a tag that was voted on or published.

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

A release is run by an Apache KIE **Release Manager (RM)**: a PPMC member, or a committer designated by the PPMC. The RM needs:

- Permission to trigger jobs in the Apache KIE Jenkins instance.
- Write access to `apache/incubator-kie` and `apache/incubator-kie-tools`.
- An ASF account with access to [repository.apache.org](https://repository.apache.org) (Nexus), to close and release the staging repository.
- Their GPG key in the [Apache KIE KEYS file](https://downloads.apache.org/incubator/kie/KEYS), if signing locally.

### Credentials used by the Jenkins jobs

These are configured in Jenkins; the RM does not type them in. Running locally needs the equivalent values in your environment.

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

---

## 5. Repositories & Requirements

| Repository | What it contains | Tooling | Release scripts (and required toolchain) | Output |
|---|---|---|---|---|
| [`incubator-kie`](https://github.com/apache/incubator-kie) | Drools, OptaPlanner, jBPM, Kogito | Java / Maven | [`script/release/`](https://github.com/apache/incubator-kie/tree/main/script/release/) ([README](https://github.com/apache/incubator-kie/blob/main/script/release/README.md)) | JARs, POMs, sources and Javadocs in Nexus staging |
| [`incubator-kie-tools`](https://github.com/apache/incubator-kie-tools) | VS Code and Chrome extensions, web apps like KIE Sandbox, container images, Helm charts | Node.js / Go / pnpm | [`scripts/release/`](https://github.com/apache/incubator-kie-tools/tree/main/scripts/release/) ([README](https://github.com/apache/incubator-kie-tools/blob/main/scripts/release/README.md)) | Files in `release-artifacts/` (see [Step 2c](#artifacts-staged-in-svn-dev-dist)) |

:::warning
If Docker is not running, `incubator-kie-tools` `release-all.sh` only warns and **skips the container images**. Before signing and uploading an RC, check that the image tarballs are in `release-artifacts/`.
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

- **`main`**: `999-SNAPSHOT` (Java) or `0.0.0` (Tools). A placeholder, never released.
- **Stream branch (`10.3.x`)**: `10.3.999-SNAPSHOT` (Java) or `10.3.999` (Tools). Also a placeholder.
- **RC and final tags** point to a temporary commit with the exact release version (e.g. `10.3.0`). The commit is deleted after tagging; only the tag is pushed.

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
For development and exceptional cases only. Release Managers should use the Jenkins jobs in [Release Steps](#1-release-steps).
:::

You need the [credentials](#credentials-used-by-the-jenkins-jobs) available locally. Each `incubator-kie` script supports `--dry-run`.

The examples assume `10.3.x` already exists. For the first RC of a new minor, let the Jenkins job create it (`CREATE_STREAM_BRANCH=true`).

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
