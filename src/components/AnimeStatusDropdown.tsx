import { List } from "@raycast/api";

export function AnimeStatusDropdown({
  animeStatus,
  onAnimeStatusChange,
}: {
  animeStatus: { id: number; name: string; value: string }[];
  onAnimeStatusChange: (newValue: string) => void;
}) {
  return (
    <List.Dropdown tooltip="Filter Format" storeValue={true} onChange={(newValue) => onAnimeStatusChange(newValue)}>
      <List.Dropdown.Section title="Select Format">
        {animeStatus.map((animeStatusType) => (
          <List.Dropdown.Item key={animeStatusType.id} title={animeStatusType.name} value={animeStatusType.value} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
