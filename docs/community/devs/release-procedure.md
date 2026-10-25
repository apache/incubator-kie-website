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
| ASF SVN staging credential | `incubator-kie-tools` release-candidate job (upload to `dist/dev`) | `svn` with your ASF account |
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
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.release` | Stream branch cut (optional), RC tag, build, deploy to Nexus staging |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.promote` | Final tag, GitHub Release, upload of Drools binaries and documentation |
| `incubator-kie` | `.ci/jenkins/Jenkinsfile.103xplus.deploy` | Stream snapshot version bump and deploy (not part of the release steps below) |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-candidate` | Stream branch cut (optional), RC tag, build, sign, upload to SVN `dist/dev` |
| `incubator-kie-tools` | `.ci/jenkins/Jenkinsfile.103xplus.release-publish` | Publish to public registries |

:::note
The `incubator-kie` `103xplus` Jenkinsfiles are **not** registered in `.ci/jenkins/dsl/jobs.groovy`, so no job is generated for them. Create each one as a "Pipeline script from SCM" job pointing at the Jenkinsfile. The `release` Jenkinsfile needs only its parameters. `promote` and `deploy` still read environment variables that the DSL normally injects (`REPO_NAME`, `GIT_AUTHOR`, `PROPERTIES_FILE_NAME`, `JENKINS_EMAIL_CREDS_ID`, `GIT_AUTHOR_PUSH_CREDS_ID`, ...), so set them on the job.
:::

---

## 1. Repositories & Requirements

### `incubator-kie` (Java)

| Item | Value |
|---|---|
| Stream branch | `10.3.x` |
| RC tag | `10.3.0-rc1` |
| Final tag | `10.3.0` |
| OS | Linux or macOS |
| JDK | Temurin 17.0.12+ (21 also works) |
| Maven | 3.9.6+ |
| Docker | 25+ |
| Build command | `./script/release/release-all.sh --version 10.3.0 --tag 10.3.0-rc1 --skip-tests` |
| Deploy command | add `--deploy --push-tag` to the build command |
| Produced artifacts | JARs, POMs, sources, and Javadocs deployed to Apache Nexus Staging |
| Update version | `./script/release/01-update-version.sh <version>` *(automated by `release-all.sh`)* |

### `incubator-kie-tools` (Node.js / Go)

| Item | Value |
|---|---|
| Stream branch | `10.3.x` |
| RC tag | `10.3.0-rc1` |
| Final tag | `10.3.0` |
| OS | Linux or macOS |
| Node.js | 24 or newer (`engines.node` is `>=24`) |
| pnpm | 10.34.4 (pinned by `packageManager`; enabled through `corepack`) |
| Go | 1.26 (`go 1.26.0` in the Go modules) |
| Bash | 4 or newer. `release-all.sh` uses associative arrays; the Bash 3.2 shipped with macOS does not work, install it with `brew install bash` |
| Helm | 3.x |
| Docker | 25+, **running**. If Docker is not running, container images are skipped |
| Build command | `./scripts/release/release-all.sh 10.3.0 --rc` |
| Publish command | `./scripts/release/release-all.sh 10.3.0 --publish` |
| Update own version | `pnpm update-version-to <version>` and `pnpm update-stream-name-to <stream>` |
| Update Java version | `pnpm update-kogito-version-to --maven <version>` |
| Produced artifacts | VS Code extensions (`.vsix`), Chrome extensions, web app ZIPs, NPM packages ZIP, Sources ZIP, container image tarballs, Helm chart tarballs, upload-service binaries — all in `release-artifacts/` |

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

### Step 1 — Create the Stream Branch

> **When:** Once per minor release series, before creating the first RC.
> **Example:** Creating `10.3.x` before releasing `10.3.0`.

This step creates the `10.3.x` branch in both repositories and sets their versions to the development placeholder (`10.3.999-SNAPSHOT`).

#### 1a. Duplicate the `main` Jenkins folder

Before you cut the branch, duplicate the `main` folder in Jenkins as `10.3.x` (copy the folder and its jobs, then point the jobs at the `10.3.x` branch). This lets `main` keep evolving without affecting a release that is in progress on `10.3.x`. Run all Jenkins jobs for this release from the `10.3.x` folder.

Do this once per minor series. Patch releases (`10.3.1`, ...) reuse the same folder.

#### 1b. Cut the branch

##### Via Jenkins

In both repositories the branch cut is a **flag on the first RC run** (Step 2), not a separate job. Setting the flag creates `10.3.x` from `main`, sets the development version, pushes the branch, and then continues with the RC on the new branch.

**`incubator-kie`:**
Trigger `Jenkinsfile.103xplus.release` with the Step 2a parameters plus:
- `CREATE_STREAM_BRANCH`: `true`
- `STREAM_BASE_BRANCH`: `main`

**`incubator-kie-tools`:**
Trigger `Jenkinsfile.103xplus.release-candidate` with the Step 2c parameters plus:
- `BASE_REF`: `main`
- `CREATE_STREAM_BRANCH`: `true`
- `UPDATE_STREAM_VERSION`: `true`
- `UPDATE_CI_IMAGE_TAG`: `true` only if the `incubator-kie-tools-ci-build:10.3.999` image has already been built and pushed. Leave it `false` otherwise, or the jobs on the new branch cannot start.

After this first run, use `BASE_REF`: `10.3.x` and leave the branch-cut flags `false` for every later run.

##### Locally

**`incubator-kie`:**
```bash
chmod +x script/release/*.sh

# Dry run first — checks branch status without making changes
./script/release/00-create-stream-branch.sh 10.3.0 --dry-run

# Create the branch, set version to 10.3.999-SNAPSHOT, and push
./script/release/00-create-stream-branch.sh 10.3.0 --push
```

**`incubator-kie-tools`:**
```bash
git checkout main && git pull
git checkout -b 10.3.x

pnpm update-version-to 10.3.999
pnpm update-stream-name-to 10.3.x
pnpm update-kogito-version-to --maven 10.3.999-SNAPSHOT

git add -A
git commit -m "chore: update version to 10.3.999"
git push origin 10.3.x
```

---

### Step 2 — Build & Stage a Release Candidate

> **When:** Each time you create a new RC (e.g. `10.3.0-rc1`, `10.3.0-rc2`).

This step builds all artifacts, signs them, and uploads them to staging for community verification.

#### 2a. Java reactor (`incubator-kie`)

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release` with:
- `RELEASE_VERSION`: `10.3.0`
- `TAG_NAME`: `10.3.0-rc1`
- `DEPLOY`: `true`
- `PUSH_TAG`: `true`
- `CREATE_STREAM_BRANCH`: `true` for the **first** RC of a new minor only (see Step 1b); `false` for `rc2`, the final release, and patch releases

:::note
When running the **first** RC of a new minor release (e.g. `10.3.0-rc1`), the `CREATE_STREAM_BRANCH=true` flag makes the job cut the `10.3.x` branch **and** build the RC in a single run. For every subsequent run (rc2, final release, patch releases) set `CREATE_STREAM_BRANCH=false` — the branch already exists and the job only builds the RC.
:::

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

#### 2b. KIE Tools (`incubator-kie-tools`)

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-candidate` with:
- `BASE_REF`: `10.3.x`
- `RELEASE_VERSION`: `10.3.0`
- `RELEASE_CANDIDATE_VERSION`: `10.3.0-rc1`

Jenkins builds, signs, and uploads all artifacts to Apache SVN Dev Dist at:
`https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1/`

:::note
The `CREATE_STREAM_BRANCH` flag works the same as in Step 2a: set it to `true` only for the first RC of a new minor release. Leave it `false` for all subsequent runs.
:::

**Locally:**
```bash
git checkout 10.3.x && git pull
pnpm bootstrap

# Step 1 — Build all RC artifacts into release-artifacts/
./scripts/release/release-all.sh 10.3.0 --rc 2>&1 | tee release-10.3.0-rc.log

# Step 2 — Sign each artifact
cd release-artifacts
for f in *; do
    gpg --armor --output "${f}.asc" --detach-sig "${f}"
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

#### 2c. Close the Nexus staging repository

After Step 2a (Java deploy) succeeds:
1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Find your `orgapachekie-XXXX` repository.
3. Click **Close**.
4. Copy the staging repository URL — you will need it in the voting email.

If the deploy failed part-way, **Drop** the partial staging repository instead of closing it (see [Troubleshooting](#6-troubleshooting)).

---

### Step 3 — Verify and Vote

Verification and voting are one continuous activity. The Release Manager (RM) performs the initial verification, opens the vote, and all other voters independently repeat the same verification before casting their binding vote. Apache KIE uses a two-stage vote: first within the project (PPMC), then with the Apache Incubator (IPMC).

#### 3a. Verify the RC

The RM verifies the RC artifacts (signatures, checksums, licenses, build from source). See [How to verify a release candidate](/community/devs/verify) for the full checklist. Do not open the vote before this step passes.

Community voters are expected to perform the same verification independently before casting a binding vote.

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

### Step 4 — Tag the Official Release

> **When:** After the IPMC vote passes.

#### Via Jenkins

**`incubator-kie`:**
Trigger `Jenkinsfile.103xplus.promote` with:
- `PROJECT_VERSION`: `10.3.0`
- `GIT_TAG`: the approved RC tag, e.g. `10.3.0-rc1` (the final tag `10.3.0` is derived from it)
- `BUILD_BRANCH_NAME`: `10.3.x`
- `DEPLOY_BUILD_URL`: *(optional)* URL of the deploy job build whose version-bump PR should be merged. Leave empty if there is none.

Besides creating the final tag with `05-tag-release.sh`, this job also creates the GitHub Release for `incubator-kie` and, for the `main` stream, uploads the Drools binaries and documentation.

**`incubator-kie-tools`:**
There is no job for this step. Create the final Git tag pointing to the winning RC commit and push it:

```bash
git fetch origin 10.3.0-rc1
git tag -a 10.3.0 10.3.0-rc1 -m "Release 10.3.0"
git push origin 10.3.0
```

#### Locally (`incubator-kie` only)

```bash
./script/release/05-tag-release.sh --rc-tag 10.3.0-rc1 --push
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

**Create the GitHub Release first.** The publish job uploads binary assets to an **existing** GitHub Release and fails at *Validate parameters* otherwise. Nothing in the tools flow creates it for you:

```bash
gh release create 10.3.0 --repo apache/incubator-kie-tools \
  --title "Apache KIE Tools 10.3.0" --notes "Apache KIE Tools 10.3.0"
```

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

#### 5d. Clean up superseded RC from SVN dev

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
| 1 | Duplicate the `main` Jenkins folder as `10.3.x` | Jenkins | Once per minor series |
| 2 | Create stream branch `10.3.x` and build & stage `10.3.0-rc1` | Step 1 + Step 2a/2b | Java: one job does both; Tools: one job does both |
| 3 | Close the Nexus staging repository | Step 2c | Copy the staging URL for the vote email |
| 4 | Verify the RC | Step 3a | See [How to verify a release candidate](/community/devs/verify) |
| 5 | PPMC vote on `dev@kie.apache.org` | Step 3b | 72 h, 3 binding +1 |
| 6 | IPMC vote on `general@incubator.apache.org` | Step 3c | 72 h, 3 binding +1 |
| 7 | Tag official release `10.3.0` in both repos | Step 4 | |
| 8 | Promote Nexus → Maven Central | Step 5a | |
| 9 | Move SVN `dev` → `release` | Step 5b | |
| 10 | Create the GitHub Release and publish KIE Tools | Step 5c | The GitHub Release must exist before the publish job runs |
| 11 | Delete superseded RC from SVN dev | Step 5d | |
| 12 | Send announcement email | Step 6 | |

### Patch Release (e.g. `10.3.1`)

The `10.3.x` branch and its Jenkins folder already exist — skip Step 1.
Apply bug fixes to `10.3.x` in both repos, then follow Steps 2–6 using version `10.3.1`.

### Failed Vote (e.g. `10.3.0-rc1` fails)

Apply required fixes to `10.3.x` in both repos, then repeat Steps 2–6 with the next RC tag (`10.3.0-rc2`). Do **not** set `CREATE_STREAM_BRANCH` again.

---

## 5. What Changed from 10.2 to 10.3

| Area | 10.2 | 10.3+ |
|---|---|---|
| **Java repositories** | 4 separate repos (`drools`, `optaplanner`, `kogito-runtimes`, `kogito-apps`) | 1 unified reactor in `incubator-kie` |
| **Java build** | `mvn clean install` in each repo separately | `./script/release/release-all.sh` covers all Java modules |
| **Java release** | One Jenkins job per repo | `Jenkinsfile.103xplus.release` (RC), `Jenkinsfile.103xplus.promote` (final) |
| **KIE Tools release** | Multiple per-component Jenkinsfiles | Single `Jenkinsfile.103xplus.release-candidate` / `release-publish` |
| **Tools source archive** | One combined ZIP | `apache-kie-<version>-incubating-sources.zip`, produced by `scripts/release/create-source-tarball.sh` |
| **Removed packages** | Included deprecated components | `dashbuilder-*`, `sonataflow-*`, `yard-*`, `serverless-logic-*` are no longer released |

---

## 6. Troubleshooting

Every job below can be re-run, but **not every re-run is safe**. Check the "state left behind" column before you re-trigger anything. Whenever a job fails, open the console log first and note which stage failed.

### 6.1 `incubator-kie` — `Jenkinsfile.103xplus.release`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Parameter validation | None | Yes | Fix the parameter (`TAG_NAME` must start with `RELEASE_VERSION` and be a new tag) and re-run. |
| Branch cut (`CREATE_STREAM_BRANCH=true`) | Possibly the `10.3.x` branch on `origin` if the push succeeded | **No** — the script fails if `10.3.x` already exists | If `10.3.x` is on `origin` and has the `10.3.999-SNAPSHOT` version, re-run with `CREATE_STREAM_BRANCH=false`. If the branch is there but the version is wrong, fix it by hand on the branch, or delete the branch and start again. |
| R commit + RC tag (`02-rc-commit.sh`) | Local-only temporary branch and local tag (the workspace is wiped after the job). The tag is on `origin` only if `PUSH_TAG=true` and the push succeeded | **No** when the tag is already on `origin`, because the script refuses to overwrite an existing tag | If the tag is **not** on `origin`, re-running is safe. If it **is** on `origin`, check with `git ls-remote --tags origin 10.3.0-rc1`; then either delete the unused tag (`git push origin :refs/tags/10.3.0-rc1`, only if nobody has used it) or use the next RC number. |
| Build (`03-build.sh`) | The RC tag, which `02-rc-commit.sh` has already pushed when `PUSH_TAG=true`. Nothing else remote | **No** with the same `TAG_NAME` | The tag is pushed **before** the build starts. A code fix needs a **new RC tag** (`rc2`). For a flaky or infrastructure failure, delete the unused tag from `origin` and re-run with the same `TAG_NAME`, or just use the next RC number. |
| Deploy to Nexus staging (`04-deploy-to-staging.sh`) | The RC tag on `origin`, and possibly a **partial staging repository** `orgapachekie-XXXX` | **No** — a second deploy creates a second staging repository, and the tag already exists | Log in to [repository.apache.org](https://repository.apache.org), **Drop** the partial staging repository, then use the next RC number (or delete the unused tag first). Never close or release a partial staging repository. |

### 6.2 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Branch cut (`CREATE_STREAM_BRANCH` / `UPDATE_STREAM_VERSION`) | `10.3.x` branch on `origin` | **No** with `CREATE_STREAM_BRANCH=true` once the branch exists | Re-run with `CREATE_STREAM_BRANCH=false` and `UPDATE_STREAM_VERSION=true` to finish the version update on the existing branch. |
| Create and push RC tag | RC tag on `origin` | **No** — creating the same tag fails | Use the next RC number, or delete the unused tag from `origin`. |
| Build (`release-all.sh --rc`) | RC tag already on `origin`. No remote artifacts yet | Only with a new RC tag | `release-all.sh` runs every component and reports the failed ones at the end. Fix them and re-run with the next RC number. |
| Sign | Nothing remote | Yes, together with the build | Check that the GPG key credential was imported. |
| Publish to SVN | Possibly an **empty** `dist/dev/incubator/kie/10.3.0-rc1/` directory. The SVN commit is atomic, so files are either all uploaded or none | **Yes**, if the commit did not go through. The job reuses an existing directory | Re-run with the same `RELEASE_CANDIDATE_VERSION`. If the commit did go through and the files are wrong, `svn delete` the directory first, because the job cannot overwrite files that already exist. |

### 6.3 `incubator-kie` — `Jenkinsfile.103xplus.promote`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Initialization | None | Yes | `GIT_TAG` must be the approved RC tag, and `BUILD_BRANCH_NAME` must match the version (`10.3.0` → `10.3.x`). |
| Merge deploy PR | The deploy PR may be approved or set to auto-merge | Yes | Check the PR state on GitHub and merge it by hand if needed. The stage is skipped when the deploy build has no PR link. |
| Tag final release (`05-tag-release.sh`) | Final tag on `origin` if the push succeeded | **No** once the tag exists | Check `git ls-remote --tags origin 10.3.0`. If the tag already points at the RC commit, skip the stage by continuing with the next one manually. If it points elsewhere, **stop and ask the PPMC**. Never move a release tag. |
| Create release | GitHub Release | Yes — an existing release with the same tag is deleted and re-created | Re-run. |
| Upload binaries and documentation | Files on the Drools file server | Yes | Only runs for the `main` stream and the `apache` organisation. Re-uploading overwrites the files. |

### 6.4 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-publish`

The publish job runs several independent publishers. **A failure part-way through leaves some registries published and others not.** `release-all.sh` continues after a failed component and lists the failures at the end.

| Component | Re-run behaviour | What to do on failure |
|---|---|---|
| NPM packages | Safe. Versions that are already published are skipped. | Re-run. |
| VS Code extensions | **Not idempotent.** The marketplace rejects a version that is already published. | Check the marketplace first. Publish only the missing extensions by hand with `npx vsce publish --packagePath <file>.vsix`. |
| Chrome extensions | Re-uploading the same version is rejected by the Chrome Web Store. | Check the dashboard before retrying. |
| Container images | Pushing an existing tag overwrites it. | Re-run. Avoid this if a pushed image has already been used. |
| Helm charts | Pushing an existing version may be rejected by the OCI registry. | Check the registry and push the missing charts by hand with `helm push`. |
| GitHub assets | Uploading an asset with an existing name fails. | Delete the asset on the GitHub Release and re-run. |

If the job fails at **Validate parameters** with `GITHUB_RELEASE_TAG must be set`, create the GitHub Release first (see Step 5c).

### 6.5 General rules

- Never delete or move a tag that has been voted on or published.
- Never re-use an RC number for different content. If the content changes, create a new RC.
- Nexus staging repositories are not versioned. Always check [repository.apache.org](https://repository.apache.org) for stray `orgapachekie-XXXX` repositories after a failed deploy.
- When in doubt, ask on `dev@kie.apache.org` before re-running a job that publishes.
