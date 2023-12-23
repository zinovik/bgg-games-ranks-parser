import { DOMParser } from 'xmldom';
import { select, SelectedValue } from 'xpath';

const GAME_RANKS_X_PATH = `//td[@class='collection_rank']`;
const GAME_NAMES_YEARS_X_PATH = `//div[starts-with(@id,'results_objectname')]`;
const GAME_LINK_X_PATH = `//div[starts-with(@id,'results_objectname')]//a/@href`;

export interface Game {
  rank: number;
  name: string;
  year: string;
  id: string;
}

const getString = (selectedValue: SelectedValue): string =>
  (selectedValue as { textContent: string }).textContent.trim();
const getIdFromLink = (link: string): string => link.split('/')[2];

export const parsePage = (page: string): Game[] => {
  const dom = new DOMParser({
    errorHandler: {
      warning: () => null,
    },
  }).parseFromString(page);

  const ranks = select(GAME_RANKS_X_PATH, dom).map((selectedValue) => getString(selectedValue));
  const namesYears = select(GAME_NAMES_YEARS_X_PATH, dom).map((selectedValue) => getString(selectedValue));
  const ids = select(GAME_LINK_X_PATH, dom).map((selectedValue) => getIdFromLink(getString(selectedValue)));

  const names: string[] = [];
  const years: string[] = [];

  namesYears.forEach((nameYear) => {
    const endOfNameIndex = nameYear.indexOf('\n');
    const startOfYearIndex = nameYear.indexOf('\t(');

    if (endOfNameIndex === -1 || startOfYearIndex === -1) {
      names.push(nameYear);
      years.push('');

      return;
    }

    const name = nameYear.substring(0, endOfNameIndex);
    const year = nameYear
      .substring(startOfYearIndex + 1)
      .replace('(', '')
      .replace(')', '');

    names.push(name);
    years.push(year);
  });

  return ranks.map((rank, i) => ({
    rank: Number(rank),
    name: names[i],
    year: years[i],
    id: ids[i],
  }));
};
