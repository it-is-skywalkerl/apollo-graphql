//libs
import { Plus, Server } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { gql, useLazyQuery, useMutation } from "@apollo/client";

// components
import { DestinationForm } from "@/components/DestinationForm";
import { Button } from "@/components/ui/button";

// types
import { Destination } from "@/types";
import { useRouter } from "next/navigation";

const ADD_DESTINATION = gql`
  mutation createDestination($task: DestinationDTO!) {
    createDestination(task: $task)
  }
`;
const GET_DESTINATIONS_COUNT = gql`
  query Destinations($page: Int!, $size: Int!) {
    destinations(page: $page, size: $size) {
      totalCount
    }
  }
`;

export const Header = (): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addDestination, { data, loading, error }] =
    useMutation(ADD_DESTINATION);
  const [
    getDestinationsCount,
    { data: destinationsData, loading: destinationsLoading },
  ] = useLazyQuery(GET_DESTINATIONS_COUNT);
  const router = useRouter();

  const onSubmit = async (_values: Partial<Destination>) => {
    // TODO: call destination mutation here and redirect to it's page
    await addDestination({
      variables: {
        task: {
          description: _values.description,
          location: _values.location,
          name: _values.name,
          rating: _values.rating,
        },
      },
      onCompleted: async () => {
        toast.success("Destination added");
        const destinationsData = await getDestinationsCount({
          variables: { page: 1, size: 1 },
        });
        router.push(`/destination/${destinationsData.data.destinations.totalCount}`);
      },
      onError: (error) => {
        toast.error("Could not add destination, please try again");
        console.error(error);
      },
    });
  };

  return (
    <div className="flex gap-4 items-center p-5 bg-white rounded-2xl justify-between border">
      <Link href="/">
        <h1 className="flex-1 text-2xl font-semibold">Trip Finder 🚗</h1>
      </Link>
      <div className="flex gap-2 items-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DestinationForm key={`${isModalOpen}`} onSubmit={onSubmit} />
        </Dialog>
        <Button asChild>
          <a href="http://localhost:4000/" target="_blank">
            <Server />
            Open Server
          </a>
        </Button>
      </div>
    </div>
  );
};
