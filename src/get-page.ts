import axios from 'axios';

export const GAMES_PER_PAGE = 100;
const URL = 'https://boardgamegeek.com/browse/boardgame/page/';

export const getPage = async (pageNumber: number): Promise<string> => {
    const { status, data: page } = await axios.get(
        `${URL}${pageNumber}?${new Date().getTime()}`
    );
    console.log(`Page ${pageNumber} | status: ${status}`);

    return page;
};
