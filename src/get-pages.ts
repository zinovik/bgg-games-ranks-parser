import chromium from '@sparticuz/chromium';
import puppeteer, { type HTTPRequest } from 'puppeteer';

export const GAMES_PER_PAGE = 100;
const URL = 'https://boardgamegeek.com/browse/boardgame/page/';
const SELECTOR = '#collectionitems';
const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 1000;

const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const getPages = async (pageNumbers: number[]): Promise<string[]> => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    });

    try {
        const promises = pageNumbers.map(async (pageNumber) => {
            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
                const page = await browser.newPage();

                try {
                    await page.setUserAgent(
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    );
                    await page.setJavaScriptEnabled(false);
                    await page.setRequestInterception(true);
                    page.on('request', (req: HTTPRequest) => {
                        if (
                            req.resourceType() === 'image' ||
                            req.resourceType() === 'stylesheet' ||
                            req.resourceType() === 'font'
                        ) {
                            req.abort();
                        } else {
                            req.continue();
                        }
                    });

                    await page.goto(`${URL}${pageNumber}?${Date.now()}`, {
                        waitUntil: 'domcontentloaded',
                        timeout: 60000,
                    });
                    await page.waitForSelector(SELECTOR, { timeout: 10000 });

                    return await page.content();
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : String(error);
                    if (attempt === MAX_ATTEMPTS) {
                        throw new Error(
                            `Failed to fetch page ${pageNumber} after ${MAX_ATTEMPTS} attempts: ${message}`
                        );
                    }

                    await wait(RETRY_DELAY_MS);
                } finally {
                    await page.close().catch((): void => undefined);
                }
            }

            throw new Error(`Unexpected failure fetching page ${pageNumber}`);
        });

        const pages = await Promise.all(promises);

        return pages;
    } finally {
        await browser.close().catch((): void => undefined);
    }
};
