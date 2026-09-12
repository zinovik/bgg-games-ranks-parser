import fs from 'fs';
import path from 'path';
import { getGamesDataFromCsv } from '../../src/get-games-from-csv';
import { parsePage } from '../../src/parse-page';
import gamesMock from './mocks/games.json';

describe('parsePage()', () => {
    it('Should parse the page', async () => {
        // Arrange
        const page = fs.readFileSync(
            path.join(__dirname, './mocks/page.html'),
            'utf-8'
        );

        // Act
        const games = parsePage(page);

        // Assert
        expect(games).toEqual(gamesMock);
    });
});

describe('getGamesDataFromCsv()', () => {
    it('Should fetch the remote CSV and parse highest-ranked games', async () => {
        const csv = `rank,id,name,yearpublished,bayesaverage,average,usersrated,is_expansion,abstracts_rank,cgs_rank,childrensgames_rank,familygames_rank,partygames_rank,strategygames_rank,thematic_rank,wargames_rank
1,101,Game One,1995,8.4,8.1,1500,0,0,0,0,0,0,0,0,0
2,202,Game Two,2000,7.8,7.3,900,0,0,0,0,0,0,0,0,0
3,303,Game Three,2005,6.9,6.5,450,0,0,0,0,0,0,0,0,0`;

        const mockedFetch = jest.fn().mockResolvedValue({
            ok: true,
            text: async () => csv,
        });
        global.fetch = mockedFetch as typeof fetch;

        const games = await getGamesDataFromCsv(2);

        expect(mockedFetch).toHaveBeenCalledWith(
            'https://storage.googleapis.com/boardgamegeek-bg-ranks-data-dump/boardgames_ranks.csv'
        );
        expect(games).toEqual([
            { rank: 1, name: 'Game One', year: '1995', id: '101' },
            { rank: 2, name: 'Game Two', year: '2000', id: '202' },
        ]);
    });
});
