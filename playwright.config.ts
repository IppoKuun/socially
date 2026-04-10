// IA: Playwright
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Playwright lance les test 1 par 1 pour évitez conflict DB //
  forbidOnly: Boolean(process.env.CI), // fait échouer CI si .only est oubliée //
  retries: process.env.CI ? 2 : 0, // sur Git Actions les serveur sont moins stable, possbilité de retries apres err //
  workers: process.env.CI ? 1 : undefined, // On prends qu'un seul workers sur Github actions car sinon rame. //
  reporter: process.env.CI ? [["html"], ["github"]] : [["list"], ["html"]],
  //  Maniere dont le compte rendu est affiché après les test :
  // list adapté aux terminal, utile en dev, github addapté pour githb action, HTML, page web a consulter //

  use: {
    baseURL,
    trace: "on-first-retry", // Enregistre la trace uniquement au premier retry //
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Screen et vidéo pris uniquement en cas d'échec //
  },

  projects: [
    {
      name: "socially",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,

    // stdout = quand le serveur envoie str normal, stderr quand il envoie une err. pipre veut dire absorbe tout ce qui se passe //
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120 * 1000, //  délai maximal laissé au serveur pour devenir disponible avant de faire échouer la suite en millisecondes //
    env: {
      ...process.env,
      NEXT_PUBLIC_URL: baseURL,
    },
  },
});
