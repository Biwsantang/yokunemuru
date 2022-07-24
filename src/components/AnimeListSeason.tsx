import { List, ActionPanel, Action } from "@raycast/api";
import { anime, Preferences } from "../utils/utils";

export function AnimeListItem({
  anime,
  filterStatus,
  preferences,
}: {
  anime: anime;
  filterStatus: string;
  preferences: Preferences;
}) {
  return (
    <List.Item
      title={anime.name}
      icon={{ source: anime.image }}
      subtitle={anime.format}
      accessories={
        filterStatus == "CURRENT"
          ? [
              { text: `${anime.progress}/${anime.episodes}` },
              { text: anime.averageScore ? (parseInt(anime.averageScore) / 10).toString() : "-" },
            ]
          : [{ text: anime.averageScore ? (parseInt(anime.averageScore) / 10).toString() : "-" }]
      }
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
