---
id: build-10.0
title: Build from source - 10.0.0
sidebar_position: 100
---

### Complete Environment requirements:

- Temurin JDK 17.0.11
- Maven 3.9.6
- GraalVM for JDK 17
- Docker 25+
- Python 3.12.5
- Make 4.3+
- Node 20
- PNPM 9.3.0
- Go 1.21.9
- Helm 3.15.2 
- CEkit 4.11.0 (pip install)
- Docker Python Bindings 7.0.0 (pip install)
- Docker Squash Tool 1.2.0 (pip install)
- Ruamel YAML 0.18.5 (pip install)

:::note

If you're using a different engine for docker api, Cekit and other tools will require the DOCKER_HOST to be properly setup.

If using colima:
 ```bash
 export DOCKER_HOST=unix://${HOME}/.colima/default/docker.sock
 ```

if using rancher:

 ```bash
 export DOCKER_HOST=unix://$HOME/.rd/docker.sock
 ```

if using podman:

 ```bash
 export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
 ```

:::

### 1. Obtain the Source Code

The first step in building from source is to obtain and extract the source code archive. This archive is available in both release candidates and final releases.

#### Download the Source Archive

Use the following pattern to locate and download the source zip:

```bash
https://dist.apache.org/repos/dist/dev/incubator/kie/${release_version}-${rc_version}/incubator-kie-${release_version}-${rc_version}-sources.zip
```

Replace `${release_version}` and `${rc_version}` with the appropriate values. For example:


```bash
https://dist.apache.org/repos/dist/dev/incubator/kie/10.0.0-rc2/incubator-kie-10.0.0-rc2-sources.zip
```

#### Extract the Source Archive

Once downloaded, extract the contents of the zip file:

```bash
unzip incubator-kie-${release_version}-${rc_version}-sources.zip
```

### 2. Navigate to the Source Directory

```bash
cd incubator-kie-${release_version}-${rc_version}
```

- incubator-kie-drools
- incubator-kie-kogito-apps
- incubator-kie-kogito-images
- incubator-kie-kogito-runtimes
- incubator-kie-optaplanner
- incubator-kie-sandbox-quarkus-accelerator
- incubator-kie-tools

We'll build each of these components individually.

### 3. Building Individual Components

:::note
It's recommended to clean the local `~/.m2` repository, because its content will be incorporated in some container images during the build.
:::

### 3.1. Drools

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6

**Build Commands:**
```bash
cd incubator-kie-drools
git init .
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.2. OptaPlanner

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6

**Build Commands:**
```bash
cd incubator-kie-optaplanner
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.3. Kogito Runtimes

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6

**Build Commands:**
```bash
cd incubator-kie-kogito-runtimes
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.4. Kogito Apps

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6
- GraalVM for JDK 17
- Docker 25+

:::note
If you're using Podman as a docker api, to build Kogito Apps you'll need to pass this variable

 ```bash
 -Djib.dockerClient.executable=$(which podman)
 ```
:::

**Build Commands:**
```bash
cd incubator-kie-kogito-apps
mvn clean install -DskipTests -Dfull -Donly.reproducible=true -Pjitexecutor-native
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.5. Kogito Images

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6
- Python 3.12
- Docker 25+
- Make 4.3+
- CEkit 4.11.0
- Docker Python Bindings 7.0.0

**Build Commands:**
```bash
cd incubator-kie-kogito-images
cekit --descriptor kogito-base-builder-image.yaml build docker --platform linux/amd64
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-data-index-ephemeral
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-data-index-postgresql
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-jit-runner
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-jobs-service-allinone
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-jobs-service-ephemeral
make build-image KOGITO_APPS_TARGET_BRANCH=10.0.0-rc2 ignore_test=true image_name=kogito-jobs-service-postgresql
```

**Produced Artifacts:** Images will be pushed to the local Container registry.

### 3.6. KIE Sandbox Quarkus Accelerator

Build is not required. The source itself is the artifact.

### 3.7. KIE Tools

**Environment Requirements:**
- Temurin JDK 17.0.11
- Maven 3.9.6
- Node 20
- PNPM 9.3.0
- Go 1.21.9
- Python 3.12
- Helm 3.15.2
- Docker 25+
- Make

**Build Commands:**
```bash
cd incubator-kie-tools
git config user.name "Your Name"
git config user.email "your-email@company.com"
git init . && git add . && git commit -m "."
pnpm bootstrap && KIE_TOOLS_BUILD__runTests=false KIE_TOOLS_BUILD__buildExamples=true KIE_TOOLS_BUILD__buildContainerImages=true pnpm -r --workspace-concurrency=1 build:prod && echo 'BUILD SUCCESS! 🎉' || echo 'BUILD FAILURE ❌'
```

**Produced Artifacts:**
- JARs will be installed to local Maven repository
- Images will be pushed to the local Container registry
- Binaries and final artifacts at:
  - packages/*/dist
  - examples/*/dist
