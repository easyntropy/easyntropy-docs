import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  port: 3001,
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: "/images/logo.png",
    contributors: false,
    colorMode: "dark",
    colorModeSwitch: false,
    sidebar: [
      {
        text: "",
        children: ["/documentation/", "/documentation/examples"],
      },
    ],
    navbar: [
      {
        text: "Our own NFT!",
        link: "https://easyntropy.tech/easyntrophy/",
      },
      {
        text: "About",
        link: "/about/",
      },
      {
        text: "Documentation",
        link: "/documentation/",
      },
      {
        text: "Examples",
        link: "/documentation/examples",
      },
      {
        text: "Github",
        link: "https://github.com/easyntropy/easyntropy-contracts",
      },
      {
        text: "Discord",
        link: "https://discord.gg/qDPmAR7ez6",
      },
    ],
  }),
  base: "/",
  dest: "./dist/public",
  title: "Easyntropy",
  description: "A flexible, extremely easy-to-use RNG oracle for Ethereum.",
});
