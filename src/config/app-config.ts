import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Netflix 100 Plus",
  version: packageJson.version,
  copyright: `© ${currentYear}, Netflix 100 Plus.`,
  meta: {
    title: "Netflix 100 Plus",
    description: "Netflix 100 Plus",
  },
};
