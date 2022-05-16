import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useRef, useCallback } from "react";
import fetch, { AbortError } from "node-fetch";

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
        {state.results.map((searchResult) => (
          <SearchListItem key={searchResult.id} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.name}
      icon={{ source: searchResult.image}}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={searchResult.siteUrl} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function useSearch() {
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

const query = `
  query ($name: String) {
    Page {
      media(search: $name, type: ANIME) {
        id
        title {
          romaji
        }
        coverImage {
          medium
        }
        averageScore
        siteUrl
      }
    }
  }
`

async function performSearch(searchText: string, signal: AbortSignal): Promise<SearchResult[]> {
  const name = searchText.length === 0 ? "" : searchText;

  const response = await fetch("https://graphql.anilist.co", {
    method: "post",
    body: JSON.stringify({
      query: query,
      variables: {
        name: name
      }
    }),
    headers: {'Content-Type': 'application/json'}
  });

  const json = (await response.json()) as
    | {
        data: {
            Page: {
              media: {
                id: number
                title: {
                  romaji: string;
                };
                coverImage: {
                  medium: string;
                }
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
      siteUrl: media.siteUrl,
    };
  });
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
}

interface SearchResult {
  id: number
  name: string;
  image: string;
  siteUrl: string;
}
