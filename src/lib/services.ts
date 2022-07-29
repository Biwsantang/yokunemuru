import { GraphQLClient } from "graphql-request";
import { getSdk } from "../query/media.generated";
import { useState, useEffect, useCallback } from "react";
import { Media } from "../schema.generated";
import { Cache, getPreferenceValues } from "@raycast/api";
import { add, compareAsc, parseISO } from "date-fns";

const api = getSdk(
  new GraphQLClient("https://graphql.anilist.co", {
    headers: {
      "Content-Type": "Application/json",
    },
  })
);

interface Preferences {
  nsfw: boolean;
}

const preferences = getPreferenceValues<Preferences>();

const cache = new Cache();

console.debug("Preferences", preferences);

export const useSearch = (searchText: string | undefined) => {
  const [result, setResult] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch();
  }, [searchText]);

  const fetch = async () => {
    try {
      if (searchText === undefined || !searchText || searchText.trim().length === 0) return;

      setLoading(true);

      console.debug("search:", searchText);

      const query = { name: searchText, ...(preferences.nsfw ? {} : { isAdult: false }) };

      console.debug("query", query);

      console.debug("0/1 Fetching", searchText);
      const result = await api.searchName(query);
      console.debug("1/1 Fetching", searchText);

      if (result.Page?.media == null) throw new Error("An error occurred while searching for anime");

      setResult(result.Page?.media as Media[]);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("An error occurred while searching for anime"));
      }
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    result,
    error,
    loading,
  };
};

export const useSeasonPage = () => {
  const [result, setResult] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch()
  }, [])

  const refresh = () => {
    console.debug("Clear cache")
    cache.clear()
    fetch()
  }

  const fetch = async () => {
    try {

      setResult([])

      setLoading(true);

      if (cache.has("seasonPage")) {
        console.debug("Hit cache");
        const seasonPageCache = JSON.parse(cache.get("seasonPage") as string, (key, value) => key == "ttl" ? parseISO(value) : value) as { result: Media[]; ttl: Date };
        if (compareAsc(seasonPageCache.ttl, new Date())) {
          console.debug("Loading from cache");
          console.debug("TTL", seasonPageCache.ttl)
          setResult(seasonPageCache.result);
          return;
        }
      }

      console.debug("Fetching this season's page");

      let page = 1;
      let hasNextPage = false;

      do {
        const query = { page: page, ...(preferences.nsfw ? {} : { isAdult: false }) };

        console.debug("query", query);

        console.debug("0/1 Fetching page", page);
        const result = await api.seasonal(query);
        console.debug("1/1 Fetching page", page);

        setResult((prev) => prev.concat(result.Page?.media as Media[]));

        if (result.Page?.pageInfo?.currentPage == null || result.Page?.pageInfo?.hasNextPage == null)
          throw new Error("An error occurred while searching for anime");

        page = result.Page?.pageInfo?.currentPage + 1;
        hasNextPage = result.Page?.pageInfo?.hasNextPage;

      } while (hasNextPage);

      setResult((result) => {
        console.debug("Set cache");
        console.debug("Cache TTL", add(new Date(), { days: 1 }));
        cache.set("seasonPage", JSON.stringify({ result: result, ttl: add(new Date(), { days: 1 }) }));
        return result
      })

    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("An error occurred while searching for anime"));
      }
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    result,
    error,
    loading,
    refresh
  };
};
