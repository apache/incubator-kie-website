---
id: support
title: Support
sidebar_position: 1
---

## Getting help

If you are experiencing problems using KIE or one of its components, then please report your problem to our mailing list or the Zulip chat.
This allows the entire community to help with your problem.
If indeed a bug has been identified in the KIE software,
then document the problem in our [Issue Tracker](https://github.com/apache/incubator-kie-issues/issues).
Please refrain
from immediately opening a ticket in the issue tracker unless you are certain it's a problem in the KIE software.

If you are in doubt, we appreciate asking the [mailing list](/community/#mailing-list) or [Zulip](https://kie.zulipchat.com) chat first.

Please read the section below (How to get help), and follow the bullets advised there first:

* [Issue tracker](https://github.com/apache/incubator-kie-issues/issues)

### Reporting bugs - Please read this first

We prefer people to get in touch first using the mailing list, or Zulip chat. Or take time to read FAQs, or search in the mailing list archives to find answers.
Unfortunately, some people create the issue ticket as first thing. **Please don't do that!** Only if you are sure it really is a bug etc. Issue tickets create noise
for the KIE team to react on issues that are not bugs but are already covered in FAQs, in the mailing lists etc., or in the existing documentation.
Also on the mailing lists, there are more people active to help you better.

Also, please avoid sending direct emails to members of the KIE team (we are busy already).
And conversations about KIE should happen in the public mailing lists, instead of via private emails.

### Reporting security issues

If you have found a security issue in KIE,
please contact the Apache Software Foundation [security team](https://www.apache.org/security/).
Don't share the details in public (i.e., chat or users/developer mailing lists).
We will receive details you send and resolve the issue as soon as possible.
We might also contact you requesting further details as needed.

### Using deprecated components

Deprecated components or older versions than 10.0.0 are *not* maintained and issues such as bugs may not be fixed. We encourage users to migrate away from using any deprecated component and any version prior to 10.0.0.

### How to get help

When you report an issue, please be sure to include as much information as possible. The more we know, the easier it is to reach an effective solution quickly.

The **most important information** you can provide us is the **version of Apache KIE** that you are using.  

But not only that. Remember to also include information such as:

*  what are the version numbers of involved software components? (this is crucial)
*  what runtime you are using and version? (this is crucial)
*  what platform and JDK?
*  any particular container being used? and if so, what version?
*  stack traces generally really help! (Remember to post which version of KIE you use, this is important to know when posting stacktraces.) If in doubt, include the whole thing; often exceptions get wrapped in other exceptions and the exception right near the bottom explains the actual error, not the first few lines at the top. It's very easy for us to skim-read past unnecessary parts of a stack trace.
*  your code & configuration files are often useful
*  did it work before? what have you changed to break it?
*  try upgrading to the latest release and see if it's fixed there
*  search the user forum to see if it has been discussed before
*  see the "known issues" section in the release notes
*  and check the issue tracker to see if the issue has already been reported
*  do *not* send private emails to KIE Team members to ask them to help you faster. Apache KIE support is volunteer-based and must happen in the open on the public Mailing Lists. If you want to get help faster or in private, then see further below.

### How to get help faster

We can help you much quicker if you try the following

*  provide us with a JUnit test case that demonstrates your issue. For instance, if you think you've found a bug, can you create a test case to demonstrate the bug?
*  for memory leak or performance related issues, attach the profiler or report output as a file (or zipped file if it's huge) to the issue we can normally fix things much faster. For example, you could run `jmap`/`jhat`, `perf`, the async profiler, JProfiler or YourKit on your code and send us the output. To find memory leaks, it's quicker to resolve if you can tell us what classes are taking up all the RAM; we can normally figure out what's wrong with that.

## Commercial Support

This is an open source project, so the amount of time we have available to help resolve your issue is often limited as all help is provided on a volunteer basis.
If you want to get priority help, need to get up to speed quickly, require some training or mentoring, or need full 24 x 7 production support, you could contact one of the following companies with [Commercial KIE offerings](/community/commercial-support).