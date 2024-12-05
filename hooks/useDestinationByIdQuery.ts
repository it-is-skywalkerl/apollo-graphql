import { useMemo } from "react";
import { useQuery, gql } from "@apollo/client";

// constants
import { allDestinations } from "./mocks/destinations";

// types
import { Destination } from "@/types";

const GET_DESTINATION_BY_ID = gql`
  query GetDestinationById($id: ID!) {
    getDestinationById(id: $id) {
      description
      favorite
      id
      location
      name
      rating
    }
  }
`;

type Params = {
  id: string;
};

type ReturnType = {
  destination?: Destination;
  loading: boolean;
};

// TODO: use apollo query for this
export const useDestinationByIdQuery = ({ id }: Params): ReturnType => {
  const { loading, data } = useQuery(GET_DESTINATION_BY_ID, {
    variables: { id },
  });

  return {
    destination: data ? data.getDestinationById : undefined,
    loading: loading,
  };
};
