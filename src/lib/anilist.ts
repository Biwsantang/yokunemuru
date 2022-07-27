import { showToast, Toast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useState, useRef, useCallback } from "react";
import { Media } from "../schema.generated";

export function useAnilist(perform: CallableFunction) {
  const [state, setState] = useState<{
    results: Media[];
    isLoading: boolean;
  }>({ results: [], isLoading: false });
  const cancelRef = useRef<AbortController | null>(null);

  const anilist = useCallback(
    async function anilist(variables?: string | number) {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        await perform(variables, cancelRef.current.signal);
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        if (error instanceof AbortError) {
          console.debug("Abort Fetching SeachName:", variables);
          return;
        }

        console.error("Error Fetching SeachName:", variables, error);
        showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
      }
    },
    [cancelRef, setState]
  );

  return {
    state: state,
    setState: setState,
    anilist: anilist,
  };
}
