import { GraphQLClient } from "graphql-request";
import { getSdk } from "../query/media.generated";
import { useState, useEffect, useRef } from "react";
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
    async function fetch() {

      try {

        if (searchText === undefined || !searchText || searchText.trim().length === 0) return;

        setLoading(true);

        console.debug("search:", searchText);

        const query = { name: searchText };

        console.debug("0/1 Fetching", searchText)
        const result = await api.searchName(query);
        console.debug("1/1 Fetching", searchText)

        setResult(result.Page?.media as Media[])

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
    fetch();
  }, [searchText]);

  return {
    result,
    error,
    loading,
  };

}