import { Cache, showToast, Toast } from "@raycast/api";
import moment from "moment";
import fetch, { AbortError } from "node-fetch";
import {
  anime,
  mapAnime,
  SearchState,
  responseAnime,
  responseYourAnime,
  pageInfo,
  animeMedia,
  mapMediaList,
} from "../utils/utils";

const cache = new Cache();

export async function fetchAnime(setState: any, query: string, mediaList = false, cacheKey: string): Promise<void> {
  const pagination = {
    animeList: [] as anime[],
    hasNextPage: true as boolean,
    page: 1 as number,
  };

  try {
    do {
      console.debug("Fetching Page:", pagination.page);

      const body: string = JSON.stringify({
        query: query,
        variables: {
          page: pagination.page,
        },
      });

      const [results, pageInfo] = await performFetch(body, mediaList);
      pagination.animeList = pagination.animeList.concat(results);
      pagination.hasNextPage = pageInfo.hasNextPage;

      setState((oldState: SearchState) => ({
        ...oldState,
        results: pagination.animeList,
        isLoading: pagination.hasNextPage,
      }));

      pagination.page += 1;
    } while (pagination.hasNextPage);

    console.debug("Set cache for animeYour");
    cache.set(cacheKey, JSON.stringify({ animeList: pagination.animeList, date: moment().add(1, "minutes") }));
  } catch (error) {
    setState((oldState: SearchState) => ({
      ...oldState,
      isLoading: false,
    }));

    if (error instanceof AbortError) {
      return;
    }

    console.error("search error", error);
    showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
  }
}

export async function performFetch(body: string, mediaList: boolean): Promise<[anime[], pageInfo]> {
  const response = await fetch("https://graphql.anilist.co", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: body,
  });

  if (mediaList) {
    const json = (await response.json()) as responseYourAnime | { code: string; message: string };

    if (!response.ok || "message" in json) {
      throw new Error("message" in json ? json.message : response.statusText);
    }

    return [json.data.Page.mediaList.map((media) => mapMediaList(media)), json.data.Page.pageInfo];
  }

  const json = (await response.json()) as responseAnime | { code: string; message: string };

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return [json.data.Page.media.map((media) => mapAnime(media)), json.data.Page.pageInfo];
}
