---
id: verify
title: How to verify
sidebar_position: 3
---

> **Note:** This page is currently being updated for the 10.1.0 release verification procedure.

# Verify the release artifacts

Following is the basic check items for the release artifacts.

- [ ] Download links are valid.
- [ ] Checksums and PGP signatures are valid.
- [ ] Source code distributions have correct names matching the current release.
- [ ] LICENSE and NOTICE files are correct.
- [ ] All files have license headers if necessary.
- [ ] No unlicensed compiled archives bundled in source archive.

For detailed check list, please refer to the [official check list](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist)


## Download the candidate version

```bash
#If there is svn locally, you can clone to the local
svn co https://dist.apache.org/repos/dist/dev/incubator/kie/${release_version}-${rc_version}/
# Or you can just download all the artifacts directly
wget -r -np -nd -A "*" -e robots=off https://dist.apache.org/repos/dist/dev/incubator/kie/${release_version}-${rc_version}/
```

## Checksums and signatures

The release candidate artifacts should have a checksum and signature file.

For example, if the release candidate is `10.0.0-rc1`, the checksum and signature file should be:

```
https://dist.apache.org/repos/dist/dev/incubator/kie/10.0.0-rc1/incubator-kie-10.0.0-rc1-sources.zip.sha512

https://dist.apache.org/repos/dist/dev/incubator/kie/10.0.0-rc1/incubator-kie-10.0.0-rc1-sources.zip.asc
```

### Verify checksums and signatures

#### GnuPG setup

GnuPG is recommended here. It can be installed with the following command:

```shell
apt-get install gnupg
# or
yum install gnupg
# or
brew install gnupg
```

Firstly, import the  Apache KIE Automated Release Signing public key:

```shell
curl https://downloads.apache.org/incubator/kie/KEYS > KEYS
gpg --import KEYS # Import KEYS to local
```

Then, trust the public key:

```shell
gpg --edit-key private@kie.apache.org
```

It will enter the interactive mode, use the following command to trust the key:

```shell
gpg> trust
```

And then, select the level of trust, for example:

```
Please decide how far you trust this user to correctly verify other users' keys
(by looking at passports, checking fingerprints from different sources, etc.)

  1 = I don't know or won't say
  2 = I do NOT trust
  3 = I trust marginally
  4 = I trust fully
  5 = I trust ultimately
  m = back to the main menu
```

Select `5` to trust the key ultimately.

#### How to verify the signatures

Next verify signature:
```bash
for i in *.{tar.gz,zip,vsix}; do echo $i; gpg --verify $i.asc $i; done
```

If something like the following appears, it means the signature is correct:
```bash
incubator-kie-10.0.0-rc1-sources.zip
gpg: Signature made Fri Sep 27 15:53:27 2024 EDT
gpg:                using RSA key 1384A644F9BFA0F54C84488C3B0DD7480424A676
gpg: Good signature from "Apache KIE Automated Release Signing <private@kie.apache.org>" [ultimate]
```

#### How to verify the checksums

Then verify checksum:
```bash
for i in *.{tar.gz,zip,vsix}; do echo $i; sha512sum --check $i.sha512; done
```

It should output something like:
```bash
incubator-kie-10.0.0-rc1-sources.zip
incubator-kie-10.0.0-rc1-sources.zip: OK
```

#### How to verify if the container images are valid

Then verify container images:
```bash
for i in *image.tar.gz; do echo $i; docker load -q -i $i && echo "OK" || echo "Error"; done
```

It should output something like:
```bash
incubator-kie-10.0.0-rc1-serverless-logic-web-tools-swf-dev-mode-image.tar.gz
Loaded image: apache/incubator-kie-serverless-logic-web-tools-swf-dev-mode:10.0.0
OK
```

Errors would look something like:
```bash
incubator-kie-10.0.0-rc1-sonataflow-devmode-image.tar.gz
open /var/lib/docker/tmp/docker-import-2603585138/repositories: no such file or directory
Error
```

## Check the file content of the source package

Unzip `apache-kie-${release_version}-${rc_version}-sources.zip` and check the follows:

- LICENSE and NOTICE files in the root directory are correct.
- All files have ASF license headers if necessary. Apache Rat helps the verification.
    - In the root directory of the sources package,
    - Download the jar: `curl -LO https://repo1.maven.org/maven2/org/apache/rat/apache-rat/0.17/apache-rat-0.17.jar`
    - Run `java -jar apache-rat-0.17.jar -E .rat-excludes-combined -- . > rat-result.txt` (It takes a few minutes. `.rat-excludes-combined` has been introduced since 10.1.0 release candidates)
        - NOTE: If `.rat-excludes-combined` doesn't exist under the root directory, do the steps (run apache-rat, review the result) under the subdirectories, which have `.rat-excludes` instead.
    - Review the `rat-result.txt`. `Files with unapproved licenses:` should be one of the followings
        - Listed in `LICENSE`
        - Not a source code (e.g. test data, config file)
        - Generated code
- You are able to [build from source](build).
