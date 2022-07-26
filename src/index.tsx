import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useRef, useCallback } from "react";
import fetch, { AbortError } from "node-fetch";
import { Media, Query, Maybe } from "./schema.generated";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Search npm packages..."
      throttle
    >
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map(
          (searchResult) => searchResult && <SearchListItem key={searchResult.id} media={searchResult} />
        )}
      </List.Section>
    </List>
  );
}

function SearchListItem({ media }: { media: Media }) {
  return (
    <List.Item
      title={media.title?.romaji?.toString() ?? "Unknown"}
      subtitle={media.format?.toString()}
      accessoryTitle={media.averageScore?.toString()}
      actions={
        media.siteUrl && (
          <ActionPanel>
            <ActionPanel.Section>
              <Action.OpenInBrowser title="Open in Browser" url={media.siteUrl.toString()} />
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
    />
  );
}

function useSearch() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: false });
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
      }
      catch(error) {
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
    //search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return {
    state: state,
    search: search,
  };
}

async function performSearch(searchText: string, signal: AbortSignal): Promise<Maybe<Media>[]> {
  const query = `
    query ($name: String){
      Page {
        media(search: $name) {
          id
          title {
            romaji
          }
          format
          averageScore
          siteUrl
        }
      }
    }
  `;
  const variables = { name: searchText };

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
    signal: signal
  });

  const json: { data: Maybe<Query> } | { code: string; message: string } = await response.json() as { data: Maybe<Query> } | { code: string; message: string }

  if (!json || json === undefined || !response.ok || "message" in json) {
    throw new Error((json && json !== undefined && "message" in json) ? json.message : response.statusText);
  }

  return json.data?.Page?.media as Maybe<Media>[]
}

interface SearchState {
  results: Maybe<Media>[];
  isLoading: boolean;
}
