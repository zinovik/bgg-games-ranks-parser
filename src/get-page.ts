import puppeteer from 'puppeteer';

export const GAMES_PER_PAGE = 100;
const URL = 'https://boardgamegeek.com/browse/boardgame/page/';

export const getPage = async (pageNumber: number): Promise<string> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`${URL}${pageNumber}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#collectionitems', { timeout: 10000 });
    const content = await page.content();
    await browser.close();

    return content;
};
