import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5180/ai", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const out = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll(".ai-usecase-card"));
  const sec = document.querySelector("[data-ai-usecases]");
  const usecasesGrid = document.querySelector(".ai-usecases-grid");
  const usecasesList = document.querySelector(".ai-usecases-list");
  const archCards = Array.from(document.querySelectorAll(".ai-arch-node-card"));
  const archSec = document.querySelector("[data-ai-arch]");
  const archNodes = document.querySelector(".ai-arch-nodes");
  return {
    section: sec ? { offsetHeight: sec.offsetHeight, top: sec.getBoundingClientRect().top + window.scrollY } : null,
    grid: usecasesGrid ? { offsetHeight: usecasesGrid.offsetHeight } : null,
    list: usecasesList
      ? { offsetHeight: usecasesList.offsetHeight, display: getComputedStyle(usecasesList).display }
      : null,
    cardCount: cards.length,
    cards: cards.slice(0, 4).map((c) => ({
      offsetHeight: c.offsetHeight,
      offsetTop: c.getBoundingClientRect().top + window.scrollY,
      display: getComputedStyle(c).display,
      opacity: getComputedStyle(c).opacity,
      transform: getComputedStyle(c).transform,
      visibility: getComputedStyle(c).visibility,
      title: c.querySelector(".ai-usecase-card__title")?.textContent,
    })),
    archSection: archSec ? { offsetHeight: archSec.offsetHeight, top: archSec.getBoundingClientRect().top + window.scrollY } : null,
    archNodes: archNodes ? { offsetHeight: archNodes.offsetHeight } : null,
    archCardCount: archCards.length,
    archCards: archCards.slice(0, 6).map((c) => ({
      offsetHeight: c.offsetHeight,
      offsetTop: c.getBoundingClientRect().top + window.scrollY,
      label: c.querySelector(".ai-arch-node-card__label")?.textContent,
    })),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
