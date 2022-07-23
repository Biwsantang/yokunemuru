import { List } from "@raycast/api";
import { AnimeListItem } from "./components/AnimeListSearch";
import { useSearch } from "./services/search";

export default function animeList() {
  const { state, search } = useSearch();

  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder="Search anime..." throttle>
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((anime) => (
          <AnimeListItem key={anime.id} anime={anime} />
        ))}
      </List.Section>
    </List>
  );
}
