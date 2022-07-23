import { showToast, Toast } from "@raycast/api";
import fetch, { AbortError } from "node-fetch";
import { anime, animeMedia, mapAnime, SearchState } from "../utils/utils";

export async function fetchAnime(setState: any, body: string, mediaList: boolean): Promise<void> {
  try {
    const results = mediaList ? await performYourFetch(body) : await performFetch(body);
    setState((oldState: SearchState) => ({
      ...oldState,
      results: results,
      isLoading: false,
    }));
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

const init = {
  method: "post",
  body: null,
  headers: { "Content-Type": "application/json" },
};

export async function performFetch(body: string): Promise<anime[]> {
  const response = await fetch("https://graphql.anilist.co", {
    ...init,
    body: body,
  });

  const json = (await response.json()) as
    | {
        data: {
          Page: {
            media: animeMedia[];
          };
        };
      }
    | { code: string; message: string };

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.data.Page.media.map((media) => mapAnime(media));
}

export async function performYourFetch(body: string): Promise<anime[]> {
  const response = await fetch("https://graphql.anilist.co", {
    ...init,
    body: body,
  });

  const json = (await response.json()) as
    | {
        data: {
          Page: {
            mediaList: {
              media: animeMedia;
            }[];
          };
        };
      }
    | { code: string; message: string };

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.data.Page.mediaList.map(({ media }) => mapAnime(media));
}
