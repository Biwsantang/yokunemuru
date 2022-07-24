import { List, Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import { AnimeListItem } from "./components/AnimeListSeason";
import { SearchState, Preferences, animeQuery } from "./utils/utils";
import { fetchAnime, performFetch } from "./services/services";

import { getPreferenceValues } from "@raycast/api";
import moment from "moment";

const preferences = getPreferenceValues<Preferences>();

const cache = new Cache();

export default function animeSeason() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });

  const query = `
  query ($page: Int) {
    Page (page: $page) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media (season: SUMMER, seasonYear: 2022, sort:[SCORE_DESC]) {
        ${animeQuery}
      }
    }
  }
  `;

  useEffect(() => {
    console.debug("Running animeSeason");

    if (cache.has("animeSeason") && moment(JSON.parse(cache.get("animeSeason") as string).date) >= moment()) {
      console.log("use cache from animeSeason");

      setState((prev) => ({
        ...prev,
        results: JSON.parse(cache.get("animeSeason") as string).animeList,
        isLoading: false,
      }));
    } else {
      fetchAnime(setState, query, false, "animeSeason");
    }
  }, []);

  return (
    <List isLoading={state.isLoading}>
      {state.results
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        /*.sort(
          (a, b) => (b.averageScore ? parseInt(b.averageScore) : 0) - (a.averageScore ? parseInt(a.averageScore) : 0)
        )*/
        .map((anime) => (
          <AnimeListItem key={anime.id} anime={anime} preferences={preferences} />
        ))}
    </List>
  );
}
