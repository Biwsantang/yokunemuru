import * as Types from '../schema.generated';

export type GetMediaQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type GetMediaQuery = { __typename?: 'Query', Media?: { __typename?: 'Media', id: number } | null };
