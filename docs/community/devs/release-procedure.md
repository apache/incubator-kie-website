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

A KIE release involves two repositories:

| Repository | What it contains | Language / tooling |
|---|---|---|
| [`incubator-kie`](https://github.com/apache/incubator-kie) | Drools, OptaPlanner, jBPM, Kogito | Java / Maven |
| [`incubator-kie-tools`](https://github.com/apache/incubator-kie-tools) | VS Code extensions, Chrome extensions, web apps like KIE Sandbox, container images, Helm charts | Node.js / Go / pnpm |

All release scripts live inside each repository:
- **`incubator-kie`**: [`script/release/`](https://github.com/apache/incubator-kie/tree/main/script/release/) — each script supports `--dry-run`. See the [`README.md`](https://github.com/apache/incubator-kie/blob/main/script/release/README.md) there for the per-script reference.
- **`incubator-kie-tools`**: [`scripts/release/`](https://github.com/apache/incubator-kie-tools/tree/main/scripts/release/) — see the [`README.md`](https://github.com/apache/incubator-kie-tools/blob/main/scripts/release/README.md) there for details.

This page is the **single source of truth** for the release procedure. The `RELEASING.md` files in both repositories only point here.

### Who can run a release

A release is run by an Apache KIE **Release Manager (RM)**, a PPMC member or a committer designated by the PPMC. Running the Jenkins jobs requires:

- Permission to trigger jobs in the Apache KIE Jenkins instance.
- Write access to `apache/incubator-kie` and `apache/incubator-kie-tools` (to push stream branches and tags).
- Your GPG key in the [Apache KIE KEYS file](https://downloads.apache.org/incubator/kie/KEYS) when you sign locally.
- An ASF account with access to `repository.apache.org` (Nexus) and `dist.apache.org` (SVN) to close/release the staging repository and move artifacts.

### Credentials used by the Jenkins jobs

These are configured in Jenkins, not typed in by the RM. Running locally needs the equivalent values in your environment.

| Credential | Used by | Local equivalent |
|---|---|---|
| Maven `settings.xml` with the `apache.releases.https` server (Config File Provider, default id `kie-release-authn-settings`) | `incubator-kie` release job | `MAVEN_SETTINGS=/path/to/settings.xml` |
| GPG signing key (secret file, default id `GPG_KEY_FILE`) and optional passphrase | `incubator-kie` release job; `incubator-kie-tools` release-candidate job | Your local GPG agent, or `MAVEN_GPG_PASSPHRASE` |
| GitHub push credential (username/password) | Pushing stream branches and tags in both repositories | SSH key or token with push access |
| ASF SVN staging credential (id `kie-svn-credentials`) | `incubator-kie-tools` release-candidate job (upload to `dist/dev`) | `svn` with your ASF account |
| npm token, VS Code Marketplace PAT, Chrome Web Store tokens, Docker Hub and Helm registry credentials, GitHub token | `incubator-kie-tools` release-publish job | `NPM_TOKEN`, `VSCE_PAT`, `CHROME_*`, `DOCKER_*`, `HELM_*`, `GITHUB_TOKEN` |

### Where the output goes

| Output | Location |
|---|---|
| Java artifacts (JARs, POMs, sources, Javadocs) | Nexus staging repository `orgapachekie-XXXX` at [repository.apache.org](https://repository.apache.org) |
| Tools RC artifacts, signatures and checksums | `https://dist.apache.org/repos/dist/dev/incubator/kie/<rc-version>/` |
| Release tags | `X.Y.Z-rcN` and `X.Y.Z` in each repository |
| Tools public artifacts | npm, VS Code Marketplace, Chrome Web Store, Docker Hub, GitHub Release |

### Jenkins jobs

| Repository | Jenkinsfile | Purpose |
|---|---|---|
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.ci-image-build` | Builds and pushes the CI builder Docker image (`apache/incubator-kie-kogito-ci-build:<IMAGE_TAG>`) for the release stream |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.release-candidate` | Stream branch cut (optional), RC tag, build, deploy to Nexus staging |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.release-promote` | Tag official release and create GitHub Release for `incubator-kie` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-candidate` | Stream branch cut (optional), RC tag, build, sign, upload to SVN `dist/dev` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-promote` | Tag official release and create GitHub Release for `incubator-kie-tools` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-publish` | Publish to public registries (npm, VS Code Marketplace, Docker Hub, etc.) |

---

## 1. Repositories & Requirements

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

## 2. Branches & Tags

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

## 3. Release Steps

The recommended way to run a release is via Jenkins. Each step below describes the Jenkins approach first, followed by the equivalent local commands.

---

### Step 1 — Prepare for a New Minor Series

> **When:** Once per minor release series, before creating the first RC.
> **Example:** Preparing for `10.3.0` before any RC exists.

#### 1a. Duplicate the Jenkins folder from `10.3.x`

For new release streams, duplicate the `10.3.x` folder (or the previous stream folder) in Jenkins for the new stream series (copy the folder and its jobs, then point the jobs at the stream branch). Run all Jenkins jobs for the release from that stream folder.

Do this once per minor series. Patch releases (`10.3.1`, ...) reuse the same folder.

#### 1b. Build the CI Builder Image

Before triggering the `incubator-kie` `release-candidate` job, trigger `.ci/jenkins/Jenkinsfile.ci-image-build` to build and publish the CI builder Docker image:
- `IMAGE_TAG`: set to the release stream (e.g. `10.3.x-latest` or `10.3.x`).

Ensure the image tag is built and pushed before starting the release candidate pipeline.


### Step 2 — Build & Stage a Release Candidate

> **When:** Each time you create a new RC (e.g. `10.3.0-rc1`, `10.3.0-rc2`).

This step builds all artifacts, signs them, and uploads them to staging for community verification.

#### Job Parameters

Trigger the `release-candidate` Jenkins job for both repositories. Set only the parameters below; all other parameters keep their default values (the branch is always `main`, then `10.3.x`):

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

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-candidate` with the parameters for your run from the table above.

**Locally:**
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
MAVEN_GPG_PASSPHRASE=<your-gpg-passphrase> \
./script/release/release-all.sh \
  --version 10.3.0 \
  --tag 10.3.0-rc1 \
  --skip-tests \
  --deploy \
  --push-tag \
  2>&1 | tee /tmp/kie-release-run.log
```

#### 2b. Close the Nexus staging repository

After Step 2a (Java deploy) succeeds:
1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Find your `orgapachekie-XXXX` repository.
3. Click **Close**.
4. Copy the staging repository URL — you will need it in the voting email.

If the deploy failed part-way, **Drop** the partial staging repository instead of closing it (see [Troubleshooting](#6-troubleshooting)).

#### 2c. `incubator-kie-tools`

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-candidate` with the parameters for your run from the table above.

Jenkins builds, signs, and uploads all artifacts to Apache SVN Dev Dist at:
`https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1/`

**Locally:**
```bash
git checkout 10.3.x && git pull
pnpm bootstrap

# Step 1 — Build all RC artifacts into release-artifacts/
./scripts/release/release-all.sh 10.3.0 --rc 2>&1 | tee release-10.3.0-rc.log

# Step 2 — Sign each artifact
cd release-artifacts
for f in *; do
    gpg --no-tty --batch --pinentry-mode loopback --output "${f}.asc" --detach-sig "${f}"
    sha512sum "${f}" > "${f}.sha512"
done

# Step 3 — Upload to Apache SVN Dev Dist
svn import . https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    -m "Apache KIE 10.3.0-rc1 artifacts"
```

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

Run the `release-promote` Jenkins job in both repositories to tag the winning RC commit and create the GitHub Release:

#### 4a. `incubator-kie`

**Via Jenkins:** Trigger `Jenkinsfile.103xplus.release-promote` with:
- `PROJECT_VERSION`: `10.3.0`
- `GIT_TAG`: the approved RC tag (e.g. `10.3.0-rc1`)
- `BUILD_BRANCH_NAME`: `10.3.x`

**Locally** (if not using Jenkins):
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

#### 4b. `incubator-kie-tools`

**Via Jenkins:** Trigger `Jenkinsfile.103xplus.release-promote` with:
- `RELEASE_VERSION`: `10.3.0`
- `BASE_REF`: the approved RC tag (e.g. `10.3.0-rc1`)

*Note: This creates the official tag `10.3.0` and the GitHub Release, which is required before Step 5c runs.*

**Locally** (if not using Jenkins):
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
```

---

### Step 5 — Publish to Public Registries

#### 5a. Promote Nexus staging to Maven Central

1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Select `orgapachekie-XXXX`.
3. Click **Release**.

#### 5b. Move SVN artifacts from `dev` to `release`

```bash
svn move -m "Release Apache KIE 10.3.0" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0
```

#### 5c. Publish KIE Tools artifacts

*(The GitHub Release was already created by the Step 4b `release-promote` job).*

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-publish` with:
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

If it fails part-way, **read the [Troubleshooting](#6-troubleshooting) section before re-running**. Some publishers are not idempotent.

#### 5d. Clean up superseded RCs from SVN dev

The approved RC was moved in Step 5b. Delete any earlier RC that failed its vote and is still in `dev`, for example when `10.3.0-rc2` was the approved one:

```bash
svn delete -m "Remove superseded RC" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1
```

---

### Step 6 — Announce the Release

Send the official release announcement email to:
- `dev@kie.apache.org`
- `announce@apache.org`

For the standard email format, refer to previous announcement threads in the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

---

## 4. Quick Reference Checklists

### Minor Release (first release from a new branch, e.g. `10.3.0`)

| # | Step | Where | Notes |
|---|---|---|---|
| 1 | Duplicate Jenkins folder from `10.3.x` & build CI image | Step 1a/1b | Once per minor series; trigger `.ci/jenkins/Jenkinsfile.ci-image-build` with `IMAGE_TAG` matching release stream |
| 2 | Build & stage `10.3.0-rc1` | Step 2a/2c | Both repos: set only the version and RC tag — the job creates `10.3.x` (it does not exist yet) and builds the RC in one go |
| 3 | Close the Nexus staging repository | Step 2b | Copy the staging URL for the vote email |
| 4 | Verify the RC | Step 3a | See [How to verify a release candidate](/community/devs/verify) |
| 5 | PPMC vote on `dev@kie.apache.org` | Step 3b | 72 h, 3 binding +1 |
| 6 | IPMC vote on `general@incubator.apache.org` | Step 3c | 72 h, 3 binding +1 |
| 7 | Run `release-promote` job in both repos | Step 4 | Creates the official `10.3.0` Git tag and GitHub Release for `incubator-kie` and `incubator-kie-tools` |
| 8 | Release Nexus staging → Maven Central | Step 5a | Manual action in Nexus UI |
| 9 | Move SVN `dev` → `release` | Step 5b | |
| 10 | Run `release-publish` job | Step 5c | GitHub Release was already created in step 7 (Step 4b); pass `GITHUB_RELEASE_TAG=10.3.0` |
| 11 | Delete superseded RC from SVN dev | Step 5d | |
| 12 | Send announcement email | Step 6 | |

### Patch Release (e.g. `10.3.1`)

The `10.3.x` branch and its Jenkins folder already exist — skip Step 1.
Apply bug fixes to `10.3.x` in both repos, then follow Steps 2–6 using version `10.3.1`.

### Failed Vote (e.g. `10.3.0-rc1` fails)

Apply required fixes to `10.3.x` in both repos, then repeat Steps 2–3 with the next RC tag (`10.3.0-rc2`) until a vote passes, and continue with Steps 4–6. The branch already exists, so the jobs do not cut it again.

---

## 5. What Changed from 10.2 to 10.3

| Area | 10.2 | 10.3+ |
|---|---|---|
| **Java repositories** | 4 separate repos (`drools`, `optaplanner`, `kogito-runtimes`, `kogito-apps`) | 1 unified reactor in `incubator-kie` |
| **Java build** | `mvn clean install` in each repo separately | `./script/release/release-all.sh` covers all Java modules |
| **Java release** | One Jenkins job per repo | `Jenkinsfile.103xplus.release-candidate` (RC), `Jenkinsfile.103xplus.release-promote` (tag) |
| **KIE Tools release** | Multiple per-component Jenkinsfiles | `Jenkinsfile.103xplus.release-candidate` (RC), `Jenkinsfile.103xplus.release-promote` (tag), `Jenkinsfile.103xplus.release-publish` |
| **Tools source archive** | One combined ZIP | `apache-kie-<version>-incubating-sources.zip`, produced by `scripts/release/create-source-tarball.sh` |
| **Removed packages** | Included deprecated components | `dashbuilder-*`, `sonataflow-*`, `yard-*`, `serverless-logic-*` are no longer released |

---

## 6. Troubleshooting

When a job fails, open the console log, find the **last stage that started**, and use the table of that job. "State left behind" is what the failed run already changed outside Jenkins; it decides whether a re-run is safe.

Most failures come from wrong parameters or credentials. Before any re-run, check the [job parameters](#job-parameters) and use the correct values: version and RC tag.

**Tag already exists.** Both RC jobs push the RC tag *before* they build, so after any later failure the tag is on `origin` and a re-run with the same tag is rejected. Check it with `git ls-remote --tags origin '10.3.0-rc1*'`. If nothing was staged or announced for that RC, delete it (`git push origin :refs/tags/10.3.0-rc1`) and re-run. Otherwise use the next RC number (`10.3.0-rc2`), unused in **both** repositories. Never delete or move a tag that was voted on or published.

### 6.1 `incubator-kie` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Initialize & Validate | None | Yes | Fix the parameter. `TAG_NAME` must start with `RELEASE_VERSION`. |
| Create Stream Branch | `10.3.x` on `origin`, if the push succeeded | **Yes** | Set `CREATE_STREAM_BRANCH=false`; re-run normally from `10.3.x`. |
| Execute Release Scripts — before tag push | None | Yes | Set `PUSH_TAG=false` or `DRY_RUN=true`; investigate the failure and re-run with the same tag. |
| Execute Release Scripts — after tag push | RC tag on `origin` | **No** with the same tag | See *Tag already exists*. Delete the tag if no staging content was uploaded, then re-run. Otherwise use the next RC number. |
| Execute Release Scripts — after deploy starts | Partial staging repository in Nexus | **No** | **Drop** the partial staging repository in the Nexus UI, then see *Tag already exists*. |

### 6.2 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Create stream branch | `10.3.x` on `origin`, if the push succeeded | **No**, with `CREATE_STREAM_BRANCH=true` | The branch already exists. Re-run with `CREATE_STREAM_BRANCH=false`, and `UPDATE_STREAM_VERSION=true` only if the version update is not done yet. |
| Check release version against package.json | None | Yes | `Version mismatch`: fix `RELEASE_VERSION`, or check that the build ran on the expected branch. |
| Create and push RC tag | RC tag on `origin` | **No** | See *Tag already exists*. If the parameters were left at the defaults, a `0.0.0-rc1` tag was pushed: delete it and re-run with the correct values. |
| Publish to Apache SVN | RC tag on `origin`; possibly a partial directory in `dist/dev/incubator/kie/10.3.0-rc1/` | **No**, with the same tag | `401` / `Authorization failed`: the job must use the Jenkins credential `kie-svn-credentials`, which has push access to Apache SVN. Fix the credential, then follow *Tag already exists*. 


### 6.3 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-publish`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Validate parameters | None | Yes | Set the voted RC tag as `BASE_REF`, and a `GITHUB_RELEASE_TAG` whose GitHub Release already exists (Step 5c). |
| Publish | **Some registries published, others not.** `release-all.sh` continues after a failure and lists the failed components at the end | **No**, not blindly | Check each registry first and publish only what is missing. NPM packages already published are skipped. The VS Code Marketplace, Chrome Web Store and OCI (Helm) registry reject an existing version. Container images are overwritten. A GitHub asset with an existing name fails: delete it on the GitHub Release first. |
