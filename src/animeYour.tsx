import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { AnimeListItem } from "./components/AnimeListSeason";
import { SearchState, Preferences, animeQuery } from "./utils/utils";
import { fetchAnime, performYourFetch } from "./services/services";

import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();

export default function animeYour() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });

  const query = `
  query {
    Page {
      mediaList (userName: "biwsantang") {
        media {
          ${animeQuery}
        }
      }
    }
  }
  `;

  const body = JSON.stringify({
    query: query,
  });

  useEffect(() => {
    fetchAnime(setState, body, true);
  }, []);

  return (
    <List isLoading={state.isLoading}>
      {state.results
        .sort(
          (a, b) => (b.averageScore ? parseInt(b.averageScore) : 0) - (a.averageScore ? parseInt(a.averageScore) : 0)
        )
        .map((anime) => (
          <AnimeListItem key={anime.id} anime={anime} preferences={preferences} />
        ))}
    </List>
  );
}
