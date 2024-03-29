import { GraphQLClient } from "graphql-request";
import { getSdk, SeasonalQueryVariables } from "../query/media.generated";
import { useState, useEffect, useCallback } from "react";
import { Media, MediaSort } from "../schema.generated";
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
  sortBy: string;
};

const preferences = getPreferenceValues<Preferences>();
console.debug("Preferences", preferences);

const cache = new Cache();

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
  }, []);

  const refresh = () => {
    console.debug("Clear cache")
    cache.clear()
    console.log("Refresh")
    fetch()
  };

  const fetch = async () => {
    try {

      setResult([])
      setLoading(true);

      if (cache.has("seasonPage")) {
        console.debug("Hit cache");
        const seasonPageCache = JSON.parse(cache.get("seasonPage") as string, (key, value) => key == "ttl" ? parseISO(value) : value) as { result: Media[]; ttl: Date };
        if (compareAsc(seasonPageCache.ttl, new Date()) == 1) {
          console.debug("Loading from cache");
          console.debug("TTL", seasonPageCache.ttl)
          setResult(seasonPageCache.result);
          return;
        }
      }

      console.debug("Fetching this season's page");

      const pageQuery = { page: 1, hasNextPage: false }

      do {
        const query: SeasonalQueryVariables = { page: pageQuery.page, ...(preferences.nsfw ? {} : { isAdult: false }), sort: [(<any>MediaSort)[preferences.sortBy]] };

        console.debug("query", query);

        console.debug("0/1 Fetching page", query.page);
        const result = await api.seasonal(query);
        console.debug("1/1 Fetching page", query.page);

        if (result.Page?.pageInfo?.currentPage == null || result.Page?.pageInfo?.hasNextPage == null)
          throw new Error("An error occurred while searching for anime");

        pageQuery.page = result.Page?.pageInfo?.currentPage + 1;
        pageQuery.hasNextPage = result.Page?.pageInfo?.hasNextPage;

        setResult((prev) => {
          const media = prev.concat(result.Page?.media as Media[]);
          console.debug("Show Result", media.length)
          if (!pageQuery.hasNextPage) {
            console.debug("Set cache");
            console.debug("Cache TTL", add(new Date(), { days: 1 }));
            cache.set("seasonPage", JSON.stringify({ result: media, ttl: add(new Date(), { days: 1 }) }));
          }
          return media
        });

      } while (pageQuery.hasNextPage);

    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("An error occurred while searching for anime"));
      }
      setResult([]);
    } finally {
      console.debug("Finish Loading")
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
