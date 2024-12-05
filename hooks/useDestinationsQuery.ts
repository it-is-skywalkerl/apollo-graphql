import { useEffect, useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";

// constants
import { allDestinations } from "./mocks/destinations";

// types
import { Destination } from "@/types";

const GET_DESTINATIONS = gql`
  query destinations($page: Int!, $size: Int!) {
    destinations(page: $page, size: $size) {
      results {
        id
        name
        location
        rating
        description
        favorite
      }
      totalCount
    }
  }
`;

type Params = {
  page: number;
  size?: number;
};

type ReturnType = {
  data?: {
    results: Destination[];
    totalCount: number;
  };
  loading: boolean;
};

const DEFAULT_SIZE = 3;

// TODO: use apollo query for this
export const useDestinationsQuery = ({
  page,
  size = DEFAULT_SIZE,
}: Params): ReturnType => {
  const { loading, data } = useQuery(GET_DESTINATIONS, {
    variables: { page, size },
  });

  return { data: loading ? undefined : data?.destinations, loading };
};
