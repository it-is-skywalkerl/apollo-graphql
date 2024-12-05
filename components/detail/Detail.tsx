// lib
import { useCallback, useState } from "react";
import { MapPin, Star, Edit, Heart, Trash2 as Trash } from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useMutation, gql } from "@apollo/client";

// components
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DestinationForm } from "@/components/DestinationForm";
import { Tombstone } from "./Tombstone";

// hooks
import { useDestinationByIdQuery } from "@/hooks/useDestinationByIdQuery";

// types
import { Destination } from "@/types";
import { useRouter } from "next/router";
import { useMarkFavoriteMutation } from "@/hooks/useMarkFavoriteMutation";

const UPDATE_DESTINATION = gql`
  mutation UpdateDestination(
    $updateDestinationId: ID!
    $task: DestinationDTO!
  ) {
    updateDestination(id: $updateDestinationId, task: $task)
  }
`;

const DELETE_DESTINATION = gql`
  mutation DeleteDestination($deleteDestinationId: ID!) {
    deleteDestination(id: $deleteDestinationId) {
      id
    }
  }
`;

export function Detail({ id }: { id: string }) {
  const router = useRouter();
  const { destination, loading } = useDestinationByIdQuery({ id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateDestination] = useMutation(UPDATE_DESTINATION, {
    onCompleted: () => {
      toast.success("Destination updated successfully!");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to update destination!");
    },
  });
  const [deleteDestination, { loading: deleteDestinationLoading }] =
    useMutation(DELETE_DESTINATION, {
      onCompleted: () => {
        toast.success("Destination deleted successfully!");
        setIsModalOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete destination!");
      },
    });

  const isFavorite = destination?.favorite;

  const { markFavorite } = useMarkFavoriteMutation({
    markFavoriteId: id,
    value: isFavorite ? false : true,
  });

  const onSubmit = useCallback((_values: Partial<Destination>) => {
    // TODO: call destination mutation here
    updateDestination({
      variables: {
        updateDestinationId: id,
        task: _values,
      },
      optimisticResponse: {
        data: {
          updateDestination: true,
        },
      },
      update: (cache) => {
        const _destinationId = cache.identify({
          id: id,
          __typename: "Destination",
        });
        cache.modify({
          id: _destinationId,
          fields: Object.keys(_values).reduce((acc, key) => {
            acc[key] = () => _values[key];
            return acc;
          }, {}),
        });
      },
    });
    setIsModalOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    // TODO: call destination mutation here
    deleteDestination({
      variables: { deleteDestinationId: id },
      optimisticResponse: {
        data: {
          deleteDestination: {
            id: id,
          },
        },
      },
      update(cache) {
        const cacheId = "ROOT_QUERY";
        cache.evict({ id: cacheId });
        cache.gc();
      },
    });
    if (!deleteDestinationLoading) router.push("/");
  }, []);

  const toggleFavorite = useCallback(() => {
    // TODO: add handling for favorite here
    markFavorite();
  }, []);

  if (loading) {
    return <Tombstone />;
  }

  if (!destination) {
    return <header>No Destination Found</header>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-8 pt-8">
      <header className="relative h-96 w-full max-w-screen-lg">
        <img
          src={`https://picsum.photos/seed/${destination.name}/2000/1000`}
          alt={destination.name}
          className="w-full h-full object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-2xl">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            {destination.name}
          </h1>
          <div className="flex space-x-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DestinationForm
                key={`${isModalOpen}`}
                destination={destination}
                onSubmit={onSubmit}
              />
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white rounded-full"
              onClick={() => toggleFavorite()}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"
                }
              />
            </Button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-screen-lg flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg p-6 mb-8"
        >
          <p className="text-lg mb-4">{destination.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin size={20} />
              <span>{destination.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400" size={20} />
              <span className="font-semibold">
                {destination.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
      <Toaster />
    </div>
  );
}
