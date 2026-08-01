import type { WebsiteSectionContent } from "./sections.js";
import { corporateTemplate } from "./website-templates/corporate.js";
import { restaurantTemplate } from "./website-templates/restaurant.js";
import { constructionTemplate } from "./website-templates/construction.js";
import { realEstateTemplate } from "./website-templates/real-estate.js";
import { hotelTemplate } from "./website-templates/hotel.js";
import { portfolioTemplate } from "./website-templates/portfolio.js";
import { lawFirmTemplate } from "./website-templates/law-firm.js";
import { schoolTemplate } from "./website-templates/school.js";
import { ecommerceTemplate } from "./website-templates/ecommerce.js";
import { travelAgencyTemplate } from "./website-templates/travel-agency.js";

export type WebsiteTemplatePageDefinition = {
  title: string;
  slug: string;
  sections: WebsiteSectionContent[];
};

export type WebsiteTemplateDefinition = {
  id: string;
  defaultThemeId: string;
  pages: WebsiteTemplatePageDefinition[];
};

/**
 * Rich, section-based content for templates. Keyed by the same id used in
 * `templatePresets`. Templates not present here fall back to generic filler
 * content (see createDefaultSections in website-project-state.ts) — adding
 * template #11+ later is just adding one more entry here.
 */
export const websiteTemplateDefinitions: Record<string, WebsiteTemplateDefinition> = {
  [corporateTemplate.id]: corporateTemplate,
  [restaurantTemplate.id]: restaurantTemplate,
  [constructionTemplate.id]: constructionTemplate,
  [realEstateTemplate.id]: realEstateTemplate,
  [hotelTemplate.id]: hotelTemplate,
  [portfolioTemplate.id]: portfolioTemplate,
  [lawFirmTemplate.id]: lawFirmTemplate,
  [schoolTemplate.id]: schoolTemplate,
  [ecommerceTemplate.id]: ecommerceTemplate,
  [travelAgencyTemplate.id]: travelAgencyTemplate,
};

export const getWebsiteTemplateDefinition = (id: string): WebsiteTemplateDefinition | undefined =>
  websiteTemplateDefinitions[id];
