import * as Types from "../schema.generated";

export type SearchNameQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars["String"]>;
}>;

export type SearchNameQuery = {
  __typename?: "Query";
  Page?: {
    __typename?: "Page";
    media?: Array<{
      __typename?: "Media";
      id: number;
      format?: Types.MediaFormat | null;
      averageScore?: number | null;
      genres?: Array<string | null> | null;
      siteUrl?: string | null;
      title?: {
        __typename?: "MediaTitle";
        romaji?: string | null;
        english?: string | null;
        native?: string | null;
      } | null;
      coverImage?: { __typename?: "MediaCoverImage"; medium?: string | null } | null;
    } | null> | null;
  } | null;
};

export type SeasonalQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars["Int"]>;
}>;

export type SeasonalQuery = {
  __typename?: "Query";
  Page?: {
    __typename?: "Page";
    pageInfo?: { __typename?: "PageInfo"; currentPage?: number | null; hasNextPage?: boolean | null } | null;
    media?: Array<{
      __typename?: "Media";
      id: number;
      format?: Types.MediaFormat | null;
      averageScore?: number | null;
      genres?: Array<string | null> | null;
      siteUrl?: string | null;
      title?: {
        __typename?: "MediaTitle";
        romaji?: string | null;
        english?: string | null;
        native?: string | null;
      } | null;
      coverImage?: { __typename?: "MediaCoverImage"; medium?: string | null } | null;
    } | null> | null;
  } | null;
};
