---
slug: new-generation-editors-kie-10-2
title: "The Dawn of a New Era: Next-Generation Editors in Apache KIE 10.2"
authors: [bento, bowers]
tags: [apache, kie, editors, bpmn, dmn, scesim, modernization, tooling]
---

# The Dawn of a New Era: Next-Generation Editors in Apache KIE 10.2

Apache KIE has been undergoing a significant transformation with the introduction of next-generation editors for BPMN, DMN, and Test Scenario (SceSim) modeling. Built from the ground up with modern web technologies, these new editors deliver substantial improvements in performance, user experience, and long-term maintainability. With the latest release, the new BPMN Editor completes this modernization journey, setting the foundation for future innovations across the entire tooling ecosystem.

## The End of an Era: Saying Goodbye to GWT

Let's be honest: the classic BPMN and DMN editors served us well for many years. Built on Google Web Toolkit (GWT), they were powerful tools that enabled thousands of developers and business analysts to model complex processes and decisions. But technology moves forward, and what was cutting-edge a decade ago can become a maintenance burden today.

![Classic GWT-based BPMN Editor](/img/blogs/old-bpmn-canvas.png)
*The classic GWT-based BPMN Editor - showing the old interface with its characteristic styling and layout*

The GWT-based editors had their strengths:
- Robust functionality that powered enterprise applications
- Familiar interface for long-time users
- Comprehensive feature sets built over years of development

However, they also came with significant challenges:
- **Performance bottlenecks** with large, complex models
- **Limited responsiveness** on modern devices and screen sizes
- **Maintenance complexity** as GWT itself moved toward end-of-life
- **Integration friction** with contemporary web technologies and frameworks
- **Accessibility concerns** that didn't meet modern standards

As we committed to Apache KIE's graduation from incubation, it became clear: we needed to modernize our tooling to align with Apache guidelines and contemporary development practices.

## The New Generation: Built for the Modern Web

The new BPMN Editor in Apache KIE 10.2.0 isn't just a facelift; it's a complete reimagining of what a process modeling tool should be in 2026. Built from the ground up using modern web technologies, this editor represents the culmination of extensive research, community feedback, and engineering excellence.

![New BPMN Editor](/img/blogs/new-bpmn-canvas.png)
*The new BPMN Editor - showcasing the modern, clean interface with improved UX*

### What Makes the New Editors Stand Out?

#### 1. **Modern Technology Stack**

The new editors leverage contemporary web technologies that ensure longevity and maintainability:
- **React-based architecture** for component reusability and performance
- **TypeScript** for type safety and better developer experience
- **PatternFly v5** for consistent, accessible UI components
- **Modern build tooling** for faster development cycles

This isn't just about using trendy frameworks - it's about building on stable, well-supported technologies with thriving ecosystems and long-term viability.

#### 2. **Performance That Scales**

One of the most dramatic improvements is performance. The new editor handles large, complex process models with ease:
- **Instant loading** even for models with hundreds of nodes
- **Smooth panning and zooming** without lag or stuttering
- **Real-time validation** that doesn't slow down your workflow
- **Optimized rendering** that uses modern browser capabilities

#### 3. **Enhanced User Experience**

Every interaction has been thoughtfully designed:
- **Intuitive drag-and-drop** with smart snapping and alignment
- **Context-aware property panels** that show exactly what you need
- **Visual feedback** that guides you through complex operations

<div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
  <div style={{flex: 1}}>
    <img src="/img/blogs/old-bpmn-properties.png" alt="Old BPMN Properties Panel" />
    <p style={{textAlign: 'center', fontStyle: 'italic'}}>Classic properties panel</p>
  </div>
  <div style={{flex: 1}}>
    <img src="/img/blogs/new-bpmn-properties.png" alt="New BPMN Properties Panel" />
    <p style={{textAlign: 'center', fontStyle: 'italic'}}>New properties panel with improved organization</p>
  </div>
</div>

### DMN 1.6 Support: Staying Current with Standards

While we're talking about modernization, it's worth highlighting that both the new editor and the Drools engine now support **DMN 1.6**, the latest specification from the Object Management Group (OMG). This ensures you're working with current standards and can leverage the newest decision modeling capabilities.

## The Deprecation Journey: A Necessary Step Forward

Change is never easy, especially when it involves tools that teams have relied on for years. The deprecation of the classic editors didn't happen overnight; it was a carefully planned transition:

- **10.0.0 (December 2024)**: Classic editors marked as deprecated, warnings added
- **10.1.0 (July 2025)**: New Test Scenario Editor introduced
- **10.2.0 (April 2026)**: Classic editors removed, new BPMN Editor becomes the standard

This phased approach gave the community time to:
- Test the new editors in non-production environments
- Provide feedback that shaped the final implementation
- Plan migration strategies for existing projects

## Migration: Easier Than You Think

I know what you're thinking: "This sounds great, but what about my existing models?" Good news - the migration path is straightforward:

1. **File Format Compatibility**: The new editor reads your existing BPMN and DMN files without modification, if you encounter any problems please raise a bug at (https://github.com/apache/incubator-kie-issues/issues).
2. **Comprehensive Documentation**: Step-by-step guides for common scenarios https://github.com/apache/incubator-kie-tools/blob/main/packages/bpmn-editor/docs/MIGRATION_GUIDE.md
3. **Community Support**: Active mailing lists and forums for questions

## Technical Deep Dive: For the Curious

For those who want to understand the technical details:

### Architecture Highlights

- **Component-based design** using React functional components and hooks
- **State management** with Zustand and Immer for predictable state updates
- **Canvas rendering** using SVG for crisp visuals at any zoom level

## Getting Started Today

Ready to experience the new generation of editors? Here's how to get started:

1. **Download Apache KIE 10.2.0** from the [official download page](/start/download)
2. **Review the migration guide** in the documentation
3. **Try the KIE Sandbox** for a quick online demo
4. **Join the community** on the [users mailing list](https://lists.apache.org/list.html?users@kie.apache.org)

## A Personal Note

As someone who's been in the business process management and decision automation technology space for over a decade, I can confidently say this is one of the most significant improvements I've seen in the space. The new editors don't just match the old functionality; they exceed it in every meaningful way while setting the foundation for many innovations to come.

The removal of the classic editors might feel like the end of an era, but it's really the beginning of something much better. We're not just keeping up with modern web development - we're leading the way in what enterprise modeling tools should be.

## Conclusion

The new generation of editors in Apache KIE 10.2.0 represents more than just a technology upgrade; it's a commitment to the future. A future where our tools are as modern and capable as the solutions we build with them. A future where performance, accessibility, and user experience aren't afterthoughts but core principles.

Welcome to the new era of Apache KIE. The future of business process management and decision automation has never looked brighter.

## Join the Conversation

Have you tried the new editors yet? We'd love to hear your feedback, success stories, or questions:

**[users@kie.apache.org](https://lists.apache.org/list.html?users@kie.apache.org)**

Share your experiences, ask questions, or just connect with other Apache KIE users who are making the transition.


---

*Apache KIE (Incubating) 10.2.0 is available now. Visit the [official download page](/start/download) to get started with the new editors today.*

**Disclaimer**: *Apache KIE is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.*