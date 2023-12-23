import fs from 'fs';
import path from 'path';
import { parsePage } from '../../src/parse-page';
import gamesMock from './mocks/games.json';

describe('parsePage()', () => {
  it('Should parse the page', async () => {
    // Arrange
    const page = fs.readFileSync(path.join(__dirname, './mocks/page.html'), 'utf-8');

    // Act
    const games = parsePage(page);

    // Assert
    expect(games).toEqual(gamesMock);
  });
});
