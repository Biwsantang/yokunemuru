import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useRef, useCallback } from "react";
import fetch, { AbortError } from "node-fetch";
import { Media, MediaFormat, Query } from "./schema.generated";
import { SearchNameQueryVariables, SearchNameQuery } from "./query/media.generated";

export default function Command() {
  const { state, anilist } = useAnilist((searchText: string, signal: AbortSignal): Promise<Media[]> =>
    performSearch(searchText, signal)
  );

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={anilist}
      searchBarPlaceholder="Search npm packages..."
      throttle
    >
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((result) => (
          <SearchListItem key={result.id} media={result} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ media }: { media: Media }) {
  return (
    <List.Item
      icon={media.coverImage?.medium?.toString() ?? ""}
      title={
        media.title?.english?.toString() ??
        media.title?.romaji?.toString() ??
        media.title?.native?.toString() ??
        "Unknown"
      }
      subtitle={Object.keys(MediaFormat)[Object.values(MediaFormat).indexOf(media.format as MediaFormat)] ?? "-"}
      accessories={(() => {
        const score = [{ text: media.averageScore?.toString().concat("%") ?? "-" }];
        if (!media.genres) return score;
        return media.genres
          .slice(0, 3)
          .map((genre) => ({ text: genre }))
          .concat(score);
      })()}
      actions={
        media.siteUrl && (
          <ActionPanel>
            <ActionPanel.Section>
              <Action.OpenInBrowser title="Open in Browser" url={media.siteUrl.toString() ?? "https://anilist.co"} />
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
    />
  );
}

function useAnilist(perform: CallableFunction) {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: false });
  const cancelRef = useRef<AbortController | null>(null);

  const anilist = useCallback(
    async function anilist(searchText: string) {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        const results = await perform(searchText, cancelRef.current.signal);

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
          console.debug("Abort Fetching SeachName:", searchText);
          return;
        }

        console.error("Error Fetching SeachName:", searchText, error);
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
    anilist: anilist,
  };
}

async function performSearch(searchText: string, signal: AbortSignal): Promise<Media[]> {
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

interface SearchState {
  results: Media[];
  isLoading: boolean;
}
