import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer';

export const GAMES_PER_PAGE = 100;
const URL = 'https://boardgamegeek.com/browse/boardgame/page/';

export const getPages = async (pageNumbers: number[]): Promise<string[]> => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    });

    const promises = pageNumbers.map(async (pageNumber) => {
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        await page.setJavaScriptEnabled(false);
        await page.setRequestInterception(true);
        page.on('request', (req) => {
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
        await page.goto(`${URL}${pageNumber}?${new Date().getTime()}`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });
        await page.waitForSelector('#collectionitems', { timeout: 10000 });
        const content = await page.content();
        await page.close();
        return content;
    });

    const pages = await Promise.all(promises);

    await browser.close();

    return pages;
};
