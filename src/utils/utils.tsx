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

export interface Preferences {
  title_language: string;
}

interface Date {
  year: string; // num
  month: string; // num
  day: string; // num
}

export interface SearchState {
  results: anime[];
  isLoading: boolean;
}

export interface anime {
  id: string; // num
  name: string;
  image: string;
  imageLarge: string;
  bannerImage: string;
  type: string;
  format: string;
  status: string;
  //startDate: Date;
  //endDate: Date;
  season: string;
  seasonYear: string;
  averageScore: string; // num
  meanScore: string; // num
  popularity: string; // num
  favourites: string; // num
  //studios: [string];
  source: string;
  hashtag: string;
  genres: [string];
  siteUrl: string;
}

export interface animeMedia {
  id: string; // num
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    medium: string;
    large: string;
  };
  bannerImage: string;
  type: string;
  format: string;
  status: string;
  startDate: Date;
  endDate: Date;
  season: string;
  seasonYear: string; // num
  averageScore: string; // num
  meanScore: string; // num
  popularity: string; // num
  favourites: string; // num
  /*
  studios: {
    edges: [
      {
        node: {
          name: string;
        };
      }
    ];
  };
  */
  source: string;
  hashtag: string;
  genres: [string];
  siteUrl: string;
}

export interface pageInfo {
  currentPage: number;
  hasNextPage: boolean;
}

export const animeQuery = `
id
title {
  romaji
  english
  native
}
coverImage {
  medium
  large
}
bannerImage
type
format
status
startDate {
  year
  month
  day
}
endDate {
  year
  month
  day
}
season
seasonYear
averageScore
meanScore
popularity
favourites
source
hashtag
genres
siteUrl
`;

/*
studios {
  edges {
    node {
      name
    }
  }
}
*/

export function mapAnime(media: animeMedia) {
  return {
    id: media.id,
    name: media.title.romaji,
    image: media.coverImage.medium,
    imageLarge: media.coverImage.large,
    bannerImage: media.bannerImage,
    type: media.type,
    format: animeFormat[media.format],
    status: media.status,
    /*startDate: {
      media.startDate.year,
      media.startDate.month,
      media.startDate.day,
    },
    endDate: {
      media.endDate.year,
      media.endDate.month,
      media.endDate.day,
    }*/
    season: animeSeason[media.season],
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    meanScore: media.meanScore,
    popularity: media.popularity,
    favourites: media.favourites,
    //studios: media.studios,
    source: media.source,
    hashtag: media.hashtag,
    genres: media.genres,
    siteUrl: media.siteUrl,
  };
}

export interface responseAnime {
  data: {
    Page: {
      pageInfo: pageInfo;
      media: animeMedia[];
    };
  };
}

export interface responseYourAnime {
  data: {
    Page: {
      pageInfo: pageInfo;
      mediaList: {
        media: animeMedia;
      }[];
    };
  };
}
