import { List, ActionPanel, Action } from "@raycast/api";
import { anime } from "../utils/utils";

export function AnimeListItem({ anime }: { anime: anime }) {
  return (
    <List.Item
      title={anime.name}
      icon={{ source: anime.image }}
      subtitle={anime.format}
      accessories={[{ text: anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "" }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={anime.siteUrl} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
