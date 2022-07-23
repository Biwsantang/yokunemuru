export const animeFormat: any = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
  MANGA: "Manga",
  NOVEL: "Novel",
  ONE_SHOT: "One Shot",
};

export const animeSeason: any = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

export interface SearchState {
  results: anime[];
  isLoading: boolean;
}

export interface anime {
  id: number;
  name: string;
  image: string;
  format: string;
  season: string;
  seasonYear: string;
  siteUrl: string;
}
