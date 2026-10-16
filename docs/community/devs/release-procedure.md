---
id: release-procedure
title: Release Procedure
sidebar_position: 1
---

This document describes the pieces that compose an Apache KIE release, updated for the consolidated repository architecture and local-first release scripts introduced in 10.3.

- The **Repositories Matrix** table lists the two active repositories that make up an Apache KIE release (`incubator-kie` and `incubator-kie-tools`) with their build commands, version update commands, and produced artifacts.
- The **Branches Strategy** section depicts the Git timeline for the development stream and short-lived release branches/tags.
- The **Automations & Script Workflows** section details the local-first execution model and how Jenkins orchestrates release candidate builds, artifact staging, and final publication.

:::note
The scripts referenced below (`script/release/` and `scripts/release/`) live in their respective repositories. `docs/RELEASING.md` (in `incubator-kie`) and `repo/RELEASING.md` (in `incubator-kie-tools`) both point here as the single source of truth.
:::

---

## 1. Repositories Matrix

| # | Repo (`incubator-kie-[repo]`) | Git Ref | OS & Requirements | Build Command | Produced Artifacts | Update Own Version | Update Upstream Versions | Additional Release Command |
|---|---|---|---|---|---|---|---|---|
| 1 | **`incubator-kie`** *(Drools, OptaPlanner, Kogito Runtimes, Kogito Apps)* | Tag: `X.Y.Z` | Ubuntu 22.04+<br/>JDK 17.0.12+<br/>Maven 3.9.6+<br/>Docker 25+ | `./script/release/release-all.sh <version> --rc --skip-tests` | JARs, POMs, sources, and javadocs installed to `~/.m2/repository` | `./script/release/update-version.sh <version>` *(handled automatically by `02-rc-commit.sh`)* | n/a (single KIE reactor) | `./script/release/release-all.sh <version> --rc --deploy --push-tag` |
| 2 | **`incubator-kie-tools`** | Tag: `X.Y.Z` | Ubuntu 22.04+<br/>Node.js 22<br/>pnpm 9.x<br/>Go 1.21+<br/>Helm 3.x<br/>Docker 25+ | `./scripts/release/release-all.sh <version> --rc` | VS Code extensions (`.vsix`), Chrome extension ZIPs, WebApp ZIPs, Sources ZIP, NPM packages ZIP, container image tarballs, Helm chart tarballs — all in `release-artifacts/` | `pnpm update-version-to <version>`<br/>`pnpm update-stream-name-to <stream-name>` | `pnpm update-kogito-version-to --maven <version>` | `./scripts/release/release-all.sh <version> --publish` |

:::note
Since the 10.3.x consolidation, `drools`, `optaplanner`, `kogito-runtimes`, and `kogito-apps` are all modules of the same root POM in `incubator-kie`. The release process is a single-repo, single-command workflow.
:::

---

## 2. Branches Strategy

```
---c-------c---c---c-------------c---c------> main
   |                              |              v999-SNAPSHOT / v0.0.0
   |                              '----D------c-------> X.Y.x
   |                                           v X.Y.999-SNAPSHOT / X.Y.999
   '----D-------c----c----c---------c----> X.Y.x
        |       |                            v X.Y.999-SNAPSHOT / X.Y.999
        |       '--R--> t X.Y.0-rc2 ✅
        |               t X.Y.0
        |               v X.Y.0
        |
        '--R--> t X.Y.0-rc1 ❌
                v X.Y.0
```

### Legend

| Symbol | Meaning |
|--------|---------|
| `c` | Regular commit |
| `D` | Dev version commit — version updated to `major.minor.999-SNAPSHOT` (or `major.minor.999` in `kie-tools`) and upstream versions aligned |
| `R` | Release commit — version bumped to exact release version (e.g. `10.3.0`) |
| `t` | Git tag (`X.Y.Z-rcN` or `X.Y.Z`) |
| `b` | Git branch (`main`, `X.Y.x`) |
| `v` | Project version |

### Tag & Stream Rules

- **Release tags**: `major.minor.patch-rcN` (e.g. `10.3.0-rc1`) and `major.minor.patch` (e.g. `10.3.0`).
- Tags point to an **R commit** created on a temporary local branch that is deleted after tagging.
- Development stream branches (`X.Y.x`) remain on `X.Y.999-SNAPSHOT` (or `X.Y.999` in `kie-tools`).

---

## 3. Release Lifecycle & Workflows

### Automation A — Create New "Minor" Version Development Stream

**Description**: Sets up the `X.Y.x` release stream branches on `incubator-kie` and `incubator-kie-tools`.

**Execution Steps**:

1. **`incubator-kie`**:
   - Create branch `X.Y.x` from `main`.
   - Update versions to stream snapshot:
     ```bash
     ./script/release/update-version.sh X.Y.999-SNAPSHOT
     ```
   - Push branch `X.Y.x` to `origin`.

2. **`incubator-kie-tools`**:
   - Create branch `X.Y.x` from `main`.
   - Update versions:
     ```bash
     pnpm update-version-to X.Y.999
     pnpm update-stream-name-to X.Y.x
     pnpm update-kogito-version-to --maven X.Y.999-SNAPSHOT
     ```
   - Push branch `X.Y.x` to `origin`.

---

### Automation D — Release Candidate Generation

**Inputs**: Release version (e.g. `10.3.0`) and RC tag (e.g. `10.3.0-rc1`).

#### Step D.1 — Java Reactor RC (`incubator-kie`)

Run from the `incubator-kie` repository:

```bash
# RC mode: build, create R commit, sign and deploy to Apache Nexus staging, push tag
./script/release/release-all.sh 10.3.0 --rc --tag 10.3.0-rc1 --skip-tests --deploy --push-tag
```

**Actions executed internally**:

1. `02-rc-commit.sh` — Checks out a temporary branch, runs `01-update-version.sh 10.3.0`, commits the R commit, tags `10.3.0-rc1`, and pushes the tag.
2. `03-build.sh` — Runs `mvn clean install -DskipTests -Dfull` across all reactor modules.
3. `04-deploy-to-staging.sh` — Signs artifacts with GPG and deploys to Apache Nexus Staging (`https://repository.apache.org/service/local/staging/deploy/maven2`).

**Post-step**: Log into [repository.apache.org](https://repository.apache.org), inspect, and close the staging repository.

---

#### Step D.2 — KIE Tools RC (`incubator-kie-tools`)

Run from the `incubator-kie-tools` repository:

```bash
# 1. Update versions
pnpm update-version-to 10.3.0
pnpm update-kogito-version-to --maven 10.3.0
pnpm update-stream-name-to 10.3.0

# 2. Package all RC artifacts
./scripts/release/release-all.sh 10.3.0 --rc
```

**Artifacts produced in `release-artifacts/`** — all following the Apache Incubator naming convention `apache-kie-<version>-incubating-<artifact-name>.<ext>`:

**VS Code Extensions (`.vsix`)**
- `apache-kie-10.3.0-incubating-bpmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-dmn-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-drl-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-pmml-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-kogito-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-business-automation-bundle-vscode-extension.vsix`
- `apache-kie-10.3.0-incubating-extended-services-vscode-extension.vsix`

**Chrome Extensions**
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension.zip`
- `apache-kie-10.3.0-incubating-business-automation-chrome-extension-editors.zip`

**Web Applications, Accelerators & Sources**
- `apache-kie-10.3.0-incubating-sandbox-webapp.zip`
- `apache-kie-10.3.0-incubating-sandbox-accelerator-quarkus.zip`
- `apache-kie-10.3.0-incubating-sources.zip`
- `apache-kie-10.3.0-incubating-tools-npm-packages.zip`
- `apache-kie-10.3.0-incubating-business-automation-standalone-editors.zip`

**Helm Charts (`helm-charts/`)**
- `apache-kie-10.3.0-incubating-sandbox-helm-chart.tar.gz`
- `apache-kie-10.3.0-incubating-runtime-tools-console-helm-chart.tar.gz`

**Container Images (`container-images/`)**
- `apache-kie-10.3.0-incubating-cors-proxy-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-management-console-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-base-builder-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-data-index-postgresql-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-jit-runner-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-jobs-service-allinone-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-jobs-service-ephemeral-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-jobs-service-postgresql-image.tar.gz`
- `apache-kie-10.3.0-incubating-kogito-db-migrator-tool-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-base-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-dmn-form-webapp-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-quarkus-blank-app-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-extended-services-image.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-webapp-image.tar.gz`

**Cross-platform Binaries**
- `apache-kie-10.3.0-incubating-sonataflow-knative-plugin-linux-x86.zip`
- `apache-kie-10.3.0-incubating-sonataflow-knative-plugin-macOS-arm64.zip`
- `apache-kie-10.3.0-incubating-sonataflow-knative-plugin-macOS-x86.zip`
- `apache-kie-10.3.0-incubating-sonataflow-knative-plugin-windows-x86.zip`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-linux-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-arm64.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-macOS-x86.tar.gz`
- `apache-kie-10.3.0-incubating-sandbox-dev-deployment-upload-service-windows-x86.tar.gz`

---

#### Step D.3 — Upload to Apache SVN Dev Distribution

```bash
# Checkout SVN dev dist
svn co https://dist.apache.org/repos/dist/dev/incubator/kie/ /tmp/kie-dist-dev
mkdir -p /tmp/kie-dist-dev/10.3.0-rc1

# Sign and checksum all artifacts
cd incubator-kie-tools/release-artifacts
for f in $(find . -type f ! -name "*.asc" ! -name "*.sha512"); do
    gpg --armor --detach-sign "$f"
    sha512sum "$f" > "${f}.sha512"
done

# Copy to SVN and commit
cp -r . /tmp/kie-dist-dev/10.3.0-rc1/
cd /tmp/kie-dist-dev
svn add 10.3.0-rc1
svn commit -m "Apache KIE 10.3.0-rc1 release candidate artifacts"
```

---

### Manual Step E — Voting Procedure

1. Start a vote thread on [dev@kie.apache.org](mailto:dev@kie.apache.org) (minimum 72 hours, 3 binding +1 votes from PMC/PPMC members required).
2. Once the dev vote passes, start an IPMC vote thread on [general@incubator.apache.org](mailto:general@incubator.apache.org).
3. Once the IPMC vote passes, proceed to official release tagging.

---

### Manual Step F — Tag Official Release

Once the vote passes:

1. **Tag `incubator-kie`**:
   ```bash
   ./script/release/05-tag-release.sh --rc-tag 10.3.0-rc1 --push
   ```

2. **Tag `incubator-kie-tools`**:
   ```bash
   git tag -a 10.3.0 10.3.0-rc1 -m "Release 10.3.0"
   git push origin 10.3.0
   ```

---

### Automation G — Publish Release to Public Registries

To keep all release secrets, API keys, tokens, and bot credentials securely pre-configured in CI, **publication is executed via Jenkins** (`Jenkinsfile.103xplus.release-publish` / `Jenkinsfile.103xplus.deploy`) using Apache bot service accounts.

1. **Nexus Maven Release** — Release the closed staging repository at [repository.apache.org](https://repository.apache.org) (or trigger via the Jenkins deploy job).

2. **Move SVN dist dev → release**:
   ```bash
   svn move -m "Release Apache KIE 10.3.0" \
       https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1 \
       https://dist.apache.org/repos/dist/release/incubator/kie/10.3.0
   ```

3. **Publish KIE Tools components (`incubator-kie-tools`)** — the Jenkins release publish job runs with pre-configured credentials:
   - **NPM packages** — `@kie-tools/*` published to the npm registry via bot `NPM_TOKEN`.
   - **VS Code extensions** — published to the Visual Studio Marketplace via bot `VSCE_PAT`.
   - **Chrome extensions** — uploaded and published to the Chrome Web Store via Google API bot credentials.
   - **Container images** — pushed to `docker.io/apache/incubator-kie-*` via Apache bot Docker credentials.
   - **Helm charts** — pushed to OCI registry via Jenkins registry tokens.
   - **GitHub Pages** — sandbox webapp deployed to `incubator-kie-kogito-online` (`gh-pages` branch) via bot GitHub credentials.

   :::tip Local dry-run
   For testing without CI: `./scripts/release/release-all.sh 10.3.0 --publish`
   :::

---

## 4. Release Playbook (Step-by-Step)

### Minor Release (e.g., `main` → `10.3.0`)

| Step | Action |
|------|--------|
| 1 | **Stream setup** — Run [Automation A](#automation-a--create-new-minor-version-development-stream): create `X.Y.x` stream branch in both repos. |
| 2 | **RC generation** — Run [Automation D](#automation-d--release-candidate-generation): produce RC artifacts and upload to Apache SVN dev dist. |
| 3 | **Verification** — Perform sanity checks and build from sources on the staged RC artifacts (see [How to verify a release candidate](/community/verify)). If issues are found, push fixes to the `X.Y.x` branch and cut `X.Y.0-rc2` (repeat Automation D). |
| 4 | **Community vote** — Execute [Manual Step E](#manual-step-e--voting-procedure). |
| 5 | **Tag release** — Execute [Manual Step F](#manual-step-f--tag-official-release): create and push official `X.Y.0` tags. |
| 6 | **Publishing** — Trigger [Automation G](#automation-g--publish-release-to-public-registries) on Jenkins to publish across Maven Central, npm, VS Code Marketplace, Chrome Web Store, container registries, and SVN release dist. |

---

## 5. Summary of Key Changes (10.2 → 10.3)

| Area | 10.2.0 | 10.3.0+ |
|------|--------|---------|
| **Java repositories** | 4 separate repos (`drools`, `optaplanner`, `kogito-runtimes`, `kogito-apps`) | 1 unified reactor in `incubator-kie` |
| **Java release execution** | Multiple Jenkins jobs per repo | Single `./script/release/release-all.sh` orchestrated via `Jenkinsfile.103xplus.release-candidate` / `Jenkinsfile.103xplus.release-publish` |
| **KIE Tools release execution** | Multiple per-component Jenkinsfiles | Single `./scripts/release/release-all.sh` orchestrated via `Jenkinsfile.103xplus.release-candidate` / `Jenkinsfile.103xplus.release-publish` |
| **Removed packages** | Included deprecated components | `dashbuilder-*`, `sonataflow-*`, `yard-*`, `serverless-logic-*` omitted |
