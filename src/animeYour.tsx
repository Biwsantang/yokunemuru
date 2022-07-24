import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { AnimeListItem } from "./components/AnimeListSeason";
import { SearchState, Preferences, animeQuery } from "./utils/utils";
import { fetchAnime } from "./services/services";

import { getPreferenceValues } from "@raycast/api";
import { AnimeStatusDropdown } from "./components/AnimeStatusDropdown";

const preferences = getPreferenceValues<Preferences>();

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
        media {
          ${animeQuery}
        }
      }
    }
  }
  `;

  useEffect(() => {
    console.debug("Running animeYour");

    fetchAnime(setState, query, true);
  }, []);

  return (
    <List
      isLoading={state.isLoading}
      searchBarAccessory={<AnimeStatusDropdown animeStatus={animeStatus} onAnimeStatusChange={onAnimeStatusChange} />}
    >
      {filterStatus == "All" &&
        state.results
          .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
          /*.sort(
          (a, b) => (b.averageScore ? parseInt(b.averageScore) : 0) - (a.averageScore ? parseInt(a.averageScore) : 0)
        )*/
          .map((anime) => <AnimeListItem key={anime.id} anime={anime} preferences={preferences} />)}
      {filterStatus != "All" &&
        state.results
          .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
          .filter((v) => v.status == "RELEASING")
          /*.sort(
          (a, b) => (b.averageScore ? parseInt(b.averageScore) : 0) - (a.averageScore ? parseInt(a.averageScore) : 0)
        )*/
          .map((anime) => <AnimeListItem key={anime.id} anime={anime} preferences={preferences} />)}
    </List>
  );
}
