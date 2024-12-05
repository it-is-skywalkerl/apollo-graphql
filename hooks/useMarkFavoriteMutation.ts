import { useMutation, gql } from "@apollo/client";
import toast from "react-hot-toast";

const MARK_FAVORITE = gql`
  mutation MarkFavorite($markFavoriteId: ID!, $value: Boolean) {
    markFavorite(id: $markFavoriteId, value: $value)
  }
`;

type Params = {
  markFavoriteId: string;
  value: boolean;
};

type ReturnType = {
  markFavorite: any;
};

export const useMarkFavoriteMutation = ({
  markFavoriteId,
  value,
}: Params): ReturnType => {
  const [markFavorite, { loading, error, data }] = useMutation(MARK_FAVORITE, {
    variables: { markFavoriteId, value },
    optimisticResponse: {
      data: {
        markFavorite: true,
      },
    },
    update: (cache) => {
      const _destinationId = cache.identify({
        id: markFavoriteId,
        __typename: "Destination",
      });
      cache.modify({
        id: _destinationId,
        fields: {
          favorite() {
            return value;
          },
        },
      });
    },
    onCompleted: () => {
      toast.success(value ? "Removed from favorites" : "Added to favorites");
    },
    onError: () => {
      toast.error("An error occurred, please try again");
    },
  });

  return {
    markFavorite: markFavorite,
  };
};
