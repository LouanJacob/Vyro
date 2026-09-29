import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = process.env.GITHUB_REPOSITORY;
const match = repository?.match(/^([^/]+)\/([^/]+)$/);

if (!match) {
  throw new Error("GITHUB_REPOSITORY must be set to owner/repository by GitHub Actions.");
}

const [, owner, repositoryName] = match;
const isUserSite = repositoryName.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const host = `${owner.toLowerCase()}.github.io`;
const baseUrl = isUserSite
  ? `https://${host}/`
  : `https://${host}/${repositoryName}/`;
const dist = resolve("dist");

const configPath = resolve(dist, "config.js");
const config = await readFile(configPath, "utf8");
const updatedConfig = config.replace(
  /siteUrl:\s*["'][^"']*["']/,
  `siteUrl: ${JSON.stringify(baseUrl)}`,
);
if (updatedConfig === config) {
  throw new Error("Could not find siteUrl in dist/config.js.");
}
await writeFile(configPath, updatedConfig);

const sitemapPath = resolve(dist, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const updatedSitemap = sitemap.replace(
  /<loc>[^<]*<\/loc>/,
  `<loc>${baseUrl}</loc>`,
);
if (updatedSitemap === sitemap) {
  throw new Error("Could not find a sitemap URL in dist/sitemap.xml.");
}
await writeFile(sitemapPath, updatedSitemap);

const robotsPath = resolve(dist, "robots.txt");
const robots = await readFile(robotsPath, "utf8");
const sitemapDirective = `Sitemap: ${baseUrl}sitemap.xml`;
const updatedRobots = /^Sitemap:.*$/m.test(robots)
  ? robots.replace(/^Sitemap:.*$/m, sitemapDirective)
  : `${robots.trimEnd()}\n${sitemapDirective}\n`;
await writeFile(robotsPath, updatedRobots);

console.log(`Prepared GitHub Pages base URL: ${baseUrl}`);
