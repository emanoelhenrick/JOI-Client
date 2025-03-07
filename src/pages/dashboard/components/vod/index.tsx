import electronApi from "@/config/electronApi"
import { usePlaylistUrl } from "@/states/usePlaylistUrl"
import { QueryFilters, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Fade } from "react-awesome-reveal"
import { FaPlay, FaStar } from "react-icons/fa"
import { useUserData } from "@/states/useUserData"
import { Backdrop as BackdropType, MovieDb, } from "moviedb-promise"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { VlcDialog } from "../VlcDialog"
import { ClearDataAlertDialog } from "./ClearDataAlertDialog"
import { InfoSection } from "./InfoSection"
import { ImSpinner8 } from "react-icons/im";
import { formatDurationFromSeconds } from "@/utils/formatDuration"
import { PiPlus, PiCheck } from "react-icons/pi";

interface Props {
  streamId: string
  cover: string
}

export function VodPage({ streamId, cover }: Props) {
  const queryClient = useQueryClient()

  const moviedb = new MovieDb(import.meta.env.VITE_TMDB_API_KEY)

  const [isRunning, setIsRunning] = useState(false)
  const userVodData = useUserData(state => state.userData.vod?.find(v => v.id == streamId))
  const updateVodStatus = useUserData(state => state.updateVodStatus)
  const removeVodStatus = useUserData(state => state.removeVodStatus)
  const updateFavorite = useUserData(state => state.updateFavorite)
  const { data, isSuccess, isFetching } = useQuery({ queryKey: [`vodInfo`], queryFn: async () => await fetchMovieData() })
  const { urls } = usePlaylistUrl()
  const [_refresh, setRefresh] = useState(false)

  const [state, setState] = useState<any>(undefined)
  
  function updateUserStatus(dataState: { length: number, time: number }) {
    if (!isRunning) return
    setState(dataState)
  }

  function handleFavorite() {
    updateFavorite(streamId, 'vod')
    setTimeout(() => setRefresh(p => !p), 100)
  }

  useEffect(() => {
    if (!isRunning && state) {
      if (!state) return
      const { time, length } = state
      updateVodStatus(
        streamId,
        time,
        length,
        time / length < 0.95
      )
      setState(undefined)
    }
  }, [isRunning, updateVodStatus])

  async function fetchMovieData() {
    const vodInfo = await electronApi.getVodInfo(urls.getVodInfoUrl + streamId)
    if (!vodInfo) return
    if (!vodInfo.info) return
    if (vodInfo.info.tmdb_id) {
      const tmdbCast = await moviedb.movieCredits(vodInfo.info.tmdb_id)
      const director = tmdbCast.crew!.find(c => c.job === "Director")
      if (director) vodInfo.info.director = director.name!
      const tmdbImages = await moviedb.movieImages({ id: vodInfo.info.tmdb_id })
      return { ...vodInfo, tmdbImages, tmdbCast: tmdbCast.cast?.slice(0, 3)}
    }
    return vodInfo
  } 

  async function launchVlc() {
    const props = {
      path: `${urls.getVodStreamUrl}${streamId}.${data?.movie_data.container_extension}`,
      startTime: (userVodData && userVodData.currentTime) ? userVodData.currentTime : 0
    }
    await electronApi.launchVLC(props)
    setIsRunning(true)
  }

  useEffect(() => { 
    return () => {
      queryClient.removeQueries({ queryKey: ['vodInfo'], exact: true } as QueryFilters)
    }
  }, [])

  const genres: string[] = useMemo(() => {
    if (data) {
      if (data.info.genre) {
        return data!.info.genre.replaceAll(/^\s+|\s+$/g, "").split(/[^\w\sÀ-ÿ-]/g)
      }
    }
    return []
  }, [isSuccess])

  function getString(str: string) {
    if (!str) return undefined
    const newStr = str.trim()
    if (newStr.length > 1) return newStr
  }

  const cast = data ? data.info.cast : undefined
  const tmdbCast = data ? data.tmdbCast : []
  const director = data ? data.info.director : undefined
  const releaseDate = data ? data.info.releasedate && format(data?.info.releasedate, 'u') :  undefined
  const description = data ? (data.info.description || data.info.plot) : undefined
  const title = data ? getString(data!.info.title)  || getString(data!.movie_data.name) : undefined
  const rating = data ? data.info.rating || data.info.rating_kinopoisk : undefined
  const resumeDuration = formatDurationFromSeconds(userVodData && userVodData.currentTime)
  const duration = formatDurationFromSeconds(data && data.info.duration_secs)

  return (
    <div className="w-screen h-screen flex flex-col justify-end">
      {isFetching ? (
          <div className="w-full h-full fixed flex items-center justify-center top-0 z-20 animate-fade">
            <ImSpinner8 className="size-8 animate-spin text-muted-foreground" />
          </div>
      ) : (
          <Backdrop
            backdrops={data && data.tmdbImages ? data.tmdbImages.backdrops! : []}
            cover={cover}
          />
      )}

        {isSuccess && (
          <div className="p-16 pb-20 z-10 space-y-6">
            <InfoSection
              cast={cast!}
              tmdbCast={tmdbCast!}
              description={description!}
              director={director!}
              genre={genres[0]}
              logos={data && data.tmdbImages ? data.tmdbImages.logos! : []}
              releaseDate={releaseDate!}
              title={title!}
              rating={rating!}
              duration={duration!}
            />
            
            <div className="flex flex-col gap-4 z-10 animate-fade">
              <div className="flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <button key='vlc' disabled={isFetching} onClick={launchVlc} className="transition-none bg-primary/10 hover:bg-primary/20 px-8 py-4 rounded-md text-primary relative overflow-hidden">
                    {userVodData && userVodData.currentTime ?
                    <div className="flex items-center gap-5">
                      <FaPlay className="size-4" />
                      <div className="text-left">
                        <h1 className="leading-none text-base">{`Resume from ${resumeDuration}`}</h1>
                        <span className="text-sm italic text-muted-foreground">{title}</span>
                      </div>
                    </div>
                      : (
                        <div className="flex items-center gap-5">
                          <FaPlay className="size-4" />
                          <div className="text-left">
                            <h1 className="leading-none text-base font-medium">Watch</h1>
                            <span className="text-sm italic text-muted-foreground">{title}</span>
                          </div>
                        </div>
                      )}
                  </button>
                  <button onClick={handleFavorite} disabled={isFetching} className="flex gap-2 items-center p-4 transition rounded-full hover:bg-primary/10 transition-none">
                    {userVodData?.favorite ? <PiCheck className="size-6" /> : <PiPlus className="size-6" />}
                  </button>
                </div>

                {userVodData && <ClearDataAlertDialog removeVodData={() => removeVodStatus(streamId)} refresh={() => setRefresh(p => !p)}  />}
              </div>
            </div>
        </div>
        )}

      {isRunning && (
        <VlcDialog
          updateUserStatus={updateUserStatus}
          open={isRunning}
          closeDialog={() => setIsRunning(false)}
        />
      )}
    </div>
  )
}

function Backdrop({ backdrops, cover }: { backdrops: BackdropType[], cover: string }) {
  let imageSrc = ''
  let filteredByIso = (backdrops && backdrops.length > 0) && backdrops.filter(b => !b.iso_639_1)
  if (filteredByIso && filteredByIso.length > 0) {
    const filteredByWidth = filteredByIso.filter(b => b.width && b.width > 1920)
    if (filteredByWidth.length > 0) {
      imageSrc = `https://image.tmdb.org/t/p/original${filteredByWidth[0].file_path}`
    } else {
      imageSrc = `https://image.tmdb.org/t/p/original${filteredByIso[0].file_path!}`
    } 
  } else {
    imageSrc = cover
  }

  if (!imageSrc.includes('tmdb')) {
    return (
      <div>
        <Fade triggerOnce>
          <img
            className="w-full h-full object-cover fixed top-0 -z-10"
            src={imageSrc}
          />
        </Fade>
        <div className="inset-0 w-full h-full z-10 scale-105 fixed bg-gradient-to-l from-transparent to-background" />
        <div className="inset-0 w-full h-full z-10 scale-105 fixed bg-gradient-to-b from-transparent to-background" />
      </div>
    )
  }

  function getLowImageTmdb() {
    const stringList = imageSrc.split('/')
    return `https://image.tmdb.org/t/p/w1280/${stringList[stringList.length - 1]}`
  }

  function getOriginalImageTmdb() {
    const stringList = imageSrc.split('/')
    return `https://image.tmdb.org/t/p/original/${stringList[stringList.length - 1]}`
  }

  const [imageLoaded, setImageLoaded] = useState(false)

  const lowImage = getLowImageTmdb()
  const highImage = getOriginalImageTmdb()

  return (
    <div>
      <Fade duration={500} triggerOnce>
        <img
          className={`w-full h-full object-cover fixed top-0 -z-20`}
          src={lowImage}
        />
      <LazyLoadImage
        onLoad={() => setImageLoaded(true)}
        src={highImage}
        className={`w-full h-full object-cover fixed top-0 transition -z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </Fade>
      <div className="inset-0 w-full h-full z-10 fixed scale-105 bg-gradient-to-l from-transparent to-background" />
      <div className="inset-0 w-full h-full z-10 fixed scale-105 bg-gradient-to-b from-transparent to-background" />
    </div>
  )

}