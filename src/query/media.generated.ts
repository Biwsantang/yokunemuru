import * as Types from '../schema.generated';

export type SearchNameQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type SearchNameQuery = { __typename?: 'Query', Page?: { __typename?: 'Page', media?: Array<{ __typename?: 'Media', id: number, format?: Types.MediaFormat | null, averageScore?: number | null, siteUrl?: string | null, title?: { __typename?: 'MediaTitle', romaji?: string | null } | null } | null> | null } | null };
