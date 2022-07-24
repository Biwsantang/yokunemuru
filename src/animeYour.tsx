import { List, Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import { AnimeListItem } from "./components/AnimeListSeason";
import { SearchState, Preferences, animeQuery } from "./utils/utils";
import { fetchAnime } from "./services/services";

import { getPreferenceValues } from "@raycast/api";
import { AnimeStatusDropdown } from "./components/AnimeStatusDropdown";

import moment from "moment";

const preferences = getPreferenceValues<Preferences>();

const cache = new Cache();

export default function animeYour() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const animeStatus = [
    { id: 1, name: "All", value: "ALL" },
    { id: 2, name: "Watching", value: "CURRENT" },
    { id: 3, name: "Planning", value: "PLANNING" },
    { id: 4, name: "Completed", value: "COMPLETED" },
    { id: 5, name: "Dropped", value: "DROPPED" },
    { id: 6, name: "PAUSED", value: "REPEATING" },
  ];

  const onAnimeStatusChange = (newValue: string) => {
    setFilterStatus(newValue);
  };

  const query = `
  query ($page: Int) {
    Page (page: $page) {
      pageInfo {
        currentPage
        hasNextPage
      }
      mediaList (userName: "biwsantang", sort: [SCORE_DESC]) {
        status
        progress
        media {
          ${animeQuery}
        }
      }
    }
  }
  `;

  useEffect(() => {
    console.debug("Running animeYour");

    if (cache.has("animeYour") && moment(JSON.parse(cache.get("animeYour") as string).date) >= moment()) {
      console.log("use cache from animeYour");

      setState((prev) => ({
        ...prev,
        results: JSON.parse(cache.get("animeYour") as string).animeList,
        isLoading: false,
      }));
    } else {
      fetchAnime(setState, query, true, "animeYour");
    }
  }, []);

  return (
    <List
      isLoading={state.isLoading}
      searchBarAccessory={<AnimeStatusDropdown animeStatus={animeStatus} onAnimeStatusChange={onAnimeStatusChange} />}
    >
      {state.results
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        .filter((v) => (filterStatus != "ALL" ? v.watchStatus == filterStatus : true))
        .sort(
          (a, b) => (b.averageScore ? parseInt(b.averageScore) : 0) - (a.averageScore ? parseInt(a.averageScore) : 0)
        )
        .map((anime) => (
          <AnimeListItem key={anime.id} anime={anime} filterStatus={filterStatus} preferences={preferences} />
        ))}
    </List>
  );
}
