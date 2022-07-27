import { List } from "@raycast/api";
import { Media } from "./schema.generated";

import { useEffect } from "react";

import { SearchListItem } from "./components/SearchListItem";
import { useAnilist } from "./lib/anilist";
import { performSeasonal } from "./lib/services";

export default function Command() {
  const { state, setState, anilist } = useAnilist(async (_: string, signal: AbortSignal) => {
    const pageInfo = {
      currentPage: 1,
      hasNextPage: true,
    };

    do {
      const results = await performSeasonal(pageInfo?.currentPage ?? 1, signal);

      if (!results.pageInfo || results.pageInfo === undefined || !results.media || results.media === undefined)
        throw new Error("Page not found");

      pageInfo.currentPage = (results.pageInfo.currentPage as number) + 1;
      pageInfo.hasNextPage = results.pageInfo.hasNextPage as boolean;

      setState((oldState) => ({
        ...oldState,
        results: oldState.results.concat(results.media as Media[]),
        isLoading: pageInfo.hasNextPage,
      }));
    } while (pageInfo.hasNextPage);
  });

  useEffect(() => {
    anilist();
  }, []);

  return (
    <List
      isLoading={state.isLoading}
      //onSearchTextChange={anilist}
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
