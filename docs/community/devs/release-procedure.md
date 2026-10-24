---
id: release-procedure
title: Release Procedure
sidebar_position: 1
---

This document describes how to perform an Apache KIE release. It covers the repositories involved, how branches and tags are named, and every step from creating a release candidate to publishing the final release.

:::note
Starting with **10.3**, all Java components (Drools, OptaPlanner, Kogito Runtimes, and Kogito Apps) were merged into a single repository called `incubator-kie`. This means the release process is now a **two-repo, single-command** workflow instead of the four-repo process used in 10.2.
:::

---

## Overview

A KIE release involves two repositories:

| Repository | What it contains | Language / tooling |
|---|---|---|
| [`incubator-kie`](https://github.com/apache/incubator-kie) | Drools, OptaPlanner, Kogito Runtimes, Kogito Apps | Java / Maven |
| [`incubator-kie-tools`](https://github.com/apache/incubator-kie-tools) | VS Code extensions, Chrome extensions, web apps, container images, Helm charts | Node.js / Go / pnpm |

All release scripts live inside each repository:
- **`incubator-kie`**: [`script/release/`](https://github.com/apache/incubator-kie/tree/main/script/release/) — each script supports `--dry-run`.
- **`incubator-kie-tools`**: [`scripts/release/`](https://github.com/apache/incubator-kie-tools/tree/main/scripts/release/) — see the `README.md` there for details.

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
| Node.js | 22 |
| pnpm | 9.x or 10.x |
| Go | 1.21+ |
| Helm | 3.x |
| Docker | 25+ |
| Build command | `./scripts/release/release-all.sh 10.3.0 --rc` |
| Publish command | `./scripts/release/release-all.sh 10.3.0 --publish` |
| Update own version | `pnpm update-version-to <version>` and `pnpm update-stream-name-to <stream>` |
| Update Java version | `pnpm update-kogito-version-to --maven <version>` |
| Produced artifacts | VS Code extensions (`.vsix`), Chrome extensions, web app ZIPs, NPM packages ZIP, Sources ZIP, container image tarballs, Helm chart tarballs, upload-service binaries — all in `release-artifacts/` |

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

#### Via Jenkins

**`incubator-kie`:**
Trigger `Jenkinsfile.103xplus.release` with base branch `main`. It creates `10.3.x` and sets the version to `10.3.999-SNAPSHOT`.

**`incubator-kie-tools`:**
Trigger `Jenkinsfile.103xplus.release-candidate` with:
- `BASE_REF`: `main`
- `CREATE_STREAM_BRANCH`: `true`
- `UPDATE_STREAM_VERSION`: `true`

#### Locally

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

**After the Java build — close the Nexus staging repository:**
1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Find your `orgapachekie-XXXX` repository.
3. Click **Close**.
4. Copy the staging repository URL — you will need it in the voting email.

#### 2b. KIE Tools (`incubator-kie-tools`)

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-candidate` with:
- `BASE_REF`: `10.3.x`
- `RELEASE_VERSION`: `10.3.0`
- `RELEASE_CANDIDATE_VERSION`: `10.3.0-rc1`

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
- `apache-kie-10.3.0-incubating-java-sources.zip`

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

### Step 3 — Community Verification

Before voting, the community verifies the RC artifacts. See [How to verify a release candidate](/community/devs/verify) for the full checklist.

---

### Step 4 — Voting

Apache KIE uses a two-stage vote: first within the project (PPMC), then with the Apache Incubator (IPMC).

#### 4a. PPMC Vote

- Send a `[VOTE]` email to `dev@kie.apache.org`.
- The vote must be open for at least **72 hours**.
- At least **3 binding +1 votes** from PPMC members are required to pass.
- For the standard email format (with RC tags, staging links, and KEYS), refer to previous vote threads in the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

#### 4b. IPMC Vote

- Once the PPMC vote passes, send a `[RESULT][VOTE]` email to `dev@kie.apache.org`.
- Then send a `[VOTE]` email to `general@incubator.apache.org`.
- The vote must be open for at least **72 hours**.
- At least **3 binding +1 votes** from IPMC members are required to pass.
- For the standard email format, refer to previous vote threads in the [general@incubator.apache.org archive](https://lists.apache.org/list.html?general@incubator.apache.org).

**If the vote fails**, apply the required fixes to `10.3.x` in both repositories and go back to Step 2 with the next RC tag (e.g. `10.3.0-rc2`).

---

### Step 5 — Tag the Official Release

> **When:** After the IPMC vote passes.

#### Via Jenkins

**`incubator-kie`:**
Trigger `Jenkinsfile.103xplus.promote` with:
- `PROJECT_VERSION`: `10.3.0`
- `GIT_TAG`: `10.3.0-rc1`
- `BUILD_BRANCH_NAME`: `10.3.x`

**`incubator-kie-tools`:**
Create the final Git tag pointing to the winning RC commit and push it:

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

### Step 6 — Publish to Public Registries

#### 6a. Promote Nexus staging to Maven Central

1. Go to [repository.apache.org](https://repository.apache.org) → **Staging Repositories**.
2. Select `orgapachekie-XXXX`.
3. Click **Release**.

#### 6b. Move SVN artifacts from `dev` to `release`

```bash
svn move -m "Release Apache KIE 10.3.0" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0
```

#### 6c. Publish KIE Tools artifacts

**Via Jenkins:**
Trigger `Jenkinsfile.103xplus.release-publish` with:
- `BASE_REF`: `10.3.0-rc1`
- `RELEASE_VERSION`: `10.3.0`
- `GITHUB_RELEASE_TAG`: `10.3.0`

This automatically publishes:
- NPM packages → npm registry
- VS Code extensions → Visual Studio Marketplace
- Chrome extensions → Chrome Web Store
- Container images → Docker Hub (`docker.io/apache/incubator-kie-*`)
- Helm charts → Docker Hub OCI registry
- GitHub Pages → updated

#### 6d. Clean up superseded RC from SVN dev

```bash
svn delete -m "Remove superseded RC" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1
```

---

### Step 7 — Announce the Release

Send the official release announcement email to:
- `dev@kie.apache.org`
- `announce@apache.org`

For the standard email format, refer to previous announcement threads in the [dev@kie.apache.org archive](https://lists.apache.org/list.html?dev@kie.apache.org).

---

## 4. Quick Reference Checklists

### Minor Release (first release from a new branch, e.g. `10.3.0`)

| # | Step | Notes |
|---|---|---|
| 1 | Create stream branch `10.3.x` in both repos | Run once per minor series |
| 2 | Build & stage `10.3.0-rc1` | Java → Nexus staging; Tools → SVN dev dist |
| 3 | Close Nexus staging repository | Copy staging URL for vote email |
| 4 | Community verification | See [How to verify a release candidate](/community/devs/verify) |
| 5 | PPMC vote on `dev@kie.apache.org` | 72 h, 3 binding +1 |
| 6 | IPMC vote on `general@incubator.apache.org` | 72 h, 3 binding +1 |
| 7 | Tag official release `10.3.0` in both repos | |
| 8 | Promote Nexus → Maven Central | |
| 9 | Move SVN `dev` → `release` | |
| 10 | Trigger Jenkins publish for KIE Tools | |
| 11 | Delete superseded RC from SVN dev | |
| 12 | Send announcement email | |

### Patch Release (e.g. `10.3.1`)

The `10.3.x` branch already exists — skip Step 1.  
Apply bug fixes to `10.3.x` in both repos, then follow Steps 2–12 using version `10.3.1`.

### Failed Vote (e.g. `10.3.0-rc1` fails)

Apply required fixes to `10.3.x` in both repos, then repeat Steps 2–12 with the next RC tag (`10.3.0-rc2`).

---

## 5. What Changed from 10.2 to 10.3

| Area | 10.2 | 10.3+ |
|---|---|---|
| **Java repositories** | 4 separate repos (`drools`, `optaplanner`, `kogito-runtimes`, `kogito-apps`) | 1 unified reactor in `incubator-kie` |
| **Java build** | `mvn clean install` in each repo separately | `./script/release/release-all.sh` covers all Java modules |
| **Java release** | One Jenkins job per repo | Single `Jenkinsfile.103xplus.release` (or `promote`) |
| **KIE Tools release** | Multiple per-component Jenkinsfiles | Single `Jenkinsfile.103xplus.release-candidate` / `release-publish` |
| **Source archives** | One combined ZIP | Two separate ZIPs: `java-sources.zip` and `sources.zip` |
| **Removed packages** | Included deprecated components | `dashbuilder-*`, `sonataflow-*`, `yard-*`, `serverless-logic-*` are no longer released |
