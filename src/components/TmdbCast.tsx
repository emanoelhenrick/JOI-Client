import { Cast } from "moviedb-promise";
import { useCallback, useState } from "react";
import { GoPersonFill } from "react-icons/go";

export function TmdbCast({ tmdbCast }: { tmdbCast: Cast[] }) {

  const renderProfile = useCallback((c: Cast) => {
      const [isError, setIsError] = useState(false)
      return (
        <div key={c.profile_path} className="flex gap-3 items-center p-rounded-lg">
          <div className="aspect-square size-10 flex justify-center items-center rounded-full overflow-hidden">
            {!isError ? (
              <img
                key={c.profile_path}
                className="w-full h-full object-cover"
                src={`https://image.tmdb.org/t/p/w45${c.profile_path}`}
                onError={() => setIsError(true)}
                alt=""
              />
            ) : (
              <div className="bg-secondary w-full h-full flex justify-center items-center">
                <GoPersonFill className="size-4" />
              </div>
            )}
          </div>
  
          <div>
            <h1 className="font-medium text-sm 2xl:text-base line-clamp-1">{c.name}</h1>
            <h1 className="text-xs 2xl:text-sm text-muted-foreground line-clamp-1">{c.character}</h1>
          </div>
        </div>
      )
    }, [tmdbCast])

  return (
    <div className="flex gap-8 w-fit">
      {tmdbCast.map(c => renderProfile(c))}
    </div>
  )
}