import { GraphQLClient } from "graphql-request";
import { getSdk } from "../query/media.generated";
import { useState, useEffect } from "react";
import { Media } from "../schema.generated";

const api = getSdk(
  new GraphQLClient("https://graphql.anilist.co", {
    headers: {
      "Content-Type": "Application/json",
    },
  })
);

export const useSearch = (searchText: string | undefined) => {
  const [result, setResult] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (searchText === undefined || !searchText || searchText.trim().length === 0) return;

        setLoading(true);

        console.debug("search:", searchText);

        const query = { name: searchText };

        console.debug("0/1 Fetching", searchText);
        const result = await api.searchName(query);
        console.debug("1/1 Fetching", searchText);

        if (result.Page?.media == null) throw new Error("An error occurred while searching for anime")

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
    })();
  }, [searchText]);

  return {
    result,
    error,
    loading,
  };
};

export const useSeasonPage = () => {
  const [result, setResult] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {

        setLoading(true);

        console.debug("Fetching this season's page");

        let page = 1;
        let hasNextPage = false;

        do {
          console.debug("0/1 Fetching page", page);
          const result = await api.seasonal({ page: page});
          console.debug("1/1 Fetching page", page);

          setResult((prev) => prev.concat(result.Page?.media as Media[]));

          if (result.Page?.pageInfo?.currentPage == null || result.Page?.pageInfo?.hasNextPage == null) throw new Error("An error occurred while searching for anime")

          page = result.Page?.pageInfo?.currentPage + 1
          hasNextPage = result.Page?.pageInfo?.hasNextPage

        } while (hasNextPage)

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
    })();
  }, []);

  return {
    result,
    error,
    loading,
  };
};
