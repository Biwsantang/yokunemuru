import fetch from "node-fetch";
import { SearchNameQuery, SearchNameQueryVariables } from "../query/media.generated";
import { Media } from "../schema.generated";

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
