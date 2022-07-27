import { List, showToast, Toast } from "@raycast/api";
import { useState } from "react";

import { SearchListItem } from "./components/SearchListItem";
import { useSeasonPage } from "./lib/services";

export default function Command() {
  const [searchText, setSearchText] = useState<string>();
  const { result, loading, error } = useSeasonPage();

  if (error) {
    showToast(Toast.Style.Failure, "Failed fetching Anime", error instanceof Error ? error.message : String(error));
  }

  return (
    <List isLoading={loading} searchBarPlaceholder="Search anime..." throttle>
      <List.Section title="Results" subtitle={result.length + ""}>
        {result.map((result) => (
          <SearchListItem key={result.id} media={result} />
        ))}
      </List.Section>
    </List>
  );
}
