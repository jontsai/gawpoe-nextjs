import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3186",
    headless: true,
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run preview",
        url: "http://127.0.0.1:3186",
        reuseExistingServer: !process.env.CI,
      },
  workers: 2,
  reporter: "list",
});
