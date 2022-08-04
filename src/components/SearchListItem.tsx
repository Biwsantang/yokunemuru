import { Action, ActionPanel, List } from "@raycast/api";
import { Media, MediaFormat } from "../schema.generated";

export function SearchListItem({ media, refresh }: { media: Media, refresh?: CallableFunction }) {
  return (
    <List.Item
      icon={media.coverImage?.medium?.toString() ?? ""}
      title={
        media.title?.english?.toString() ??
        media.title?.romaji?.toString() ??
        media.title?.native?.toString() ??
        "Unknown"
      }
      subtitle={Object.keys(MediaFormat)[Object.values(MediaFormat).indexOf(media.format as MediaFormat)] ?? "-"}
      accessories={(() => {
        const score = [{ text: media.averageScore?.toString().concat("%") ?? "-" }];
        if (!media.genres) return score;
        return media.genres
          .slice(0, 3)
          .map((genre) => ({ text: genre }))
          .concat(score);
      })()}
      actions={
        media.siteUrl && (
          <ActionPanel>
            <ActionPanel.Section>
              <Action.OpenInBrowser title="Open in Browser" url={media.siteUrl.toString() ?? "https://anilist.co"} />
              {refresh && <Action title="Refresh" onAction={() => refresh()} />}
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
    />
  );
}
