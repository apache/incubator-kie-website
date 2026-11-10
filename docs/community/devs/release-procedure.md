---
id: release-procedure
title: Release Procedure
sidebar_position: 1
---

How to perform an Apache KIE release, from the first Release Candidate (RC) to the final release.

> Since **10.3**, all Java components (Drools, OptaPlanner, jBPM, Kogito Runtimes, Kogito Apps) are released from a single repository:
>
> - `apache/incubator-kie`
>
> KIE tools and extensions are released from:
>
> - `apache/incubator-kie-tools`
>
> A complete release now involves **two repositories** and one release job per repository.

---

## Overview

Releases are executed using Jenkins jobs in:

- [`apache/incubator-kie`](https://github.com/apache/incubator-kie)
- [`apache/incubator-kie-tools`](https://github.com/apache/incubator-kie-tools)

The only manual steps are:

- Closing and releasing the Nexus staging repository
- Running the community votes
- Sending release announcements

### Release flow

1. Prepare a new minor release stream (minor releases only)
2. Build and stage a Release Candidate
3. Verify and vote
4. Promote the approved RC
5. Publish artifacts
6. Announce the release

### Useful links

#### Jenkins

- **`incubator-kie`**:
  - [Main folder](https://ci-builds.apache.org/job/KIE/job/drools/job/main/)
  - [Release builder image](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-build-kie-kogito-ci/)
  - [Release candidate](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-candidate/)
  - [Release promote](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-promote/)
- **`incubator-kie-tools`**:
  - [Main folder](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/)
  - [CI image build](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/job/ci/job/kie-tools-ci-image-build/job/main/)
  - [Release candidate](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-candidate/)
  - [Release promote](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/release-kie-release-promote/)
  - [Release publish](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-publish/)

#### Apache services and registries

- [Nexus](https://repository.apache.org)
- [Dev Dist SVN](https://dist.apache.org/repos/dist/dev/incubator/kie/)
- [Release Dist SVN](https://dist.apache.org/repos/dist/release/incubator/kie/)
- [Maven Central](https://central.sonatype.com/search?q=org.apache.kie)

#### GitHub releases

- [`apache/incubator-kie` releases](https://github.com/apache/incubator-kie/releases)
- [`apache/incubator-kie-tools` releases](https://github.com/apache/incubator-kie-tools/releases)

#### Voting archives

- [`dev@kie.apache.org` archive](https://lists.apache.org/list.html?dev@kie.apache.org) ([Previous KIE vote threads](https://lists.apache.org/list.html?dev@kie.apache.org:lte=1M:%5BVOTE%5D))
- [`general@incubator.apache.org` archive](https://lists.apache.org/list.html?general@incubator.apache.org) ([Previous IPMC vote threads](https://lists.apache.org/list.html?general@incubator.apache.org:lte=1M:%5BVOTE%5D%20Apache%20KIE))

---

## 1. Prepare a new minor release stream

> Only required before the first RC of a new minor series (for example `10.3.0-rc1`).

Skip this step for patch releases (`10.3.1`, `10.3.2`, etc.).

### 1.1 Create Jenkins folders

Create a stream folder such as `10.3.x` by copying the existing `main` folders:

- **`incubator-kie`**: Copy [`drools/job/main`](https://ci-builds.apache.org/job/KIE/job/drools/job/main/) to `drools/job/{STREAM_NAME}/`
- **`incubator-kie-tools`**: Copy [`kie-tools/job/main`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/) to `kie-tools/job/{STREAM_NAME}/`

### 1.2 Build CI images

- **`incubator-kie`**: Trigger [`release-build-kie-kogito-ci`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-build-kie-kogito-ci/) with `IMAGE_TAG={STREAM_NAME}-latest` (e.g. `10.3.x-latest`). Verify the tag on [Docker Hub](https://hub.docker.com/r/apache/incubator-kie-kogito-ci-build/tags).
- **`incubator-kie-tools`**: If `.ci/incubator-kie-tools-ci-build.Dockerfile` changed on `main`, trigger [`kie-tools-ci-image-build`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/main/job/ci/job/kie-tools-ci-image-build/job/main/) with `IMAGE_TAG=main`.

---

## 2. Build and stage a release candidate

### Parameters

#### First RC (e.g. `10.3.0-rc1`)

```text
RELEASE_VERSION=10.3.0
TAG_NAME=10.3.0-rc1
CREATE_STREAM_BRANCH=true
```

*Additional parameter for `incubator-kie-tools`:* `UPDATE_STREAM_VERSION=true`

#### Later RCs and patch releases (e.g. `10.3.0-rc2`, `10.3.1-rc1`)

```text
RELEASE_VERSION=<version>
TAG_NAME=<tag>
CREATE_STREAM_BRANCH=false
```

### 2.1 Run `incubator-kie` release candidate

Trigger [`apache/incubator-kie :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-candidate/) with the parameters above.

#### After completion

1. Open [repository.apache.org](https://repository.apache.org)
2. Navigate to **Staging Repositories**
3. Locate the generated repository: `orgapachekie-XXXX`
4. Click **Close**
5. Save the staging repository URL for the vote email

---

### 2.2 Run `incubator-kie-tools` release candidate

Trigger [`apache/incubator-kie-tools :: release-candidate`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-candidate/) with the parameters above.

Artifacts and their `.asc` signatures and `.sha512` checksums are uploaded to [Apache SVN Dev Dist](https://dist.apache.org/repos/dist/dev/incubator/kie/):

```text
https://dist.apache.org/repos/dist/dev/incubator/kie/<rc-version>/
```

<details>
<summary><b>Full artifact list staged in SVN (click to expand)</b></summary>

**VS Code extensions (`.vsix`)**
- `apache-kie-10.3.0-incubating-bpmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-business-automation-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-dmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-drl-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-extended-services-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-kogito-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-pmml-vscode-extension.vsix`

**Chrome extensions (`.zip`)**
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension.zip`
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension-editors.zip`

**Web apps, accelerators, npm packages, and sources (`.zip`)**
- `apache-kie-10.3.0-incubating-sandbox-webapp.zip`
- `apache-kie-10.3.0-incubating-sandbox-accelerator-quarkus.zip`
- `apache-kie-10.3.0-incubating-tools-npm-packages.zip`
- `apache-kie-10.3.0-incubating-sources.zip`

**Helm charts (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-sandbox-helm-chart.tar.gz`
- `apache-kie-10.3.0-incubating-runtime-tools-console-helm-chart.tar.gz`

**Container images (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-cors-proxy-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-management-console-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-base-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-dmn-form-webapp-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-quarkus-blank-app-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-extended-services-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-webapp-image.tar.gz`

**Upload service binaries (`.tar.gz`)**
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-linux-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-arm64.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-windows-x86.tar.gz`

Each file is accompanied by a `.asc` PGP signature and a `.sha512` checksum.

</details>

---

## 3. Verify and vote

### 3.1 Verify the RC

Before opening any vote, verify checksums, signatures, licenses, and source builds following the [verification guide](/community/devs/verify).

---

### 3.2 PPMC vote

Send a vote email to: `dev@kie.apache.org`

Requirements:
- Vote open for at least **72 hours**
- Minimum **3 binding +1 votes** from PPMC members

Archives:
- [`dev@kie.apache.org` archive](https://lists.apache.org/list.html?dev@kie.apache.org)
- [Previous KIE vote threads](https://lists.apache.org/list.html?dev@kie.apache.org:lte=1M:%5BVOTE%5D)

---

### 3.3 IPMC vote

After the PPMC vote passes:
1. Send `[RESULT][VOTE]` to `dev@kie.apache.org`
2. Start the IPMC vote by sending a vote email to `general@incubator.apache.org`

Requirements:
- Vote open for at least **72 hours**
- Minimum **3 binding +1 votes** from IPMC members

Archives:
- [`general@incubator.apache.org` archive](https://lists.apache.org/list.html?general@incubator.apache.org)
- [Previous IPMC vote threads](https://lists.apache.org/list.html?general@incubator.apache.org:lte=1M:%5BVOTE%5D%20Apache%20KIE)

#### If the vote fails

1. Fix issues on the stream branch (`10.3.x`)
2. Create a new RC (`rc2`, `rc3`, ...)
3. Repeat Step 2 and Step 3

---

## 4. Promote the approved release

Run promotion jobs only after the IPMC vote passes.

---

### 4.1 Promote `incubator-kie`

Trigger [`apache/incubator-kie :: release-promote`](https://ci-builds.apache.org/job/KIE/job/drools/job/{STREAM_NAME}/job/release-kie-release-promote/) with:

```text
PROJECT_VERSION=10.3.0
GIT_TAG=10.3.0-rc1
BUILD_BRANCH_NAME=10.3.x
```

---

### 4.2 Promote `incubator-kie-tools`

Trigger [`apache/incubator-kie-tools :: release-promote`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/release-kie-release-promote/) with:

```text
RELEASE_VERSION=10.3.0
BASE_REF=10.3.0-rc1
```

---

### Promotion verification

Verify final release creation:

- **GitHub releases**: Check [`apache/incubator-kie` releases](https://github.com/apache/incubator-kie/releases) and [`apache/incubator-kie-tools` releases](https://github.com/apache/incubator-kie-tools/releases)
- **Apache Release Dist**: Check [dist.apache.org/repos/dist/release/incubator/kie/](https://dist.apache.org/repos/dist/release/incubator/kie/) to verify `10.3.0/` exists
- **Apache Dev Dist**: Check [dist.apache.org/repos/dist/dev/incubator/kie/](https://dist.apache.org/repos/dist/dev/incubator/kie/) to verify temporary RC folders are removed

---

## 5. Publish artifacts

### 5.1 Release Nexus staging repository

1. Open [repository.apache.org](https://repository.apache.org)
2. Navigate to **Staging Repositories**
3. Select `orgapachekie-XXXX`
4. Click **Release**

Artifacts will sync to [Maven Central](https://central.sonatype.com/search?q=org.apache.kie).

---

### 5.2 Publish KIE Tools artifacts

Trigger [`apache/incubator-kie-tools :: release-publish`](https://ci-builds.apache.org/job/KIE/job/kie-tools/job/{STREAM_NAME}/job/kie-tools-release-publish/) with:

```text
BASE_REF=10.3.0-rc1
RELEASE_VERSION=10.3.0
GITHUB_RELEASE_TAG=10.3.0
```

#### Published destinations

| Artifact type | Destination |
|---------------|-------------|
| npm packages | [npm Registry (`@kie-tools`)](https://www.npmjs.com/search?q=%40kie-tools) |
| VS Code extensions | [Visual Studio Marketplace (`kie-group`)](https://marketplace.visualstudio.com/publishers/kie-group) |
| Chrome extensions | [Chrome Web Store](https://chromewebstore.google.com/search/KIE) |
| Container images | [Docker Hub (`apache/incubator-kie-*`)](https://hub.docker.com/u/apache) |
| Helm charts | [Docker Hub OCI Registry](https://hub.docker.com/u/apache) |
| Web applications | [GitHub Pages](https://apache.github.io/incubator-kie-tools/) |

---

## 6. Announce the release

Send announcement emails to:

- `dev@kie.apache.org`
- `announce@apache.org`

<details>
<summary><b>Announcement email template (click to expand)</b></summary>

```text
Subject: [ANNOUNCE] Apache KIE (incubating) 10.3.0 released

The Apache KIE (incubating) community is pleased to announce the release of Apache KIE 10.3.0.

Apache KIE is a unified platform for Business Automation, combining Business Rules (Drools), Decision Management (DMN), Business Processes (jBPM), and Cloud-Native Workflow technologies.

Download links:
- Tools and extensions: https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0/
- Java artifacts: Available on Maven Central under groupId "org.apache.kie"

Release notes and source code:
- https://github.com/apache/incubator-kie/releases/tag/10.3.0
- https://github.com/apache/incubator-kie-tools/releases/tag/10.3.0

Public registries:
- npm: https://www.npmjs.com/search?q=%40kie-tools
- VS Code Marketplace: https://marketplace.visualstudio.com/publishers/kie-group
- Docker Hub: https://hub.docker.com/u/apache

We would like to thank all contributors who made this release possible!

Regards,
The Apache KIE (incubating) Community
https://kie.apache.org/
```

</details>

---

## Steps to run locally

> For development, testing, and exceptional cases. Official releases should be executed via the Jenkins automation jobs above.

Ensure your environment has the required credentials (GPG signing key, ASF SVN credentials, Maven `settings.xml`, and GitHub CLI `gh`).

### Build and stage a release candidate locally

#### incubator-kie

```bash
git checkout 10.3.x && git pull

# Dry run (builds locally, no remote changes)
./script/release/release-all.sh --version 10.3.0 --tag 10.3.0-rc1 --skip-tests

# Real run (creates RC commit, pushes tag, and deploys to Nexus staging)
MAVEN_SETTINGS=/path/to/settings.xml \
MAVEN_GPG_PASSPHRASE="<your-gpg-passphrase>" \
./script/release/release-all.sh --version 10.3.0 --tag 10.3.0-rc1 --skip-tests --deploy --push-tag
```

#### incubator-kie-tools

```bash
git checkout 10.3.x && git pull
pnpm bootstrap

# 1. Build all RC artifacts into release-artifacts/
./scripts/release/release-all.sh 10.3.0 --rc

# 2. Sign each artifact
cd release-artifacts
for f in *; do
    gpg --no-tty --batch --pinentry-mode loopback --output "${f}.asc" --detach-sig "${f}"
    sha512sum "${f}" > "${f}.sha512"
done

# 3. Upload to Apache SVN Dev Dist
svn import . https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    -m "Apache KIE 10.3.0-rc1 artifacts"
```

---

### Promote an approved release locally

#### incubator-kie

```bash
# Fetch the approved RC tag
git fetch origin "refs/tags/10.3.0-rc1:refs/tags/10.3.0-rc1"

# Create and push final release tag
./script/release/05-tag-release.sh --rc-tag 10.3.0-rc1 --push

# Create GitHub Release
gh release create 10.3.0 \
  --repo apache/incubator-kie \
  --target 10.3.x \
  --title "10.3.0" \
  --generate-notes
```

#### incubator-kie-tools

```bash
# Fetch the approved RC tag
git fetch origin "refs/tags/10.3.0-rc1:refs/tags/10.3.0-rc1"

# Create and push final release tag
git tag -a 10.3.0 10.3.0-rc1 -m "Release 10.3.0"
git push origin 10.3.0

# Create GitHub Release
gh release create 10.3.0 \
  --repo apache/incubator-kie-tools \
  --title "10.3.0" \
  --generate-notes

# Move approved RC in Apache SVN from dev to release
svn move -m "Release Apache KIE 10.3.0" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
    https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0

# Delete any superseded RCs from dev
svn delete -m "Remove superseded RC" \
    https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc<N>
```

---

## Quick reference

### Minor release (`10.3.0`)

1. Create `10.3.x` Jenkins jobs
2. Build required CI images
3. Run RC jobs
4. Close Nexus staging repository
5. Verify RC
6. Run PPMC vote
7. Run IPMC vote
8. Run promote jobs
9. Release Nexus staging repository
10. Run publish job
11. Send announcement

---

### Patch release (`10.3.1`)

Skip Step 1.

1. Fix issues on `10.3.x`
2. Create RC
3. Vote
4. Promote
5. Publish
6. Announce

---

### Failed vote

1. Fix issues
2. Create next RC
3. Repeat verification and voting
4. Continue once vote passes

---

## Branches and tags

| Type | Example |
|--------|----------|
| Main branch | `main` |
| Release stream | `10.3.x` |
| RC tag | `10.3.0-rc1` |
| Final tag | `10.3.0` |

### Versioning rules

| Branch | Version |
|----------|-----------|
| `main` | `999-SNAPSHOT` / `0.0.0` |
| Stream branch | `10.3.999-SNAPSHOT` / `10.3.999` |
| Release tags | exact version (e.g. `10.3.0-rc1`, `10.3.0`) |

---

## Release outputs

| Repository | Output |
|------------|---------|
| `incubator-kie` | Maven artifacts (JARs, POMs, sources, Javadocs) |
| `incubator-kie-tools` | VS Code extensions, Chrome extensions, npm packages, web applications, Helm charts, source archives, container images |

---

## Important notes

- Never reuse an RC tag that has already been pushed.
- If an RC fails after tagging, always use the next RC number (e.g., `10.3.0-rc2`).
- Never move or delete a tag that has already been voted on or released.
- Verify signatures and checksums before every vote.