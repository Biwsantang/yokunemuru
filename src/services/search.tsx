import { useEffect, useState, useCallback, useRef } from "react";
import { Toast, showToast } from "@raycast/api";
import { anime, SearchState, animeQuery } from "../utils/utils";
import { AbortError } from "node-fetch";
import { performFetch } from "./services";

export function performSearch(searchText: string, signal: AbortSignal): Promise<anime[]> {
  const name = searchText.length === 0 ? "" : searchText;

  const query = `
  query ($name: String) {
    Page {
      media (search: $name, type: ANIME) {
        ${animeQuery}
      }
    }
  }
  `;

  const body = JSON.stringify({
    query: query,
    variables: {
      name: name,
    },
  });

  return performFetch(body);
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
