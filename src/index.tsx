import { List } from "@raycast/api";

import { SearchListItem } from "./components/SearchListItem";
import { useAnilist } from "./lib/anilist";
import { performSearch } from "./lib/services";

export default function Command() {
  const { state, setState, anilist } = useAnilist(async (searchText: string, signal: AbortSignal) => {
    const results = await performSearch(searchText, signal);

    setState((oldState) => ({
      ...oldState,
      results: results,
      isLoading: false,
    }));
  });

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
