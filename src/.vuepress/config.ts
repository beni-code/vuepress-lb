import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/vuepress-lb/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "Notes"
    },
  },

  theme,

  shouldPrefetch: false,
});
