import * as Types from '../schema.generated';

import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type SearchNameQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type SearchNameQuery = { __typename?: 'Query', Page?: { __typename?: 'Page', media?: Array<{ __typename?: 'Media', id: number, format?: Types.MediaFormat | null, averageScore?: number | null, genres?: Array<string | null> | null, siteUrl?: string | null, title?: { __typename?: 'MediaTitle', romaji?: string | null, english?: string | null, native?: string | null } | null, coverImage?: { __typename?: 'MediaCoverImage', medium?: string | null } | null } | null> | null } | null };

export type SeasonalQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type SeasonalQuery = { __typename?: 'Query', Page?: { __typename?: 'Page', pageInfo?: { __typename?: 'PageInfo', currentPage?: number | null, hasNextPage?: boolean | null } | null, media?: Array<{ __typename?: 'Media', id: number, format?: Types.MediaFormat | null, averageScore?: number | null, genres?: Array<string | null> | null, siteUrl?: string | null, title?: { __typename?: 'MediaTitle', romaji?: string | null, english?: string | null, native?: string | null } | null, coverImage?: { __typename?: 'MediaCoverImage', medium?: string | null } | null } | null> | null } | null };


export const SearchNameDocument = gql`
    query searchName($name: String) {
  Page {
    media(search: $name, format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA, MUSIC]) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
      }
      format
      averageScore
      genres
      siteUrl
    }
  }
}
    `;
export const SeasonalDocument = gql`
    query seasonal($page: Int) {
  Page(page: $page) {
    pageInfo {
      currentPage
      hasNextPage
    }
    media(season: SUMMER, seasonYear: 2022, sort: [SCORE_DESC]) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
      }
      format
      averageScore
      genres
      siteUrl
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    searchName(variables?: SearchNameQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SearchNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SearchNameQuery>(SearchNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'searchName', 'query');
    },
    seasonal(variables?: SeasonalQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SeasonalQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SeasonalQuery>(SeasonalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'seasonal', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;