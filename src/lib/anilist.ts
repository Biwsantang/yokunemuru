import { showToast, Toast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useState, useEffect, useRef, useCallback } from "react";
import { Media } from "../schema.generated";

export function useAnilist(perform: CallableFunction) {
  const [state, setState] = useState<{
    results: Media[];
    isLoading: boolean;
  }>({ results: [], isLoading: false });
  const cancelRef = useRef<AbortController | null>(null);

  const anilist = useCallback(
    async function anilist(searchText: string) {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        const results = await perform(searchText, cancelRef.current.signal);

        setState((oldState) => ({
          ...oldState,
          results: results,
          isLoading: false,
        }));
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        if (error instanceof AbortError) {
          console.debug("Abort Fetching SeachName:", searchText);
          return;
        }

        console.error("Error Fetching SeachName:", searchText, error);
        showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
      }
    },
    [cancelRef, setState]
  );

  useEffect(() => {
    //search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return {
    state: state,
    anilist: anilist,
  };
}
