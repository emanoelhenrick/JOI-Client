import { Fade } from "react-awesome-reveal"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { useMemo, useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon } from '@hugeicons/core-free-icons';

interface Props {
  imageSrc: string
  cover: string
  progress: number
  title: string
  duration: string
  tmdbImage: string
}

export function Episode({ imageSrc, tmdbImage, cover, progress, title, duration }: Props) {

  const [isError, setIsError] = useState(false)

  function getImageTmdb() {
    if (tmdbImage) return `https://image.tmdb.org/t/p/w500${tmdbImage}`
    if (!imageSrc) return
    if (!imageSrc.includes('tmdb')) return imageSrc
    const stringList = imageSrc.split('/')
    return `https://image.tmdb.org/t/p/w185/${stringList[stringList.length - 1]}`
  }

  const finalImage = getImageTmdb()

  const statedCover = useMemo(() => {
    return cover
  }, [])

  return (
    <div className="w-96 cursor-pointer group relative">
      <Fade duration={500} className="z-10">
        <div className="relative group-hover:opacity-80 duration-300 bg-transparent transition ease-out flex items-center aspect-video justify-center overflow-hidden rounded-3xl border border-primary-foreground">
          {
            (finalImage && !isError) ? <LazyLoadImage onError={() => setIsError(true)} src={finalImage} className="w-full h-full group-hover:scale-100 scale-105 duration-300 transition ease-out object-cover opacity-90" />
            : <img src={statedCover} className="object-cover w-full h-full group-hover:scale-100 scale-105 duration-300 transition ease-out opacity-90" />
          }
          <HugeiconsIcon icon={PlayIcon} className="fill-white absolute size-14 z-10 opacity-80" />

          {/* <div className="flex flex-col gap-0 w-full z-10">
            <h1 className="text-sm 2xl:text-base text-primary/50 font-medium">{duration}</h1>
            <h1 className="whitespace-normal text-base font-medium">{title}</h1>
          </div> */}
          
          <div className="inset-0 w-full absolute bg-gradient-to-b from-transparent to-background/95" />

          <div className="absolute flex flex-col w-full bottom-4 z-10 px-6 opacity-90">
            <div className="flex flex-col gap-0 w-full z-10">
              <span className="text-base text-primary/50 font-medium">{duration}</span>
              <h1 className="whitespace-normal text-lg font-medium line-clamp-2">{title}</h1>
            </div>

            {progress > 0 && (
              <div className="relative w-full h-1.5 mt-1">
                <div style={{ width: `${progress}%`}} className="transition absolute z-10 h-full bg-primary rounded-full" />
                <div className="w-full transition h-full absolute bottom-0 bg-primary/10 rounded-full" />
              </div>
            )}
          </div>
        </div>
        {/* <div className="flex flex-col gap-0 w-full mt-2 z-10">
          <h1 className="whitespace-normal text-base font-medium">{title}</h1>
          <h1 className="text-sm 2xl:text-base text-primary/50 font-medium">{duration}</h1>
        </div> */}
          
      </Fade>
    </div>
  )
}