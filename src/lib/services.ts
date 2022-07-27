import fetch from "node-fetch";
import {
  SearchNameQuery,
  SearchNameQueryVariables,
  SeasonalQuery,
  SeasonalQueryVariables,
} from "../query/media.generated";
import { Media, Page } from "../schema.generated";

export async function performSearch(searchText: string, signal: AbortSignal): Promise<Media[]> {
  const query = `
      query ($name: String){
        Page {
          media(search: $name, format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA, MUSIC]) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              medium
            }
            format
            averageScore
            genres
            siteUrl
          }
        }
      }
    `;
  const variables: SearchNameQueryVariables = { name: searchText };

  console.debug("0/1 Fetching SeachName:", searchText);

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
    signal: signal,
  });

  console.debug("1/1 Fetching SeachName:", searchText);

  const json: { data: SearchNameQuery } | { code: string; message: string } = (await response.json()) as
    | { data: SearchNameQuery }
    | { code: string; message: string };

  if (!json || json === undefined || !response.ok || "message" in json) {
    throw new Error(json && json !== undefined && "message" in json ? json.message : response.statusText);
  }

  return json.data?.Page?.media as Media[];
}

export async function performSeasonal(page: number, signal: AbortSignal): Promise<Page> {
  const query = `
      query ($page: Int) {
        Page (page: $page) {
          pageInfo {
            currentPage
            hasNextPage
          }
          media(season: SUMMER, seasonYear: 2022, sort: [SCORE_DESC]) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              medium
            }
            format
            averageScore
            genres
            siteUrl
          }
        }
      }
      `;

  const variables: SeasonalQueryVariables = {
    page: page,
  };

  console.debug("0/1 Fetching Seasonal", variables.page);

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
    signal: signal,
  });

  console.debug("1/1 Fetching Seasonal", variables.page);

  const json: { data: SeasonalQuery } | { code: string; message: string } = (await response.json()) as
    | { data: SeasonalQuery }
    | { code: string; message: string };

  if (!json || json === undefined || !response.ok || "message" in json) {
    throw new Error(json && json !== undefined && "message" in json ? json.message : response.statusText);
  }

  return json.data?.Page as Page;
}
