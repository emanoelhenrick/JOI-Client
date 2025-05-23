import { ScrollBarStyled } from "@/components/ScrollBarStyled";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { EpisodeProps, SerieInfoProps } from "electron/core/models/SeriesModels";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Episode } from "./Episode";
import { usePlaylistUrl } from "@/states/usePlaylistUrl";
import { useUserData } from "@/states/useUserData";
import { VlcDialog } from "../VlcDialog";
import electronApi from "@/config/electronApi";
import { formatDurationFromSeconds } from "@/utils/formatDuration";

interface SeasonsListProps {
  seasons: string[]
  currentSeason: string
  setCurrentSeason: (season: string) => void
}

interface EpisodesListProps {
  episodes: EpisodeProps[]
  seriesId: string
  currentSeason: string
  seriesCover: string
  episodeStreamBaseUrl: string
}

interface EpisodesSection {
  seriesId: string
  seriesCover: string
  data: SerieInfoProps
}

export function EpisodesSection({ seriesId, seriesCover, data }: EpisodesSection) {
  const { urls } = usePlaylistUrl()
  const userSeriesData = useUserData(state => state.userData.series?.find(s => s.id == seriesId))

  const seasonsList = useMemo(() => {
    if (!data) return []
    const seasonsList = []
    for (const key in data.episodes) seasonsList.push(key)
    return seasonsList
  }, [data])

  const [currentSeason, setCurrentSeason] = useState(userSeriesData?.season || seasonsList[0])
  const episodes = useMemo(() => {
    if (!data || !data.episodes) return []
    return data.episodes[currentSeason]
  }, [data, currentSeason])

  return (
    <section className="mb-8 space-y-1 mt-2 pb-4 2xl:pb-4">
      {data.episodes ? (
        <div>
          <SeasonsList
            currentSeason={currentSeason}
            seasons={seasonsList}
            setCurrentSeason={setCurrentSeason}
          />
          <EpisodesList
            currentSeason={currentSeason}
            episodeStreamBaseUrl={urls.getSeriesStreamUrl}
            episodes={episodes}
            seriesCover={seriesCover}
            seriesId={seriesId}
          />
        </div>
      ) : <h1 className="text-muted-foreground">Episodes not found</h1>}
    </section>
  )
}

function SeasonsList({ seasons, currentSeason, setCurrentSeason }: SeasonsListProps) {

  return (
    <div>
      <ScrollArea className="w-full pb-4 mb-1">
        <div className="flex gap-2 text-nowrap ml-16 mr-6">
          { seasons && seasons.map(s => (
              <h1 key={s} onClick={() => setCurrentSeason(s)} className={`py-1 hover:opacity-80 font-medium px-5 2xl:px-6 rounded-full transition ease-in-out text-sm 2xl:text-base cursor-pointer ${currentSeason === s ? 'bg-primary/10' : 'text-muted-foreground bg-primary/0'}`}>Season {s}</h1>
          ))}
        </div>
        <ScrollBarStyled orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

function EpisodesList({ episodes, seriesId, currentSeason, seriesCover, episodeStreamBaseUrl}: EpisodesListProps) {
  
  const userEpisodesData = useUserData(state => state.userData.series?.find(s => s.id == seriesId))?.episodes

  const updateSeriesStatus = useUserData(state => state.updateSeriesStatus)
  const updateDefaultSeason = useUserData(state => state.updateSeason)

  const [state, setState] = useState<any>(undefined)
  const [episodeRunning, setEpisodeRunning] = useState<EpisodeProps | undefined>()

  function updateUserStatus(dataState: { length: number, time: number }) {
    if (!episodeRunning) return
    setState({
      id: episodeRunning.id,
      data: dataState
    })
  }

  const updateSeason = (progress: number) => {
    if (progress > 0) updateDefaultSeason(seriesId, currentSeason)
  }

  useEffect(() => {
    if (!episodeRunning && state) {
      const ep = episodes?.find(e => e.id == state.id)
      if (!ep || !state) return
      const { time, length } = state.data
      updateSeriesStatus(
        seriesId,
        parseInt(ep.episode_num),
        currentSeason,
        state.id,
        time,
        length,
        (time / length) > 0
      )
      updateSeason(time / length)
      setState(undefined)
    }
    
  }, [episodeRunning, episodes, updateSeriesStatus])

  const renderItem = useCallback((ep: EpisodeProps, seriesCover: string, index: number) => {
    let progress = 0;
    const epUserData = userEpisodesData?.find(e => e.episodeId == ep.id)
    if (epUserData) progress = parseFloat(((epUserData.currentTime / epUserData.duration) * 100).toFixed(2))
    const currentTime = (epUserData && epUserData.currentTime) ? epUserData.currentTime : 0

    async function launchVlc(episodeId: string, currentTime: number, containerExtension: string) {
      const props = {
        path: `${episodeStreamBaseUrl}${episodeId}.${containerExtension}`,
        startTime: currentTime
      }
      await electronApi.launchVLC(props)
      setEpisodeRunning(ep)
    }

    const duration = formatDurationFromSeconds(ep.info.duration_secs || undefined) 

    return (
      <div key={ep.id} onClick={async () => await launchVlc(ep.id, currentTime, ep.container_extension)}>
          <Episode
            cover={seriesCover}
            imageSrc={ep.info.movie_image!}
            progress={progress}
            episodeNumber={index + 1}
            duration={duration!}
          />
      </div>
    )
  }, [episodes, userEpisodesData])

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-6 2xl:space-x-6 pb-4 whitespace-nowrap mr-6 ml-16">
        {episodes && episodes.map((ep, index) => renderItem(ep, seriesCover, index))}
      </div>
      <ScrollBar orientation={'horizontal'} className="cursor-pointer ml-16 mr-6" />

      {episodeRunning && (
        <VlcDialog
          updateUserStatus={updateUserStatus}
          open={episodeRunning ? true : false}
          closeDialog={() => setEpisodeRunning(undefined)}
        />
      )}
    </ScrollArea>
  )
}