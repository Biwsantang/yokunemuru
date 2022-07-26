import { List } from "@raycast/api";
import { Media } from "./schema.generated";

import { SearchListItem } from "./components/SearchListItem";
import { useAnilist } from "./lib/anilist";
import { performSearch } from "./lib/services";

export default function Command() {
  const { state, anilist } = useAnilist(
    (searchText: string, signal: AbortSignal): Promise<Media[]> => performSearch(searchText, signal)
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
