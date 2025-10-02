import { nanoid } from "nanoid";

import type { BuilderNode } from "@/types/builder";
import type { PageTemplate } from "@/features/builder/templates";
import { PAGE_TEMPLATES as BASE_TEMPLATES } from "@/features/builder/templates";

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

const buildCommerceSpark = (): PageTemplate => ({
  id: "commerce-spark",
  name: "Commerce Spark",
  description: "Ecommerce landing with header, slider, product grid, testimonial, form, and footer.",
  category: "Ecommerce",
  accent: "#16a34a",
  previewBackground: "linear-gradient(135deg, #ecfdf5 10%, #ffffff 90%)",
  create: () => {
    const nodes: Record<string, BuilderNode> = {};

    const rootId = layoutNode(nodes, "layout.section", [], {
      base: { display: "flex", flexDirection: "column", gap: "64px", backgroundColor: "#ffffff", padding: { top: "0px", bottom: "96px" } },
    });

    const headerId = layoutNode(nodes, "layout.navbar", [], { base: { backgroundColor: "#ffffff", padding: { top: "12px", bottom: "12px", left: "24px", right: "24px" }, borderBottom: "1px solid #e5e7eb" } });
    const headerWrapId = layoutNode(nodes, "layout.container", [], { base: { display: "flex", alignItems: "center", justifyContent: "space-between" } });
    const brandId = richTextNode(nodes, "Spark", "h3", { base: { fontSize: "18px", fontWeight: 700, color: "#111827" } });
    const shopCtaId = buttonNode(nodes, "Shop now", "primary", { base: { width: "fit-content" } });
    nodes[headerWrapId].children = [brandId, shopCtaId];
    nodes[headerId].children = [headerWrapId];

    const heroTitleId = richTextNode(nodes, "Refresh your everyday carry", "h1", { base: { fontSize: "40px", lineHeight: "1.1", fontWeight: 700, color: "#111827" }, mobile: { fontSize: "30px" } });
    const heroBodyId = richTextNode(nodes, "Premium materials and meticulous details.", "p", { base: { fontSize: "16px", lineHeight: "1.7", color: "#4b5563", maxWidth: "640px" } });
    const heroCtaId = buttonNode(nodes, "Browse collection", "primary", { base: { width: "fit-content" } });
    const sliderId = layoutNode(nodes, "media.slider", [], { base: { width: "100%", height: "260px", borderRadius: "16px" } });
    ["/hero-1.jpg", "/hero-2.jpg"].forEach((src) => {
      registerNode(nodes, { id: nanoid(), type: "component", component: "content.image", props: { assetId: src, alt: "Featured" }, children: [], styles: { base: { width: "100%", height: "100%", objectFit: "cover" } } });
    });
    const heroContainerId = layoutNode(nodes, "layout.container", [heroTitleId, heroBodyId, heroCtaId, sliderId], { base: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1080px", margin: { left: "auto", right: "auto" } } });
    const heroSectionId = layoutNode(nodes, "layout.section", [heroContainerId], { base: { backgroundColor: "#f9fafb", padding: { top: "48px", bottom: "48px", left: "24px", right: "24px" } } });

    const products = [
      { name: "Backpack", price: "$179", img: "/prod-1.jpg" },
      { name: "Sling", price: "$89", img: "/prod-2.jpg" },
      { name: "Duffel", price: "$219", img: "/prod-3.jpg" },
      { name: "Organizer", price: "$59", img: "/prod-4.jpg" },
    ];
    const productIds = products.map((p) => {
      const imgId = registerNode(nodes, { id: nanoid(), type: "component", component: "content.image", props: { assetId: p.img, alt: p.name }, children: [], styles: { base: { width: "100%", height: "160px", borderRadius: "12px", objectFit: "cover" } } });
      const nameId = richTextNode(nodes, p.name, "h3", { base: { fontSize: "16px", fontWeight: 600, color: "#111827" } });
      const priceId = richTextNode(nodes, p.price, "p", { base: { fontSize: "14px", color: "#065f46" } });
      const addId = buttonNode(nodes, "Add to cart", "secondary", { base: { width: "fit-content" } });
      return layoutNode(nodes, "layout.column", [imgId, nameId, priceId, addId], { base: { display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#ffffff", padding: { top: "12px", bottom: "12px", left: "12px", right: "12px" }, borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } });
    });
    const productsHeadingId = richTextNode(nodes, "Popular this week", "h2", { base: { fontSize: "24px", fontWeight: 700, color: "#111827" } });
    const gridId = layoutNode(nodes, "layout.row", productIds, { base: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" } });
    const productsContainerId = layoutNode(nodes, "layout.container", [productsHeadingId, gridId], { base: { maxWidth: "1080px", margin: { left: "auto", right: "auto" }, display: "flex", flexDirection: "column", gap: "12px" } });
    const productsSectionId = layoutNode(nodes, "layout.section", [productsContainerId], { base: { padding: { top: "8px", bottom: "8px", left: "24px", right: "24px" } } });

    const quoteId = richTextNode(nodes, "“Outstanding quality and fast shipping.”", "h3", { base: { fontSize: "18px", fontWeight: 600, color: "#111827" } });
    const authorId = richTextNode(nodes, "Mira — Verified buyer", "p", { base: { fontSize: "12px", color: "#6b7280" } });
    const tCardId = layoutNode(nodes, "layout.column", [quoteId, authorId], { base: { backgroundColor: "#ecfdf5", padding: { top: "20px", bottom: "20px", left: "20px", right: "20px" }, borderRadius: "16px", gap: "6px" } });
    const tWrapId = layoutNode(nodes, "layout.container", [tCardId], { base: { maxWidth: "820px", margin: { left: "auto", right: "auto" } } });
    const testimonialSectionId2 = layoutNode(nodes, "layout.section", [tWrapId], { base: { padding: { top: "8px", bottom: "8px", left: "24px", right: "24px" } } });

    const formHeadingId = richTextNode(nodes, "Get 10% off your first order", "h2", { base: { fontSize: "20px", fontWeight: 700, color: "#111827" } });
    const emailField = registerNode(nodes, { id: nanoid(), type: "component", component: "forms.input", props: { name: "email", label: "Email", placeholder: "you@example.com" }, children: [] });
    const submitBtn = buttonNode(nodes, "Sign up", "primary", { base: { width: "fit-content" } });
    const formRowId = layoutNode(nodes, "layout.row", [emailField, submitBtn], { base: { display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }, mobile: { gridTemplateColumns: "1fr" } });
    const formContainerId = layoutNode(nodes, "layout.container", [formHeadingId, formRowId], { base: { maxWidth: "720px", margin: { left: "auto", right: "auto" }, display: { } as any } });
    const formSectionId = layoutNode(nodes, "layout.section", [formContainerId], { base: { backgroundColor: "#f9fafb", padding: { top: "20px", bottom: "20px", left: "24px", right: "24px" } } });

    const footerId = layoutNode(nodes, "layout.footer", [], { base: { backgroundColor: "#111827", color: "#e5e7eb", padding: { top: "24px", bottom: "24px", left: "24px", right: "24px" } } });
    const fWrapId = layoutNode(nodes, "layout.container", [], { base: { display: "flex", alignItems: "center", justifyContent: "space-between" } });
    const fBrandId = richTextNode(nodes, "Spark", "h3", { base: { fontSize: "14px", fontWeight: 700, color: "#e5e7eb" } });
    const fCopyId = richTextNode(nodes, "© 2025 Spark Goods", "p", { base: { fontSize: "12px", color: "#9ca3af" } });
    nodes[fWrapId].children = [fBrandId, fCopyId];
    nodes[footerId].children = [fWrapId];

    nodes[rootId].children = [headerId, heroSectionId, productsSectionId, testimonialSectionId2, formSectionId, footerId];

    return { tree: { version: TEMPLATE_VERSION, root: rootId, nodes }, assets: [], meta: { templateName: "Commerce Spark" } };
  },
});

const buildAgencySkyline = (): PageTemplate => ({
  id: "agency-skyline",
  name: "Agency Skyline",
  description: "Agency landing with header, services, slider, testimonial, contact form, and footer.",
  category: "Agency",
  accent: "#0ea5e9",
  previewBackground: "linear-gradient(135deg, #e0f2fe 10%, #ffffff 90%)",
  create: () => {
    const nodes: Record<string, BuilderNode> = {};

    const rootId = layoutNode(nodes, "layout.section", [], { base: { display: "flex", flexDirection: "column", gap: "64px", backgroundColor: "#ffffff", padding: { top: "0px", bottom: "96px" } } });

    const headerId = layoutNode(nodes, "layout.navbar", [], { base: { backgroundColor: "#ffffff", padding: { top: "12px", bottom: "12px", left: "24px", right: "24px" }, borderBottom: "1px solid #e5e7eb" } });
    const hwId = layoutNode(nodes, "layout.container", [], { base: { display: "flex", alignItems: "center", justifyContent: "space-between" } });
    const hbId = richTextNode(nodes, "Skyline", "h3", { base: { fontSize: "16px", fontWeight: 700, color: "#0f172a" } });
    const hcId = buttonNode(nodes, "Contact", "secondary", { base: { width: "fit-content" } });
    nodes[hwId].children = [hbId, hcId];
    nodes[headerId].children = [hwId];

    const titleId = richTextNode(nodes, "We design products people love", "h1", { base: { fontSize: "40px", lineHeight: "1.1", fontWeight: 700, color: "#0f172a" }, mobile: { fontSize: "30px" } });
    const bodyId = richTextNode(nodes, "A strategy-led design studio helping SaaS teams move faster.", "p", { base: { fontSize: "16px", lineHeight: "1.7", color: "#475569", maxWidth: "640px" } });
    const ctasId = layoutNode(nodes, "layout.row", [buttonNode(nodes, "Our work", "primary"), buttonNode(nodes, "Get proposal", "secondary")], { base: { display: "flex", gap: "10px" }, mobile: { flexDirection: "column" } });
    const introContainerId = layoutNode(nodes, "layout.container", [titleId, bodyId, ctasId], { base: { display: "flex", flexDirection: "column", gap: "14px", maxWidth: "960px", margin: { left: "auto", right: "auto" } } });
    const introSectionId = layoutNode(nodes, "layout.section", [introContainerId], { base: { backgroundColor: "#f8fafc", padding: { top: "48px", bottom: "40px", left: "24px", right: "24px" } } });

    const services = [
      { title: "Product design", body: "UI/UX, prototyping, and systems" },
      { title: "Brand systems", body: "Identity, motion, and voice" },
      { title: "Go-to-market", body: "Web, campaigns, and content" },
    ];
    const serviceIds = services.map((s) => {
      const st = richTextNode(nodes, s.title, "h3", { base: { fontSize: "16px", fontWeight: 600, color: "#0f172a" } });
      const sb = richTextNode(nodes, s.body, "p", { base: { fontSize: "14px", color: "#475569" } });
      return layoutNode(nodes, "layout.column", [st, sb], { base: { backgroundColor: "#ffffff", padding: { top: "16px", bottom: "16px", left: "16px", right: "16px" }, borderRadius: "14px", gap: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } });
    });
    const servicesHeadingId = richTextNode(nodes, "What we do", "h2", { base: { fontSize: "22px", fontWeight: 700, color: "#0f172a" } });
    const servicesGridId = layoutNode(nodes, "layout.row", serviceIds, { base: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" } });
    const servicesContainerId = layoutNode(nodes, "layout.container", [servicesHeadingId, servicesGridId], { base: { maxWidth: "1080px", margin: { left: "auto", right: "auto" }, display: "flex", flexDirection: "column", gap: "12px" } });
    const servicesSectionId = layoutNode(nodes, "layout.section", [servicesContainerId], { base: { padding: { top: "8px", bottom: "8px", left: "24px", right: "24px" } } });

    const showcaseId = layoutNode(nodes, "media.slider", [], { base: { width: "100%", height: "240px", borderRadius: "16px" } });
    ["/work-1.jpg", "/work-2.jpg"].forEach((src) => {
      registerNode(nodes, { id: nanoid(), type: "component", component: "content.image", props: { assetId: src, alt: "Case" }, children: [], styles: { base: { width: "100%", height: "100%", objectFit: "cover" } } });
    });
    const showcaseContainerId = layoutNode(nodes, "layout.container", [showcaseId], { base: { maxWidth: "1080px", margin: { left: "auto", right: "auto" } } });
    const showcaseSectionId = layoutNode(nodes, "layout.section", [showcaseContainerId], { base: { backgroundColor: "#f1f5f9", padding: { top: "20px", bottom: "20px", left: "24px", right: "24px" } } });

    const qId = richTextNode(nodes, "“Embedded partners who ship fast.”", "h3", { base: { fontSize: "18px", fontWeight: 600, color: "#0f172a" } });
    const qById = richTextNode(nodes, "Ava Chen — VP Product", "p", { base: { fontSize: "12px", color: "#64748b" } });
    const qCardId = layoutNode(nodes, "layout.column", [qId, qById], { base: { backgroundColor: "#ffffff", padding: { top: "20px", bottom: "20px", left: "20px", right: "20px" }, borderRadius: "16px", gap: "6px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } });
    const qWrapId = layoutNode(nodes, "layout.container", [qCardId], { base: { maxWidth: "820px", margin: { left: "auto", right: "auto" } } });
    const qSectionId = layoutNode(nodes, "layout.section", [qWrapId], { base: { padding: { top: "8px", bottom: "8px", left: "24px", right: "24px" } } });

    const cfHeadingId = richTextNode(nodes, "Tell us about your project", "h2", { base: { fontSize: "22px", fontWeight: 700, color: "#0f172a" } });
    const cfName = registerNode(nodes, { id: nanoid(), type: "component", component: "forms.input", props: { name: "name", label: "Name" }, children: [] });
    const cfEmail = registerNode(nodes, { id: nanoid(), type: "component", component: "forms.input", props: { name: "email", label: "Email" }, children: [] });
    const cfMessage = registerNode(nodes, { id: nanoid(), type: "component", component: "forms.textarea", props: { name: "message", label: "Project details" }, children: [] });
    const cfSubmit = buttonNode(nodes, "Request proposal", "primary", { base: { width: "fit-content" } });
    const cfGrid = layoutNode(nodes, "layout.row", [cfName, cfEmail, cfMessage, cfSubmit], { base: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }, mobile: { gridTemplateColumns: "1fr" } });
    const cfContainer = layoutNode(nodes, "layout.container", [cfHeadingId, cfGrid], { base: { maxWidth: "960px", margin: { left: "auto", right: "auto" }, display: "flex", flexDirection: "column", gap: "12px" } });
    const cfSection = layoutNode(nodes, "layout.section", [cfContainer], { base: { backgroundColor: "#f8fafc", padding: { top: "20px", bottom: "20px", left: "24px", right: "24px" } } });

    const footerId = layoutNode(nodes, "layout.footer", [], { base: { backgroundColor: "#0f172a", color: "#e2e8f0", padding: { top: "24px", bottom: "24px", left: "24px", right: "24px" } } });
    const fWrapId = layoutNode(nodes, "layout.container", [], { base: { display: "flex", alignItems: "center", justifyContent: "space-between" } });
    const fBrandId = richTextNode(nodes, "Skyline", "h3", { base: { fontSize: "14px", fontWeight: 700, color: "#e2e8f0" } });
    const fCopyId = richTextNode(nodes, "© 2025 Skyline Studio", "p", { base: { fontSize: "12px", color: "#94a3b8" } });
    nodes[fWrapId].children = [fBrandId, fCopyId];
    nodes[footerId].children = [fWrapId];

    nodes[rootId].children = [headerId, introSectionId, servicesSectionId, showcaseSectionId, qSectionId, cfSection, footerId];

    return { tree: { version: TEMPLATE_VERSION, root: rootId, nodes }, assets: [], meta: { templateName: "Agency Skyline" } };
  },
});

export const EXTRA_PAGE_TEMPLATES: PageTemplate[] = [buildCommerceSpark(), buildAgencySkyline()];

export const PAGE_TEMPLATES: PageTemplate[] = [...BASE_TEMPLATES, ...EXTRA_PAGE_TEMPLATES];


