---
id: build-10.3
title: Build from source - 10.3.0 RCs
sidebar_position: 99
---

Starting with 10.3.0 the Java code lives in a single repository (`incubator-kie`) and the tooling in `incubator-kie-tools`. There is no longer a separate build for Drools, OptaPlanner, Kogito Runtimes and Kogito Apps as in 10.2.

### Environment requirements

| Tool | Version | Needed for |
|---|---|---|
| Temurin JDK | 17 (21 also works) | Java and Tools |
| Maven | 3.9.x (CI uses 3.9.16) | Java and Tools |
| Docker | 26.1.4+ | Container images, some integration tests |
| Node | 24+ | Tools |
| PNPM | 10.34.4 | Tools |
| Go | 1.26.x | Tools (upload service) |
| Helm | 3.x | Tools (Helm charts) |
| Python 3, Make, Git | any recent | Tools |

:::note
The exact versions used by the project are pinned in `devbox.json` of each repository. If in doubt, use those.
:::

:::note

If you're using a different engine for the Docker API, Cekit and other tools will require `DOCKER_HOST` to be properly set up.

If using colima:
 ```bash
 export DOCKER_HOST=unix://${HOME}/.colima/default/docker.sock
 ```

If using rancher:

 ```bash
 export DOCKER_HOST=unix://$HOME/.rd/docker.sock
 ```

If using podman:

 ```bash
 export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
 ```

:::

### 1. Obtain the source code

The first step in building from source is to obtain and extract the source code archive. Since 10.3.0 a single archive contains the source code of both repositories (`incubator-kie` and `incubator-kie-tools`).

#### Download the source archive

Release candidates are published in the Apache dev SVN, one folder per RC. Use the following pattern to locate and download the source zip:

```bash
https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-${rc_version}/apache-kie-10.3.0-incubating-sources.zip
```

Replace `${rc_version}` with the appropriate value. For example:

```bash
https://dist.apache.org/repos/dist/dev/incubator/kie/10.3.0-rc1/apache-kie-10.3.0-incubating-sources.zip
```

:::tip
Before building, verify signatures and checksums as described in [How to verify a release candidate](/community/devs/verify).
:::

#### Extract the source archive

Once downloaded, extract the contents of the zip file:

```bash
unzip apache-kie-10.3.0-incubating-sources.zip
```

### 2. Navigate to the source directory

```bash
cd apache-kie-10.3.0-incubating
```

The directory contains:

- BUILD
- DISCLAIMER-WIP
- LICENSE
- NOTICE
- incubator-kie
- incubator-kie-tools

The `BUILD` file has short build instructions and the tool versions for this release. We'll build the two repositories individually: first `incubator-kie`, then `incubator-kie-tools`, which resolves the Java artifacts from the local Maven repository.

### 3. Building individual components

:::note
It's recommended to clean the local `~/.m2` repository first, because its content is incorporated in some container images during the build.
:::

### 3.1. Java (Drools, Kogito, OptaPlanner, apps) - `incubator-kie`

**Environment requirements:** Temurin JDK, Maven, Docker.

**Build commands:**
```bash
cd incubator-kie
mvn clean install -DskipTests -Dfull
cd ..
```

:::note
If you're using Podman as the Docker API, also pass:

 ```bash
 -Djib.dockerClient.executable=$(which podman)
 ```
:::

**Produced artifacts:** JARs are installed to the local Maven repository.

### 3.2. KIE Tools - `incubator-kie-tools`

**Environment requirements:** Temurin JDK, Maven, Node, PNPM, Go, Python, Helm, Docker, Make.

**Build commands:**
```bash
cd incubator-kie-tools
git init .
git config user.name "Your Name"
git config user.email "your-email@company.com"
git add . && git commit -m "."
pnpm bootstrap && KIE_TOOLS_BUILD__runTests=false KIE_TOOLS_BUILD__buildExamples=true KIE_TOOLS_BUILD__buildContainerImages=true pnpm -r --workspace-concurrency=1 build:prod && echo 'BUILD SUCCESS! 🎉' || echo 'BUILD FAILURE ❌'
```

**Produced artifacts:**
- JARs are installed to the local Maven repository
- Images are created in the local container registry
- Binaries and final artifacts are in:
  - `packages/*/dist`
  - `examples/*/dist`

New in 10.3: the **DRL VS Code extension** is built from `packages/drl-vscode-extension`. Its `.vsix` ends up in `packages/drl-vscode-extension/dist`.