import { nanoid } from "nanoid";

import type { BuilderDocument, BuilderNode, BuilderTree } from "@/types/builder";

interface TemplateDefinition {
  tree: BuilderTree;
  assets?: BuilderDocument["assets"];
  meta?: Record<string, unknown>;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  accent: string;
  previewBackground: string;
  create: () => TemplateDefinition;
}

const TEMPLATE_VERSION = "2025-10-02";

const registerNode = (nodes: Record<string, BuilderNode>, node: BuilderNode) => {
  nodes[node.id] = node;
  return node.id;
};

const layoutNode = (
  nodes: Record<string, BuilderNode>,
  component: string,
  children: string[],
  styles?: BuilderNode["styles"],
  props: Record<string, unknown> = {},
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "layout",
    component,
    props,
    children,
    ...(styles ? { styles } : {}),
  });

const richTextNode = (
  nodes: Record<string, BuilderNode>,
  text: string,
  tag: string,
  styles?: BuilderNode["styles"],
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "component",
    component: "content.richText",
    props: { text, tag },
    children: [],
    ...(styles ? { styles } : {}),
  });

const buttonNode = (
  nodes: Record<string, BuilderNode>,
  label: string,
  variant: string,
  styles?: BuilderNode["styles"],
  extraProps: Record<string, unknown> = {},
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "component",
    component: "content.button",
    props: { label, href: "#", variant, ...extraProps },
    children: [],
    ...(styles ? { styles } : {}),
  });

const statNode = (
  nodes: Record<string, BuilderNode>,
  value: string,
  label: string,
  description: string,
  styles?: BuilderNode["styles"],
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "component",
    component: "content.stat",
    props: { value, label, description },
    children: [],
    ...(styles ? { styles } : {}),
  });

const createAuroraSaasTemplate = (): TemplateDefinition => {
  const nodes: Record<string, BuilderNode> = {};

  const rootId = layoutNode(
    nodes,
    "layout.section",
    [],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "96px",
        backgroundColor: "#f8fafc",
        padding: { top: "0px", bottom: "120px" },
      },
    },
  );

  const heroStatsData = [
    {
      value: "+143%",
      label: "Conversion lift",
      description: "Average uplift after 30 days",
      shadow: "0 20px 70px rgba(79, 97, 255, 0.18)",
    },
    {
      value: "37 min",
      label: "Launch speed",
      description: "From idea to live page",
      shadow: "0 20px 70px rgba(79, 97, 255, 0.14)",
    },
    {
      value: "98%",
      label: "Brand accuracy",
      description: "Design tokens respected",
      shadow: "0 20px 70px rgba(79, 97, 255, 0.12)",
    },
  ];

  const heroStatsIds = heroStatsData.map((stat) =>
    statNode(nodes, stat.value, stat.label, stat.description, {
      base: {
        backgroundColor: "#ffffff",
        padding: { top: "24px", bottom: "24px", left: "24px", right: "24px" },
        borderRadius: "20px",
        boxShadow: stat.shadow,
      },
    }),
  );

  const heroStatsRowId = layoutNode(
    nodes,
    "layout.row",
    heroStatsIds,
    {
      base: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "20px",
      },
      mobile: {
        gridTemplateColumns: "1fr",
      },
    },
  );

  const heroPrimaryButtonId = buttonNode(nodes, "Start building", "primary", {
    base: { width: "fit-content" },
  });
  const heroSecondaryButtonId = buttonNode(nodes, "Preview templates", "secondary", {
    base: { width: "fit-content" },
  });

  const heroButtonsRowId = layoutNode(
    nodes,
    "layout.row",
    [heroPrimaryButtonId, heroSecondaryButtonId],
    {
      base: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
  );

  const heroHeadingId = richTextNode(
    nodes,
    "Craft energetic funnels without touching code",
    "h1",
    {
      base: {
        fontSize: "56px",
        lineHeight: "1.05",
        fontWeight: 700,
        color: "#0f172a",
      },
      mobile: {
        fontSize: "36px",
      },
    },
  );

  const heroSubheadingId = richTextNode(
    nodes,
    "Aurora is the fastest way for marketing teams to launch high-converting journeys with polished visuals, consistent brand language, and adaptive layouts.",
    "p",
    {
      base: {
        fontSize: "18px",
        lineHeight: "1.7",
        color: "#475569",
        maxWidth: "580px",
      },
    },
  );

  const heroContentId = layoutNode(
    nodes,
    "layout.column",
    [heroHeadingId, heroSubheadingId, heroButtonsRowId, heroStatsRowId],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      },
    },
  );

  const heroVisualBadgeId = richTextNode(nodes, "Live journey score", "p", {
    base: {
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#c7d2fe",
    },
  });

  const heroVisualTitleId = richTextNode(nodes, "Engagement is up 2.4x", "h3", {
    base: {
      fontSize: "28px",
      lineHeight: "1.2",
      fontWeight: 600,
      color: "#f8fafc",
    },
  });

  const heroVisualDescriptionId = richTextNode(
    nodes,
    "Dynamic personalization blocks highlight the right story for every visitor in real time.",
    "p",
    {
      base: {
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#e0e7ff",
      },
    },
  );

  const heroVisualId = layoutNode(
    nodes,
    "layout.column",
    [heroVisualBadgeId, heroVisualTitleId, heroVisualDescriptionId],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "#1d1b84",
        color: "#f8fafc",
        padding: { top: "32px", bottom: "32px", left: "32px", right: "32px" },
        borderRadius: "28px",
        boxShadow: "0 40px 80px rgba(29, 27, 132, 0.45)",
      },
    },
  );

  const heroRowId = layoutNode(
    nodes,
    "layout.row",
    [heroContentId, heroVisualId],
    {
      base: {
        display: "grid",
        gap: "48px",
        gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
        alignItems: "center",
      },
      mobile: {
        gridTemplateColumns: "1fr",
      },
    },
  );

  const heroContainerId = layoutNode(
    nodes,
    "layout.container",
    [heroRowId],
    {
      base: {
        maxWidth: "1160px",
        margin: { left: "auto", right: "auto" },
      },
    },
  );

  const heroSectionId = layoutNode(
    nodes,
    "layout.section",
    [heroContainerId],
    {
      base: {
        backgroundColor: "#eef2ff",
        padding: { top: "96px", bottom: "96px", left: "24px", right: "24px" },
      },
    },
  );

  const logoNames = ["Fluxo", "Pulse", "Vertex", "Orbit"];
  const logoIds = logoNames.map((name) =>
    richTextNode(nodes, name, "p", {
      base: {
        fontSize: "20px",
        fontWeight: 600,
        textAlign: "center",
        color: "#475569",
      },
    }),
  );

  const logosHeadingId = richTextNode(nodes, "Trusted by growth teams at", "p", {
    base: {
      fontSize: "14px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#94a3b8",
    },
  });

  const logosRowId = layoutNode(
    nodes,
    "layout.row",
    logoIds,
    {
      base: {
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        alignItems: "center",
      },
    },
  );

  const logosContainerId = layoutNode(
    nodes,
    "layout.container",
    [logosHeadingId, logosRowId],
    {
      base: {
        maxWidth: "960px",
        margin: { left: "auto", right: "auto" },
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "center",
      },
    },
  );

  const logosSectionId = layoutNode(
    nodes,
    "layout.section",
    [logosContainerId],
    {
      base: {
        padding: { left: "24px", right: "24px" },
      },
    },
  );

  const featuresHeadingId = richTextNode(nodes, "The operating system for launch teams", "h2", {
    base: {
      fontSize: "36px",
      lineHeight: "1.2",
      fontWeight: 600,
      color: "#0f172a",
    },
  });

  const featuresIntroId = richTextNode(
    nodes,
    "Align creative, data, and delivery with a shared workspace that keeps teams in flow.",
    "p",
    {
      base: {
        fontSize: "18px",
        lineHeight: "1.6",
        color: "#475569",
        maxWidth: "640px",
      },
    },
  );

  const featureCardsData = [
    {
      title: "Reusable journeys",
      description: "Clone entire funnels, localize content, and swap assets with built-in version controls.",
      backgroundColor: "#f5f3ff",
      titleColor: "#1e1b4b",
      bodyColor: "#4338ca",
    },
    {
      title: "Insight overlays",
      description: "Connect analytics and session replays to see how visitors experience every step.",
      backgroundColor: "#ecfeff",
      titleColor: "#0f766e",
      bodyColor: "#0f172a",
    },
    {
      title: "Connected workflows",
      description: "Trigger approvals, sync briefs, and publish to any domain with one click.",
      backgroundColor: "#fff7ed",
      titleColor: "#9a3412",
      bodyColor: "#7c2d12",
    },
  ];

  const featureCardIds = featureCardsData.map((card) => {
    const titleId = richTextNode(nodes, card.title, "h3", {
      base: {
        fontSize: "20px",
        fontWeight: 600,
        color: card.titleColor,
      },
    });

    const descriptionId = richTextNode(nodes, card.description, "p", {
      base: {
        fontSize: "14px",
        lineHeight: "1.7",
        color: card.bodyColor,
      },
    });

    return layoutNode(
      nodes,
      "layout.column",
      [titleId, descriptionId],
      {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: card.backgroundColor,
          padding: { top: "28px", bottom: "28px", left: "28px", right: "28px" },
          borderRadius: "24px",
        },
      },
    );
  });

  const featuresGridId = layoutNode(
    nodes,
    "layout.row",
    featureCardIds,
    {
      base: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px",
      },
    },
  );

  const featuresContainerId = layoutNode(
    nodes,
    "layout.container",
    [featuresHeadingId, featuresIntroId, featuresGridId],
    {
      base: {
        maxWidth: "1080px",
        margin: { left: "auto", right: "auto" },
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      },
    },
  );

  const featuresSectionId = layoutNode(
    nodes,
    "layout.section",
    [featuresContainerId],
    {
      base: {
        backgroundColor: "#ffffff",
        padding: { top: "80px", bottom: "80px", left: "24px", right: "24px" },
      },
    },
  );

  const testimonialHeadingId = richTextNode(nodes, "“Aurora lets our marketers experiment without waiting on engineering.”", "h3", {
    base: {
      fontSize: "28px",
      lineHeight: "1.3",
      fontWeight: 600,
      color: "#f8fafc",
    },
  });

  const testimonialQuoteId = richTextNode(nodes, "We shipped eight campaigns in a single quarter and kept every touchpoint perfectly on brand.", "p", {
    base: {
      fontSize: "18px",
      lineHeight: "1.6",
      color: "#cbd5f5",
    },
  });

  const testimonialAuthorId = richTextNode(nodes, "Erin Moore — VP of Growth, Pulse", "p", {
    base: {
      fontSize: "14px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#94a3b8",
    },
  });

  const testimonialColumnId = layoutNode(
    nodes,
    "layout.column",
    [testimonialHeadingId, testimonialQuoteId, testimonialAuthorId],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        backgroundColor: "#1f2937",
        padding: { top: "48px", bottom: "48px", left: "48px", right: "48px" },
        borderRadius: "36px",
      },
    },
  );

  const testimonialContainerId = layoutNode(
    nodes,
    "layout.container",
    [testimonialColumnId],
    {
      base: {
        maxWidth: "880px",
        margin: { left: "auto", right: "auto" },
      },
    },
  );

  const testimonialSectionId = layoutNode(
    nodes,
    "layout.section",
    [testimonialContainerId],
    {
      base: {
        backgroundColor: "#111827",
        padding: { top: "96px", bottom: "96px", left: "24px", right: "24px" },
      },
    },
  );

  const ctaHeadingId = richTextNode(nodes, "Launch your next journey in record time", "h2", {
    base: {
      fontSize: "32px",
      lineHeight: "1.2",
      fontWeight: 600,
      color: "#f8fafc",
    },
  });

  const ctaDescriptionId = richTextNode(
    nodes,
    "Personalize templates, connect data sources, and collaborate live with your team.",
    "p",
    {
      base: {
        fontSize: "16px",
        lineHeight: "1.7",
        color: "#c7d2fe",
        maxWidth: "520px",
      },
    },
  );

  const ctaPrimaryButtonId = buttonNode(nodes, "Request demo", "primary", {
    base: { width: "fit-content" },
  });

  const ctaSecondaryButtonId = buttonNode(nodes, "See pricing", "secondary", {
    base: { width: "fit-content" },
  });

  const ctaButtonsRowId = layoutNode(
    nodes,
    "layout.row",
    [ctaPrimaryButtonId, ctaSecondaryButtonId],
    {
      base: {
        display: "flex",
        gap: "16px",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
  );

  const ctaColumnId = layoutNode(
    nodes,
    "layout.column",
    [ctaHeadingId, ctaDescriptionId, ctaButtonsRowId],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        backgroundColor: "#312e81",
        padding: { top: "48px", bottom: "48px", left: "48px", right: "48px" },
        borderRadius: "32px",
      },
    },
  );

  const ctaContainerId = layoutNode(
    nodes,
    "layout.container",
    [ctaColumnId],
    {
      base: {
        maxWidth: "880px",
        margin: { left: "auto", right: "auto" },
      },
    },
  );

  const ctaSectionId = layoutNode(
    nodes,
    "layout.section",
    [ctaContainerId],
    {
      base: {
        padding: { top: "80px", bottom: "80px", left: "24px", right: "24px" },
      },
    },
  );

  nodes[rootId].children = [heroSectionId, logosSectionId, featuresSectionId, testimonialSectionId, ctaSectionId];

  return {
    tree: {
      version: TEMPLATE_VERSION,
      root: rootId,
      nodes,
    },
    assets: [],
    meta: {
      templateName: "Aurora SaaS Launch",
    },
  };
};

const createNocturneSummitTemplate = (): TemplateDefinition => {
  const nodes: Record<string, BuilderNode> = {};

  const rootId = layoutNode(
    nodes,
    "layout.section",
    [],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "88px",
        backgroundColor: "#0b1120",
        color: "#e2e8f0",
        padding: { top: "0px", bottom: "120px" },
      },
    },
  );

  const heroBadgeId = richTextNode(nodes, "Nocturne Summit — October 12", "p", {
    base: {
      fontSize: "13px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#38bdf8",
    },
  });

  const heroHeadingId = richTextNode(nodes, "Design the next era of product storytelling", "h1", {
    base: {
      fontSize: "52px",
      lineHeight: "1.1",
      fontWeight: 700,
    },
    mobile: {
      fontSize: "34px",
    },
  });

  const heroDescriptionId = richTextNode(
    nodes,
    "An evening gathering for brand, product, and growth leaders to explore immersive journeys and adaptive funnels.",
    "p",
    {
      base: {
        fontSize: "18px",
        lineHeight: "1.7",
        color: "#94a3b8",
        maxWidth: "640px",
      },
    },
  );

  const heroPrimaryButtonId = buttonNode(nodes, "Reserve seat", "primary", {
    base: { width: "fit-content" },
  });

  const heroSecondaryButtonId = buttonNode(nodes, "View agenda", "secondary", {
    base: { width: "fit-content" },
  });

  const heroButtonsRowId = layoutNode(
    nodes,
    "layout.row",
    [heroPrimaryButtonId, heroSecondaryButtonId],
    {
      base: {
        display: "flex",
        gap: "16px",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
  );

  const heroHighlightTitleId = richTextNode(nodes, "Immersive studio walk-through", "h3", {
    base: {
      fontSize: "22px",
      fontWeight: 600,
    },
  });

  const heroHighlightDescriptionId = richTextNode(
    nodes,
    "Experience interactive prototypes, spatial storytelling, and bring-your-own funnel teardown clinics.",
    "p",
    {
      base: {
        fontSize: "14px",
        lineHeight: "1.7",
        color: "#cbd5f5",
      },
    },
  );

  const heroHighlightStatId = statNode(
    nodes,
    "3 stages",
    "Hands-on workshops",
    "Led by design engineering partners",
    {
      base: {
        backgroundColor: "#1e3a8a",
        borderRadius: "20px",
        padding: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
      },
    },
  );

  const heroHighlightCardId = layoutNode(
    nodes,
    "layout.column",
    [heroHighlightTitleId, heroHighlightDescriptionId, heroHighlightStatId],
    {
      base: {
        margin: { top: "16px" },
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "#172554",
        padding: { top: "32px", bottom: "32px", left: "32px", right: "32px" },
        borderRadius: "28px",
        boxShadow: "0 40px 80px rgba(30, 64, 175, 0.45)",
      },
    },
  );

  const heroColumnId = layoutNode(
    nodes,
    "layout.column",
    [heroBadgeId, heroHeadingId, heroDescriptionId, heroButtonsRowId, heroHighlightCardId],
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      },
    },
  );

  const heroContainerId = layoutNode(
    nodes,
    "layout.container",
    [heroColumnId],
    {
      base: {
        maxWidth: "960px",
        margin: { left: "auto", right: "auto" },
      },
    },
  );

  const heroSectionId = layoutNode(
    nodes,
    "layout.section",
    [heroContainerId],
    {
      base: {
        backgroundColor: "#111c2f",
        padding: { top: "120px", bottom: "96px", left: "24px", right: "24px" },
      },
    },
  );

  const agendaHeadingId = richTextNode(nodes, "Evening agenda", "h2", {
    base: {
      fontSize: "32px",
      fontWeight: 600,
    },
  });

  const agendaIntroId = richTextNode(nodes, "Doors open at 5:30 PM with guided networking and curated studio tours.", "p", {
    base: {
      fontSize: "16px",
      lineHeight: "1.6",
      color: "#94a3b8",
    },
  });

  const agendaItems = [
    {
      title: "6:00 PM — Opening keynote with Aster Studio",
      body: "Funnel choreography across web, retail, and experiential touchpoints.",
    },
    {
      title: "7:15 PM — Workshop tracks",
      body: "Choose between interactive storytelling, adaptive data flows, or monetization design.",
    },
    {
      title: "8:45 PM — Fireside with Signal Collective",
      body: "Discuss the future of responsive storytelling, data ethics, and community-led launches.",
    },
  ];

  const agendaItemIds = agendaItems.map((item) => {
    const titleId = richTextNode(nodes, item.title, "h3", {
      base: {
        fontSize: "18px",
        fontWeight: 600,
      },
    });

    const bodyId = richTextNode(nodes, item.body, "p", {
      base: {
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#94a3b8",
      },
    });

    return layoutNode(
      nodes,
      "layout.column",
      [titleId, bodyId],
      {
        base: {
          backgroundColor: "#111c2f",
          padding: { top: "24px", bottom: "24px", left: "28px", right: "28px" },
          borderRadius: "20px",
          gap: "8px",
        },
      },
    );
  });

  const agendaListId = layoutNode(
    nodes,
    "layout.column",
    agendaItemIds,
    {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      },
    },
  );

  const agendaContainerId = layoutNode(
    nodes,
    "layout.container",
    [agendaHeadingId, agendaIntroId, agendaListId],
    {
      base: {
        maxWidth: "960px",
        margin: { left: "auto", right: "auto" },
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      },
    },
  );

  const agendaSectionId = layoutNode(
    nodes,
    "layout.section",
    [agendaContainerId],
    {
      base: {
        padding: { left: "24px", right: "24px" },
      },
    },
  );

  const speakersHeadingId = richTextNode(nodes, "Featured speakers", "h2", {
    base: {
      fontSize: "32px",
      fontWeight: 600,
    },
  });

  const speakersData = [
    { name: "Harper Lin", role: "Head of Brand Systems, Luma" },
    { name: "Isla Ford", role: "Principal Product Strategist, Echo" },
    { name: "Nico Rhee", role: "Founder, Signal Collective" },
  ];

  const speakerCardIds = speakersData.map((speaker) => {
    const nameId = richTextNode(nodes, speaker.name, "h3", {
      base: {
        fontSize: "20px",
        fontWeight: 600,
      },
    });

    const roleId = richTextNode(nodes, speaker.role, "p", {
      base: {
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#94a3b8",
      },
    });

    return layoutNode(
      nodes,
      "layout.column",
      [nameId, roleId],
      {
        base: {
          backgroundColor: "#111c2f",
          padding: { top: "32px", bottom: "32px", left: "28px", right: "28px" },
          borderRadius: "24px",
          gap: "12px",
        },
      },
    );
  });

  const speakersGridId = layoutNode(
    nodes,
    "layout.row",
    speakerCardIds,
    {
      base: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
      },
    },
  );

  const speakersContainerId = layoutNode(
    nodes,
    "layout.container",
    [speakersHeadingId, speakersGridId],
    {
      base: {
        maxWidth: "1080px",
        margin: { left: "auto", right: "auto" },
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      },
    },
  );

  const speakersSectionId = layoutNode(
    nodes,
    "layout.section",
    [speakersContainerId],
    {
      base: {
        padding: { top: "40px", bottom: "40px", left: "24px", right: "24px" },
      },
    },
  );

  const closingHeadingId = richTextNode(nodes, "Join a cohort of makers shaping the night", "h2", {
    base: {
      fontSize: "30px",
      fontWeight: 600,
    },
  });

  const closingDescriptionId = richTextNode(
    nodes,
    "Applications are reviewed in under 48 hours. Attendance is limited to 200 guests.",
    "p",
    {
      base: {
        fontSize: "16px",
        lineHeight: "1.7",
        color: "#cbd5f5",
        maxWidth: "520px",
      },
    },
  );

  const closingPrimaryButtonId = buttonNode(nodes, "Apply now", "primary", {
    base: { width: "fit-content" },
  });

  const closingSecondaryButtonId = buttonNode(nodes, "Sponsor the summit", "secondary", {
    base: { width: "fit-content" },
  });

  const closingButtonsRowId = layoutNode(
    nodes,
    "layout.row",
    [closingPrimaryButtonId, closingSecondaryButtonId],
    {
      base: {
        display: "flex",
        gap: "16px",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
  );

  const closingColumnId = layoutNode(
    nodes,
    "layout.column",
    [closingHeadingId, closingDescriptionId, closingButtonsRowId],
    {
      base: {
        backgroundColor: "#172554",
        padding: { top: "48px", bottom: "48px", left: "48px", right: "48px" },
        borderRadius: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      },
    },
  );

  const closingContainerId = layoutNode(
    nodes,
    "layout.container",
    [closingColumnId],
    {
      base: {
        maxWidth: "820px",
        margin: { left: "auto", right: "auto" },
      },
    },
  );

  const closingSectionId = layoutNode(
    nodes,
    "layout.section",
    [closingContainerId],
    {
      base: {
        padding: { left: "24px", right: "24px" },
      },
    },
  );

  nodes[rootId].children = [heroSectionId, agendaSectionId, speakersSectionId, closingSectionId];

  return {
    tree: {
      version: TEMPLATE_VERSION,
      root: rootId,
      nodes,
    },
    assets: [],
    meta: {
      templateName: "Nocturne Summit",
    },
  };
};

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "aurora-saas",
    name: "Aurora SaaS Launch",
    description: "Gradient hero, social proof, and layered testimony for modern product launches.",
    category: "SaaS",
    accent: "#4f46e5",
    previewBackground: "linear-gradient(135deg, #eef2ff 20%, #f8fafc 100%)",
    create: createAuroraSaasTemplate,
  },
  {
    id: "nocturne-summit",
    name: "Nocturne Summit",
    description: "Moody event landing with timeline, speaker highlights, and striking call-to-action.",
    category: "Event",
    accent: "#38bdf8",
    previewBackground: "linear-gradient(135deg, #0f172a 10%, #1e293b 90%)",
    create: createNocturneSummitTemplate,
  },
];
