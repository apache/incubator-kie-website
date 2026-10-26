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

In both repositories the branch cut is a **flag on the first RC run** (Step 2), not a separate job and not a separate run. Setting the flag creates `10.3.x` from `main`, sets the development version, pushes the branch, and then continues with the RC on the new branch, all in the same build. So for `10.3.0-rc1` you trigger each job **once**, with the branch-cut flags set. Do not trigger a branch-cut run first and an RC run afterwards: the second run would fail because the branch already exists.

**`incubator-kie`:**
Trigger `Jenkinsfile.103xplus.release` with the Step 2a parameters plus:
- `CREATE_STREAM_BRANCH`: `true`
- `STREAM_BASE_BRANCH`: `main`

**`incubator-kie-tools`:**
Trigger `Jenkinsfile.103xplus.release-candidate` with the Step 2c parameters (`BASE_REF` is `main` for this one run) plus:
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

#### Parameter checklist (read before triggering any job)

Most failed releases come from a wrong parameter, and several parameters have no validation in the Jenkinsfile. Check these before you click **Build**:

| # | Check | Why |
|---|---|---|
| 1 | The version fields are filled in and consistent: `TAG_NAME` / `RELEASE_CANDIDATE_VERSION` is `<RELEASE_VERSION>-rcN` | The Java job validates this; the Tools RC job does **not**. Its defaults are `0.0.0` / `0.0.0-rc1`, so an untouched run pushes a `0.0.0-rc1` tag. |
| 2 | The RC number is new: `git ls-remote --tags origin '<tag>'` returns nothing in **both** repositories | A tag that already exists makes the job fail (see [Troubleshooting](#6-troubleshooting)). |
| 3 | Java job: its SCM branch is `10.3.x` (except for the branch-cut run) | The Java job has no branch parameter. It builds whatever branch the job is configured for and only prints a warning when that is not the stream branch. |
| 4 | Tools job: `BASE_REF` is `10.3.x` (and `main` only for the branch-cut run) | `BASE_REF` defaults to `main`. Forgetting to change it for `rc2` tags `main` content as `10.3.0-rc2`. |
| 5 | Branch-cut flags (`CREATE_STREAM_BRANCH`, `UPDATE_STREAM_VERSION`) are `true` **only** for the first RC of a new minor | They fail when `10.3.x` already exists. |
| 6 | Java job: `DEPLOY=true`, `PUSH_TAG=true`, `DRY_RUN=false` for the real run | With `DEPLOY=false` nothing reaches Nexus; with `PUSH_TAG=false` the tag stays on the agent and is lost when the workspace is wiped; with `DRY_RUN=true` nothing remote happens. |
| 7 | Credential ID parameters keep their defaults unless your Jenkins uses other IDs | A wrong ID fails the job when it first needs the credential. |
| 8 | For the very first run of a release, do a Java run with `DRY_RUN=true` first | It checks the parameters and the build without touching remote state. |

#### Parameters by type of run

The same two jobs are used for every RC. Only the parameters differ:

| Run | Java `Jenkinsfile.103xplus.release` | Tools `Jenkinsfile.103xplus.release-candidate` |
|---|---|---|
| **First RC of a new minor** (`10.3.0-rc1`) | `RELEASE_VERSION=10.3.0`, `TAG_NAME=10.3.0-rc1`, `CREATE_STREAM_BRANCH=true`, `STREAM_BASE_BRANCH=main`, `DEPLOY=true`, `PUSH_TAG=true` | `RELEASE_VERSION=10.3.0`, `RELEASE_CANDIDATE_VERSION=10.3.0-rc1`, `BASE_REF=main`, `CREATE_STREAM_BRANCH=true`, `UPDATE_STREAM_VERSION=true` |
| **Next RC after a failed vote** (`10.3.0-rc2`) | `TAG_NAME=10.3.0-rc2`, `CREATE_STREAM_BRANCH=false` | `RELEASE_CANDIDATE_VERSION=10.3.0-rc2`, `BASE_REF=10.3.x`, branch-cut flags `false` |
| **Patch release** (`10.3.1-rc1`) | `RELEASE_VERSION=10.3.1`, `TAG_NAME=10.3.1-rc1`, `CREATE_STREAM_BRANCH=false` | `RELEASE_VERSION=10.3.1`, `RELEASE_CANDIDATE_VERSION=10.3.1-rc1`, `BASE_REF=10.3.x`, branch-cut flags `false` |

The parameters not listed keep their defaults.

#### 2a. Java reactor (`incubator-kie`)

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release` with the parameters from the table above:
- `RELEASE_VERSION`: `10.3.0`
- `TAG_NAME`: `10.3.0-rc1`
- `DEPLOY`: `true`
- `PUSH_TAG`: `true`
- `CREATE_STREAM_BRANCH`: `true` for the **first** RC of a new minor only (see Step 1b); `false` for `rc2`, the final release, and patch releases

:::note
The first-RC run and every later run use the **same job**. The only difference is `CREATE_STREAM_BRANCH`: with `true`, the job first cuts the `10.3.x` branch and then builds the RC on it, in one build. With `false`, the branch already exists and the job only builds the RC.
:::

If the job fails, do not simply re-run it. The RC tag is pushed early in the job, so a plain re-run fails with "tag already exists". See [Troubleshooting](#6-troubleshooting).

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

#### 2c. KIE Tools (`incubator-kie-tools`)

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

If the job fails, do not simply re-run it. The RC tag is pushed before the build starts, so a plain re-run fails with "tag already exists". See [Troubleshooting](#6-troubleshooting).

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
| 2 | Create stream branch `10.3.x` and build & stage `10.3.0-rc1` | Step 1 + Step 2a/2c | Java: one job does both; Tools: one job does both |
| 3 | Close the Nexus staging repository | Step 2b | Copy the staging URL for the vote email |
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

When a job fails, open the console log, find the **last stage that started**, and use the table of that job. "State left behind" is what the failed run already changed outside Jenkins; it decides whether a re-run is safe.

Most failures come from wrong parameters or credentials. Before any re-run, check the [parameter checklist](#parameter-checklist-read-before-triggering-any-job) and use the correct values: version, RC tag, `BASE_REF`, and the branch-cut flags.

**Tag already exists.** Both RC jobs push the RC tag *before* they build, so after any later failure the tag is on `origin` and a re-run with the same tag is rejected. Check it with `git ls-remote --tags origin '10.3.0-rc1*'`. If nothing was staged or announced for that RC, delete it (`git push origin :refs/tags/10.3.0-rc1`) and re-run. Otherwise use the next RC number (`10.3.0-rc2`), unused in **both** repositories. Never delete or move a tag that was voted on or published.

### 6.1 `incubator-kie` — `Jenkinsfile.103xplus.release`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Initialize & Validate | None | Yes | Fix the parameter. `TAG_NAME` must start with `RELEASE_VERSION`. |
| Create Stream Branch | `10.3.x` on `origin`, if the push succeeded | **No**, with `CREATE_STREAM_BRANCH=true` | The branch already exists. Re-run with `CREATE_STREAM_BRANCH=false`. |


### 6.2 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-candidate`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Create stream branch | `10.3.x` on `origin`, if the push succeeded | **No**, with `CREATE_STREAM_BRANCH=true` | The branch already exists. Re-run with `CREATE_STREAM_BRANCH=false`, and `UPDATE_STREAM_VERSION=true` only if the version update is not done yet. |
| Check release version against package.json | None | Yes | `Version mismatch`: fix `BASE_REF` or `RELEASE_VERSION`. |
| Create and push RC tag | RC tag on `origin` | **No** | See *Tag already exists*. If the parameters were left at the defaults, a `0.0.0-rc1` tag was pushed: delete it and re-run with the correct values. |
| Publish to Apache SVN | RC tag on `origin`; possibly a partial directory in `dist/dev/incubator/kie/10.3.0-rc1/` | **No**, with the same tag | `401` / `Authorization failed`: the job must use the Jenkins credential `kie-svn-credentials`, which has push access to Apache SVN. Fix the credential, then follow *Tag already exists*. 


### 6.3 `incubator-kie` — `Jenkinsfile.103xplus.promote`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Initialization | None | Yes | `GIT_TAG` must be the approved RC tag and `BUILD_BRANCH_NAME` must match the version (`10.3.0` → `10.3.x`). |
| Merge deploy PR | The PR may be approved or set to auto-merge | Yes | Check the PR on GitHub and merge it by hand if needed. Leave `DEPLOY_BUILD_URL` empty if there is no PR. |
| Tag final release (`05-tag-release.sh`) | Final tag on `origin`, if the push succeeded | **No**, once the tag exists | Compare `git rev-parse 10.3.0^{commit}` with `git rev-parse 10.3.0-rc1^{commit}`. If equal, skip the stage. If different, **stop and ask the PPMC**. |
| Create release | GitHub Release | Yes | Re-run. An existing release for the same tag is deleted and re-created. |
| Upload drools binaries and documentation | Partly uploaded files | Yes | Re-run. Re-uploading overwrites. |

### 6.4 `incubator-kie-tools` — `Jenkinsfile.103xplus.release-publish`

| Failing stage | State left behind | Safe to re-run? | What to do |
|---|---|---|---|
| Validate parameters | None | Yes | Set the voted RC tag as `BASE_REF`, and a `GITHUB_RELEASE_TAG` whose GitHub Release already exists (Step 5c). |
| Publish | **Some registries published, others not.** `release-all.sh` continues after a failure and lists the failed components at the end | **No**, not blindly | Check each registry first and publish only what is missing. NPM packages already published are skipped. The VS Code Marketplace, Chrome Web Store and OCI (Helm) registry reject an existing version. Container images are overwritten. A GitHub asset with an existing name fails: delete it on the GitHub Release first. |
