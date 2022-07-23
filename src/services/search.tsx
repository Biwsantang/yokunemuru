import { useEffect, useState, useCallback, useRef } from "react";
import { Toast, showToast } from "@raycast/api";
import { anime, animeFormat, animeSeason, SearchState } from "../utils/utils";
import fetch, { AbortError} from "node-fetch";

const query = `
  query ($name: String) {
    Page {
      media(search: $name, type: ANIME) {
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
        format
        season
        seasonYear
        siteUrl
      }
    }
  }
`;

export async function performSearch(searchText: string, signal: AbortSignal): Promise<anime[]> {
  const name = searchText.length === 0 ? "" : searchText;

  const response = await fetch("https://graphql.anilist.co", {
    method: "post",
    body: JSON.stringify({
      query: query,
      variables: {
        name: name,
      },
    }),
    headers: { "Content-Type": "application/json" },
  });

  const json = (await response.json()) as
    | {
        data: {
          Page: {
            media: {
              id: number;
              title: {
                romaji: string;
                english: string;
                native: string;
              };
              coverImage: {
                medium: string;
                large: string;
              };
              format: string;
              season: string;
              seasonYear: string;
              siteUrl: string;
            }[];
          };
        };
      }
    | { code: string; message: string };

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.data.Page.media.map((media) => {
    return {
      id: media.id,
      name: media.title.romaji,
      image: media.coverImage.medium,
      format: animeFormat[media.format],
      season: animeSeason[media.season],
      seasonYear: media.seasonYear,
      siteUrl: media.siteUrl,
    };
  });
}

export function useSearch() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });
  const cancelRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async function search(searchText: string) {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        const results = await performSearch(searchText, cancelRef.current.signal);
        setState((oldState) => ({
          ...oldState,
          results: results,
          isLoading: false,
        }));
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        if (error instanceof AbortError) {
          return;
        }

        console.error("search error", error);
        showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
      }
    },
    [cancelRef, setState]
  );

  useEffect(() => {
    search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return {
    state: state,
    search: search,
  };
}
