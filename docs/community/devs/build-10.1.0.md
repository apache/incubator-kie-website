---
id: build_10_1_0
title: Build from source - 10.1.0
sidebar_position: 99
---

### Complete Environment requirements:

- Temurin JDK 17.0.12+8.1
- Maven 3.9.6
- Oracle GraalVM 17.0.12+8.1
- Docker 25+
- Python 3.12.9
- Make 4.4.1+
- Node 20.19.0
- PNPM 9.3.0
- Go 1.23.6
- Helm 3.15.2 

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
https://dist.apache.org/repos/dist/dev/incubator/kie/10.1.0-${rc_version}/apache-kie-10.1.0-incubating-sources.zip
```

Replace `10.1.0` and `${rc_version}` with the appropriate values. For example:


```bash
https://dist.apache.org/repos/dist/dev/incubator/kie/10.1.0-rc1/apache-kie-10.1.0-incubating-sources.zip
```

#### Extract the Source Archive

Once downloaded, extract the contents of the zip file:

```bash
unzip apache-kie-10.1.0-incubating-sources.zip
```

### 2. Navigate to the Source Directory

```bash
cd apache-kie-10.1.0-incubating-sources
```
- BUILD
- DISCLAIMER-WIP
- LICENSE
- NOTICE
- build.sh
- incubator-kie-drools
- incubator-kie-kogito-apps
- incubator-kie-kogito-runtimes
- incubator-kie-optaplanner
- incubator-kie-tools

We'll build each of these components individually.

### 3. Building Individual Components

:::note
It's recommended to clean the local `~/.m2` repository, because its content will be incorporated in some container images during the build.
:::

### 3.1. Drools

**Environment Requirements:**
- Temurin JDK
- Maven 

**Build Commands:**
```bash
cd incubator-kie-drools
git init .
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.2. OptaPlanner

**Environment Requirements:**
- Temurin JDK
- Maven

**Build Commands:**
```bash
cd incubator-kie-optaplanner
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.3. Kogito Runtimes

**Environment Requirements:**
- Temurin JDK
- Maven

**Build Commands:**
```bash
cd incubator-kie-kogito-runtimes
mvn clean install -DskipTests -Dfull -Donly.reproducible=true
```

**Produced Artifacts:** JARs will be installed to local Maven repository.

### 3.4. Kogito Apps

**Environment Requirements:**
- Temurin JDK
- Maven
- GraalVM for JDK
- Docker

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

### 3.5. KIE Tools

**Environment Requirements:**
- Temurin JDK
- Maven 
- Node 
- PNPM 
- Go 
- Python
- Helm 
- Docker
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
