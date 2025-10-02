import { nanoid } from "nanoid";

import type { BuilderNode } from "@/types/builder";

export interface BlockDefinition {
  rootId: string;
  nodes: Record<string, BuilderNode>;
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  create: () => BlockDefinition;
}

const createHeroBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const contentWrapperId = nanoid();
  const headingId = nanoid();
  const subheadingId = nanoid();
  const buttonRowId = nanoid();
  const primaryButtonId = nanoid();
  const secondaryButtonId = nanoid();

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [contentWrapperId],
      styles: {
        base: {
          backgroundColor: "#ffffff",
          padding: { top: "96px", bottom: "96px", left: "64px", right: "64px" },
        },
        mobile: {
          padding: { left: "24px", right: "24px", top: "72px", bottom: "72px" },
        },
      },
    },
    [contentWrapperId]: {
      id: contentWrapperId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [headingId, subheadingId, buttonRowId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "780px",
          margin: { left: "auto", right: "auto" },
          textAlign: "center",
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Launch high-converting funnels in minutes",
        tag: "h1",
      },
      children: [],
      styles: {
        base: {
          fontSize: "56px",
          lineHeight: "1.1",
          fontWeight: 700,
        },
        mobile: {
          fontSize: "36px",
        },
      },
    },
    [subheadingId]: {
      id: subheadingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Use BakeMentor to design funnels, landing pages, and launch campaigns without code.",
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          fontSize: "18px",
          color: "#475569",
          lineHeight: "1.6",
          margin: { left: "auto", right: "auto" },
          maxWidth: "560px",
        },
      },
    },
    [buttonRowId]: {
      id: buttonRowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [primaryButtonId, secondaryButtonId],
      styles: {
        base: {
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        },
        mobile: {
          flexDirection: "column",
          alignItems: "stretch",
        },
      },
    },
    [primaryButtonId]: {
      id: primaryButtonId,
      type: "component",
      component: "content.button",
      props: {
        label: "Start building",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          width: "fit-content",
        },
        mobile: {
          width: "100%",
        },
      },
    },
    [secondaryButtonId]: {
      id: secondaryButtonId,
      type: "component",
      component: "content.button",
      props: {
        label: "Watch demo",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          width: "fit-content",
          backgroundColor: "#f1f5f9",
          color: "#0f172a",
        },
        mobile: {
          width: "100%",
        },
      },
    },
  };

  return { rootId: sectionId, nodes };
};

const createHeaderBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const topBarId = nanoid();
  const topLinksId = nanoid();
  const searchId = nanoid();
  const themeToggleId = nanoid();
  const localeId = nanoid();
  const lowerBarId = nanoid();
  const menuId = nanoid();
  const logoId = nanoid();
  const navLinkIds = [nanoid(), nanoid(), nanoid(), nanoid(), nanoid()];
  const chipIds = [nanoid(), nanoid()];

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [topBarId, lowerBarId],
      styles: {
        base: {
          backgroundColor: "#f6f8ff",
          padding: { top: "16px", bottom: "12px", left: "64px", right: "64px" },
          boxShadow: "0 6px 32px rgba(15, 23, 42, 0.08)",
        },
        mobile: {
          padding: { left: "20px", right: "20px" },
        },
      },
    },
    [topBarId]: {
      id: topBarId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [logoId, topLinksId, searchId, themeToggleId, localeId],
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto auto",
          alignItems: "center",
          gap: "24px",
          padding: { top: "12px", bottom: "14px", left: "24px", right: "24px" },
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f6f8ff",
          borderRadius: "999px",
        },
        mobile: {
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "stretch",
        },
      },
    },
    [logoId]: {
      id: logoId,
      type: "component",
      component: "content.logo",
      props: {
        text: "BAKAI BANK",
        url: "https://uploads-ssl.webflow.com/63df8d9a4a1fa6aaf22bd7c9/641d13c4ba6c02f6b1911091_bakai_logo.svg",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "18px",
          fontWeight: 600,
          color: "#1d4ed8",
        },
      },
    },
    [topLinksId]: {
      id: topLinksId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [nanoid(), nanoid(), nanoid(), nanoid()],
      styles: {
        base: {
          display: "flex",
          alignItems: "center",
          gap: "24px",
        },
      },
    },
  };

  const topLabels = [
    "Частным клиентам",
    "Бизнесу",
    "Премиум клиентам",
    "Исламский финансовый центр",
  ];

  nodes[topLinksId].children.forEach((childId, index) => {
    nodes[childId] = {
      id: childId,
      type: "component",
      component: "content.navLink",
      props: {
        label: topLabels[index],
        href: "#",
      },
      children: [],
      styles: {
        base: {
          color: index === 0 ? "#1d4ed8" : "#94a3b8",
          fontWeight: index === 0 ? 700 : 500,
          borderBottom: index === 0 ? "2px solid #1d4ed8" : undefined,
          padding: index === 0 ? { bottom: "6px" } : undefined,
        },
      },
    };
  });

  nodes[searchId] = {
    id: searchId,
    type: "component",
    component: "forms.input",
    props: {
      label: "",
      name: "search",
      placeholder: "Найти на сайте",
    },
    children: [],
    styles: {
      base: {
        width: "220px",
      },
    },
  };

  nodes[themeToggleId] = {
    id: themeToggleId,
    type: "component",
    component: "content.button",
    props: {
      label: "🌞 / 🌙",
      href: "#",
    },
    children: [],
    styles: {
      base: {
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        padding: { left: "12px", right: "12px" },
      },
    },
  };

  nodes[localeId] = {
    id: localeId,
    type: "component",
    component: "content.navLink",
    props: {
      label: "Русский",
      href: "#",
    },
    children: [],
    styles: {
      base: {
        color: "#111827",
        fontWeight: 600,
      },
    },
  };

  nodes[lowerBarId] = {
    id: lowerBarId,
    type: "layout",
    component: "layout.row",
    props: {},
    children: [menuId, ...chipIds],
    styles: {
      base: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: "16px",
      },
    },
  };

  nodes[menuId] = {
    id: menuId,
    type: "layout",
    component: "layout.row",
    props: {},
    children: navLinkIds,
    styles: {
      base: {
        display: "flex",
        alignItems: "center",
        gap: "32px",
      },
      mobile: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
  };

  const lowerLinks = ["Карты", "Депозиты", "Кредиты", "Переводы Visa", "Инвестиции"];
  navLinkIds.forEach((id, index) => {
    nodes[id] = {
      id,
      type: "component",
      component: "content.navLink",
      props: {
        label: lowerLinks[index],
        href: "#",
      },
      children: [],
      styles: {
        base: {
          color: "#111827",
          fontWeight: 600,
          fontSize: "16px",
        },
      },
    };
  });

  chipIds.forEach((id, index) => {
    nodes[id] = {
      id,
      type: "component",
      component: "content.button",
      props: {
        label: index === 0 ? "BakAi" : "Тумар",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          backgroundColor: index === 0 ? "#f5f3ff" : "#f1f5f9",
          color: index === 0 ? "#7c3aed" : "#0f172a",
          border: "1px solid #cbd5f5",
          padding: { top: "10px", bottom: "10px", left: "22px", right: "22px" },
        },
      },
    };
  });

  return { rootId: sectionId, nodes };
};

const createFooterBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const footerId = nanoid();
  const topRowId = nanoid();
  const bottomRowId = nanoid();
  const logoId = nanoid();
  const aboutTextId = nanoid();
  const linkColumnId = nanoid();
  const link1 = nanoid();
  const link2 = nanoid();
  const link3 = nanoid();
  const copyrightId = nanoid();

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [footerId],
      styles: {
        base: {
          backgroundColor: "#0f172a",
          color: "#e2e8f0",
          padding: { top: "72px", bottom: "40px", left: "64px", right: "64px" },
        },
        mobile: {
          padding: { left: "24px", right: "24px" },
        },
      },
    },
    [footerId]: {
      id: footerId,
      type: "layout",
      component: "layout.footer",
      props: {},
      children: [topRowId, bottomRowId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        },
      },
    },
    [topRowId]: {
      id: topRowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [logoId, aboutTextId, linkColumnId],
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "240px 1fr 200px",
          gap: "32px",
          alignItems: "start",
        },
        mobile: {
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        },
      },
    },
    [logoId]: {
      id: logoId,
      type: "component",
      component: "content.logo",
      props: {
        text: "BakeMentor",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          color: "#ffffff",
          fontSize: "20px",
        },
      },
    },
    [aboutTextId]: {
      id: aboutTextId,
      type: "component",
      component: "content.richText",
      props: {
        text: "We help marketing teams ship conversion-ready funnels without engineering bottlenecks.",
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          color: "#cbd5f5",
          fontSize: "14px",
          lineHeight: "1.6",
        },
      },
    },
    [linkColumnId]: {
      id: linkColumnId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [link1, link2, link3],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        },
      },
    },
    [link1]: {
      id: link1,
      type: "component",
      component: "content.richText",
      props: {
        text: "Product",
        tag: "a",
      },
      children: [],
      styles: {
        base: {
          color: "#cbd5f5",
          fontSize: "14px",
        },
      },
    },
    [link2]: {
      id: link2,
      type: "component",
      component: "content.richText",
      props: {
        text: "Templates",
        tag: "a",
      },
      children: [],
      styles: {
        base: {
          color: "#cbd5f5",
          fontSize: "14px",
        },
      },
    },
    [link3]: {
      id: link3,
      type: "component",
      component: "content.richText",
      props: {
        text: "Support",
        tag: "a",
      },
      children: [],
      styles: {
        base: {
          color: "#cbd5f5",
          fontSize: "14px",
        },
      },
    },
    [bottomRowId]: {
      id: bottomRowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [copyrightId],
      styles: {
        base: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#94a3b8",
          fontSize: "12px",
        },
        mobile: {
          flexDirection: "column",
          gap: "12px",
        },
      },
    },
    [copyrightId]: {
      id: copyrightId,
      type: "component",
      component: "content.richText",
      props: {
        text: "© " + new Date().getFullYear().toString() + " BakeMentor. All rights reserved.",
        tag: "p",
      },
      children: [],
    },
  };

  return { rootId: sectionId, nodes };
};

const createProposalFormBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const wrapperId = nanoid();
  const headingId = nanoid();
  const formCardId = nanoid();
  const nameInputId = nanoid();
  const emailInputId = nanoid();
  const companyInputId = nanoid();
  const budgetSelectId = nanoid();
  const messageTextareaId = nanoid();
  const submitButtonId = nanoid();

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [wrapperId],
      styles: {
        base: {
          backgroundColor: "#f8fbff",
          padding: { top: "96px", bottom: "96px", left: "64px", right: "64px" },
        },
        mobile: {
          padding: { left: "24px", right: "24px" },
        },
      },
    },
    [wrapperId]: {
      id: wrapperId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [headingId, formCardId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          maxWidth: "640px",
          margin: { left: "auto", right: "auto" },
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Tell us about your next campaign",
        tag: "h2",
      },
      children: [],
      styles: {
        base: {
          fontSize: "36px",
          fontWeight: 600,
          textAlign: "center",
        },
      },
    },
    [formCardId]: {
      id: formCardId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [nameInputId, emailInputId, companyInputId, budgetSelectId, messageTextareaId, submitButtonId],
      styles: {
        base: {
          display: "grid",
          gap: "16px",
          backgroundColor: "#ffffff",
          padding: { top: "32px", bottom: "32px", left: "32px", right: "32px" },
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
        },
      },
    },
    [nameInputId]: {
      id: nameInputId,
      type: "component",
      component: "forms.input",
      props: {
        label: "Full name",
        name: "fullName",
        placeholder: "Jane Cooper",
      },
      children: [],
    },
    [emailInputId]: {
      id: emailInputId,
      type: "component",
      component: "forms.input",
      props: {
        label: "Work email",
        name: "email",
        placeholder: "you@company.com",
      },
      children: [],
    },
    [companyInputId]: {
      id: companyInputId,
      type: "component",
      component: "forms.input",
      props: {
        label: "Company",
        name: "company",
        placeholder: "Company name",
      },
      children: [],
    },
    [budgetSelectId]: {
      id: budgetSelectId,
      type: "component",
      component: "forms.select",
      props: {
        label: "Monthly budget",
        name: "budget",
        options: "<$2k\n$2k - $10k\n$10k - $50k\n$50k+",
      },
      children: [],
    },
    [messageTextareaId]: {
      id: messageTextareaId,
      type: "component",
      component: "forms.textarea",
      props: {
        label: "Project details",
        name: "details",
        placeholder: "Share goals, timelines, and anything else we should know.",
        rows: 5,
      },
      children: [],
    },
    [submitButtonId]: {
      id: submitButtonId,
      type: "component",
      component: "content.button",
      props: {
        label: "Submit proposal",
        href: "#",
      },
      children: [],
      styles: {
        base: {
          justifyContent: "center",
          width: "100%",
        },
      },
    },
  };

  return { rootId: sectionId, nodes };
};

const createSliderBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const headingId = nanoid();
  const sliderId = nanoid();
  const slideImageIds = [nanoid(), nanoid(), nanoid()];

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [headingId, sliderId],
      styles: {
        base: {
          backgroundColor: "#ffffff",
          padding: { top: "72px", bottom: "72px", left: "64px", right: "64px" },
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Customer projects",
        tag: "h2",
      },
      children: [],
      styles: {
        base: {
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 600,
          margin: { bottom: "32px" },
        },
      },
    },
    [sliderId]: {
      id: sliderId,
      type: "layout",
      component: "media.slider",
      props: {
        autoplay: "6000",
      },
      children: slideImageIds,
      styles: {
        base: {
          width: "100%",
          height: "420px",
        },
      },
    },
    [slideImageIds[0]]: {
      id: slideImageIds[0],
      type: "component",
      component: "content.image",
      props: {
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        alt: "Dashboard",
      },
      children: [],
    },
    [slideImageIds[1]]: {
      id: slideImageIds[1],
      type: "component",
      component: "content.image",
      props: {
        url: "https://images.unsplash.com/photo-1525161493572-1e3b2839df62?auto=format&fit=crop&w=1200&q=80",
        alt: "Team collaboration",
      },
      children: [],
    },
    [slideImageIds[2]]: {
      id: slideImageIds[2],
      type: "component",
      component: "content.image",
      props: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alt: "Workspace",
      },
      children: [],
    },
  };

  return { rootId: sectionId, nodes };
};

const createVideoShowcaseBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const layoutId = nanoid();
  const contentId = nanoid();
  const videoId = nanoid();
  const headingId = nanoid();
  const bodyId = nanoid();
  const statRowId = nanoid();
  const statIds = [nanoid(), nanoid()];

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [layoutId],
      styles: {
        base: {
          backgroundColor: "#0f172a",
          padding: { top: "96px", bottom: "96px", left: "64px", right: "64px" },
        },
        mobile: {
          padding: { left: "24px", right: "24px" },
        },
      },
    },
    [layoutId]: {
      id: layoutId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [contentId, videoId],
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "40px",
          alignItems: "center",
        },
        mobile: {
          display: "flex",
          flexDirection: "column",
        },
      },
    },
    [contentId]: {
      id: contentId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [headingId, bodyId, statRowId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "See the funnel builder in action",
        tag: "h2",
      },
      children: [],
      styles: {
        base: {
          color: "#ffffff",
          fontSize: "40px",
          fontWeight: 600,
        },
      },
    },
    [bodyId]: {
      id: bodyId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Watch a 2-minute tour showing how teams launch campaigns with reusable templates and automated publishing.",
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          color: "#cbd5f5",
          fontSize: "16px",
          lineHeight: "1.7",
        },
      },
    },
    [statRowId]: {
      id: statRowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: statIds,
      styles: {
        base: {
          display: "flex",
          gap: "16px",
        },
        mobile: {
          flexDirection: "column",
        },
      },
    },
    [statIds[0]]: {
      id: statIds[0],
      type: "component",
      component: "content.stat",
      props: {
        value: "3x",
        label: "Faster launch",
        description: "Average time saved per campaign",
      },
      children: [],
    },
    [statIds[1]]: {
      id: statIds[1],
      type: "component",
      component: "content.stat",
      props: {
        value: "92%",
        label: "Adoption",
        description: "Teams using BakeMentor weekly",
      },
      children: [],
    },
    [videoId]: {
      id: videoId,
      type: "component",
      component: "media.video",
      props: {
        source: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        title: "Product Demo",
      },
      children: [],
      styles: {
        base: {
          width: "100%",
          borderRadius: "28px",
        },
      },
    },
  };

  return { rootId: sectionId, nodes };
};

const createTestimonialsBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const wrapperId = nanoid();
  const quoteId = nanoid();
  const authorId = nanoid();

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [wrapperId],
      styles: {
        base: {
          backgroundColor: "#f8fafc",
          padding: { top: "120px", bottom: "120px", left: "48px", right: "48px" },
        },
      },
    },
    [wrapperId]: {
      id: wrapperId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [quoteId, authorId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          textAlign: "center",
          maxWidth: "680px",
          margin: { left: "auto", right: "auto" },
        },
      },
    },
    [quoteId]: {
      id: quoteId,
      type: "component",
      component: "content.richText",
      props: {
        text: "\"BakeMentor changed how our team ships funnels. Production-ready in hours, not weeks.\"",
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          fontSize: "28px",
          lineHeight: "1.4",
          color: "#0f172a",
        },
      },
    },
    [authorId]: {
      id: authorId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Sofia Martin · VP Growth",
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          fontSize: "16px",
          color: "#475569",
        },
      },
    },
  };

  return { rootId: sectionId, nodes };
};

const createPricingBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const headingId = nanoid();
  const rowId = nanoid();

  const tierConfigs = [
    {
      name: "Starter",
      price: "$29/mo",
      description: "Launch up to 5 pages with basic analytics and email support.",
      cta: "Choose Starter",
      highlight: false,
    },
    {
      name: "Growth",
      price: "$59/mo",
      description: "Unlimited funnels, advanced targeting, and priority reviews.",
      cta: "Choose Growth",
      highlight: true,
    },
    {
      name: "Scale",
      price: "Custom",
      description: "Workflows, audit logs, and concierge support for large teams.",
      cta: "Talk to sales",
      highlight: false,
    },
  ] as const;

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [headingId, rowId],
      styles: {
        base: {
          backgroundColor: "#ffffff",
          padding: { top: "96px", bottom: "96px", left: "64px", right: "64px" },
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Pricing for every stage",
        tag: "h2",
      },
      children: [],
      styles: {
        base: {
          textAlign: "center",
          fontSize: "36px",
          fontWeight: 600,
          margin: { bottom: "48px" },
        },
      },
    },
    [rowId]: {
      id: rowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: [],
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        },
      },
    },
  };

  tierConfigs.forEach((tier) => {
    const columnId = nanoid();
    const titleId = nanoid();
    const priceId = nanoid();
    const descriptionId = nanoid();
    const buttonId = nanoid();

    nodes[rowId].children.push(columnId);

    nodes[columnId] = {
      id: columnId,
      type: "layout",
      component: "layout.column",
      props: {},
      children: [titleId, priceId, descriptionId, buttonId],
      styles: {
        base: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: { top: "32px", bottom: "32px", left: "24px", right: "24px" },
          borderRadius: "28px",
          backgroundColor: tier.highlight ? "#0f172a" : "#f8fafc",
          color: tier.highlight ? "#f8fafc" : "#0f172a",
          boxShadow: tier.highlight ? "0 20px 40px rgba(15, 23, 42, 0.18)" : undefined,
          border: tier.highlight ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
        },
      },
    };

    nodes[titleId] = {
      id: titleId,
      type: "component",
      component: "content.richText",
      props: {
        text: tier.name,
        tag: "h3",
      },
      children: [],
      styles: {
        base: {
          fontSize: "22px",
          fontWeight: 600,
        },
      },
    };

    nodes[priceId] = {
      id: priceId,
      type: "component",
      component: "content.richText",
      props: {
        text: tier.price,
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          fontSize: "32px",
          fontWeight: 700,
        },
      },
    };

    nodes[descriptionId] = {
      id: descriptionId,
      type: "component",
      component: "content.richText",
      props: {
        text: tier.description,
        tag: "p",
      },
      children: [],
      styles: {
        base: {
          fontSize: "15px",
          lineHeight: "1.6",
          color: tier.highlight ? "#e2e8f0" : "#475569",
        },
      },
    };

    nodes[buttonId] = {
      id: buttonId,
      type: "component",
      component: "content.button",
      props: {
        label: tier.cta,
        href: "#",
      },
      children: [],
      styles: {
        base: {
          width: "100%",
          backgroundColor: tier.highlight ? "#38bdf8" : "#e2e8f0",
          color: tier.highlight ? "#0f172a" : "#0f172a",
        },
      },
    };
  });

  return { rootId: sectionId, nodes };
};

const createStatsStripBlock = (): BlockDefinition => {
  const sectionId = nanoid();
  const headingId = nanoid();
  const rowId = nanoid();
  const statIds = [nanoid(), nanoid(), nanoid()];

  const stats = [
    { value: "24k", label: "Funnels launched", description: "Shipped using BakeMentor" },
    { value: "4.9/5", label: "CSAT", description: "Average support rating" },
    { value: "18 hrs", label: "Average time saved", description: "Per marketing campaign" },
  ];

  const nodes: Record<string, BuilderNode> = {
    [sectionId]: {
      id: sectionId,
      type: "layout",
      component: "layout.section",
      props: {},
      children: [headingId, rowId],
      styles: {
        base: {
          backgroundColor: "#111827",
          padding: { top: "80px", bottom: "80px", left: "64px", right: "64px" },
          color: "#f8fafc",
        },
      },
    },
    [headingId]: {
      id: headingId,
      type: "component",
      component: "content.richText",
      props: {
        text: "Metrics teams love",
        tag: "h2",
      },
      children: [],
      styles: {
        base: {
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 600,
          margin: { bottom: "40px" },
        },
      },
    },
    [rowId]: {
      id: rowId,
      type: "layout",
      component: "layout.row",
      props: {},
      children: statIds,
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
        },
      },
    },
  };

  statIds.forEach((statId, index) => {
    const stat = stats[index];
    nodes[statId] = {
      id: statId,
      type: "component",
      component: "content.stat",
      props: stat,
      children: [],
      styles: {
        base: {
          backgroundColor: "#1f2937",
          borderRadius: "18px",
        },
      },
    };
  });

  return { rootId: sectionId, nodes };
};

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: "hero",
    name: "Hero",
    description: "Headline, supporting copy, and primary actions.",
    create: createHeroBlock,
  },
  {
    id: "header",
    name: "Header",
    description: "Navigation bar with dropdown-ready items.",
    create: createHeaderBlock,
  },
  {
    id: "footer",
    name: "Footer",
    description: "Multi-column footer with brand copy.",
    create: createFooterBlock,
  },
  {
    id: "proposal-form",
    name: "Proposal Form",
    description: "Lead capture form for proposals.",
    create: createProposalFormBlock,
  },
  {
    id: "image-slider",
    name: "Image Slider",
    description: "Carousel for showcasing visuals.",
    create: createSliderBlock,
  },
  {
    id: "video-showcase",
    name: "Video Showcase",
    description: "Feature section with embedded video and stats.",
    create: createVideoShowcaseBlock,
  },
  {
    id: "stats-strip",
    name: "Stats Strip",
    description: "Row of key metrics for quick social proof.",
    create: createStatsStripBlock,
  },
  {
    id: "testimonials",
    name: "Testimonial",
    description: "Centered testimonial quote with attribution.",
    create: createTestimonialsBlock,
  },
  {
    id: "pricing",
    name: "Pricing",
    description: "Three-column pricing comparison.",
    create: createPricingBlock,
  },
];
