import { useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, Heart } from "lucide-react";

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// types
import { Destination } from "@/types";
import { useMarkFavoriteMutation } from "@/hooks/useMarkFavoriteMutation";

export const DestinationCard = ({
  destination,
}: {
  destination: Destination;
}) => {
  const { id, name, favorite, location, rating } = destination;
  const { markFavorite } = useMarkFavoriteMutation({
    markFavoriteId: id,
    value: favorite ? false : true,
  });
  const toggleFavorite = useCallback(() => {
    markFavorite();
  }, [favorite]);

  return (
    <Link key={id} href={`/destination/${id}`}>
      <Card className="overflow-hidden p-2">
        <div className="relative">
          <img
            src={`https://picsum.photos/seed/${name}/600/700`}
            alt={name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white rounded-full"
            onClick={toggleFavorite}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={
                favorite ? "text-red-500 fill-red-500" : "text-gray-500"
              }
            />
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Star className="text-yellow-400" size={16} />
            <span className="ml-1 text-sm font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
