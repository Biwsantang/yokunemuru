import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useRef, useCallback } from "react";
import fetch, { AbortError } from "node-fetch";
import { LargeNumberLike } from "crypto";
import { stringify } from "querystring";

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List
      isShowingDetail
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Search anime..."
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
      icon={{ source: searchResult.image }}
      //subtitle={searchResult.format}
      detail={
        <List.Item.Detail
          //markdown={searchResult.bannerImage && `![coverImage](${searchResult.bannerImage})`}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Name" text={searchResult.name} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Type" text={searchResult.type}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Format" text={searchResult.format}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Status" text={searchResult.status}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Start date" text={searchResult.startDate.toString()} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="End date" text={searchResult.endDate.toString()} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Season" text={searchResult.season}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Average Score" text={searchResult.averageScore.toString()}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Mean Score" text={searchResult.meanScore.toString()}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Popularity" text={searchResult.popularity.toString()}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Favourites" text={searchResult.favourites.toString()}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Source" text={searchResult.source}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Hashtag" text={searchResult.hashtag}/>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Genres" />
              {searchResult.genres.map((genre) => (
                <List.Item.Detail.Metadata.Label key={genre} title="" text={genre} />
              ))}
            </List.Item.Detail.Metadata>
          }
        />
      }
      //accessories={[{ text: searchResult.season }]}
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
        studios {
          edges {
            node {
              name
            }
          }
        }
        source
        hashtag
        genres
        siteUrl
      }
    }
  }
`;

async function performSearch(searchText: string, signal: AbortSignal): Promise<SearchResult[]> {
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
              bannerImage: string;
              type: string;
              format: string;
              status: string;
              startDate: {
                year: number;
                month: number;
                day: number;
              }
              endDate: {
                year: number;
                month: number;
                day: number;
              }
              season: string;
              seasonYear: number;
              averageScore: number;
              meanScore: number;
              popularity: number;
              favourites: number;
              studios: {
                edges: [{
                  node: {
                    name: string;
                  }
                }]
              }
              source: string;
              hashtag: string;
              genres: [string];
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
      imageLarge: media.coverImage.large,
      bannerImage: media.bannerImage,
      type: media.type,
      format: media.format,
      status: media.status,
      startDate: media.startDate,
      endDate: media.endDate,
      season: media.season && media.seasonYear ? `${media.season.toLowerCase()} ${media.seasonYear}` : "",
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
  });
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
}

interface SearchResult {
  id: number;
  name: string;
  image: string;
  imageLarge: string;
  bannerImage: string;
  type: string;
  format: string;
  status: string;
  startDate: animeDate;
  endDate: animeDate;
  season: string;
  averageScore: number;
  meanScore: number;
  popularity: number;
  favourites: number;
  //studios: [string];
  source: string;
  hashtag: string;
  genres: [string];
  siteUrl: string;
}

interface animeDate {
  year: number;
  month: number;
  day: number;
}