import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/SelectCategories"
import { Input } from "@/components/ui/input";
import { lazy, LegacyRef, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce';
import { useParams } from "react-router-dom";
import electronApi from '@/config/electronApi';
import { VodProps } from 'electron/core/models/VodModels';
import { useUserData } from '@/states/useUserData';
import { useMeasure } from '@react-hookz/web';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaRegStar, FaStar } from 'react-icons/fa';

const PlaylistScroll = lazy(() => import('./components/PlaylistScroll'))

export function VodDashboard() {
  let { playlistName } = useParams();
  const { data, isFetched } = useQuery({ queryKey: ['vodPlaylist'], queryFn: () => electronApi.getLocalVodPlaylist(playlistName!), staleTime: Infinity })

  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const [playlist, setPlaylist] = useState<VodProps[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all')
  const [enoughItems, setEnoughItems] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [measure, ref] = useMeasure()
  const [page, setPage] = useState(1)

  const [searchText, setSearchValue] = useState('')
  const [search] = useDebounce(searchText, 400)

  const { userData } = useUserData()

  const filtered = useMemo(() => {
    setPage(1)
    if (data) {
      if (currentCategory === 'all') return search.length > 0 ? data!.playlist!.filter(p => p.title.toLowerCase().includes(search.toLowerCase())) : data!.playlist
      return data!.playlist!.filter(p => p.category_id === currentCategory && p.title.toLowerCase().includes(search.toLowerCase()))
    }
    
  }, [search, isFetched, currentCategory])

  const categories = useMemo(() => {
    if (isFetched) return data!.categories
  }, [isFetched])

  function paginate(page: number, elements: number) {
    if (!filtered) return []

    const filtered2 = showFavorites
      ? filtered.filter((p) => {
        for (const vod of userData.vod!) {
          if (vod.favorite && vod.id == p.stream_id) return p 
        }
      }) : filtered

    const startIndex = (page - 1) * elements
    const endIndex = (page * elements) > filtered2.length ? (filtered2.length) : (page * elements)


    if (endIndex === filtered2.length) setHasMore(false)

    const paginated = filtered2.length === 1 ? filtered2 : filtered2.slice(startIndex, endIndex)
    if (playlist.length > 0) return setPlaylist(paginated)
    return setPlaylist(paginated)
  }

  function nextPage() {
    setPage(prev => prev + 1)
  }

  function previousPage() {
    if (page > 1) setPage(prev => prev - 1)
  }

  useEffect(() => {
    if (isFetched) {
      const itemsPerRow = Math.round(window.innerWidth / 185)
      const columns = Math.round((window.innerHeight / 300))
      const itemsPerPage = itemsPerRow * columns

      setEnoughItems(filtered!.length < itemsPerPage)
      setPlaylist([])
      setHasMore(true)
      paginate(page, itemsPerPage)
    }
  }, [search, currentCategory, isFetched, showFavorites, measure, page])

  return (
    <div ref={ref as unknown as LegacyRef<HTMLDivElement>} className="h-screen flex pr-2">
      <div className="flex flex-col w-full py-9 gap-4 ml-20">
        <div className="flex justify-between items-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Movies</h1>
          <div className="flex gap-4 items-center">
            <Input className="w-72 text-xl h-fit" onChange={(e) => setSearchValue(e.target.value)} value={searchText} />
            <Search className="mr-4 opacity-60" />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Select onValueChange={(value) => setCurrentCategory(value)} value={currentCategory}>
              <SelectTrigger  className="w-fit gap-2">
                <SelectValue  placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={'all'}>All</SelectItem>
                  {categories && categories.map(c => <SelectItem value={c.category_id} key={c.category_id}>{c.category_name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            {showFavorites ? (
              <FaStar onClick={() => setShowFavorites(false)} size={22} strokeWidth={0} className={`cursor-pointer fill-yellow-400 ${showFavorites ? 'visible' : 'invisible' }`}  />
            ) : (
              <FaRegStar onClick={() => setShowFavorites(true)} size={22} className={`cursor-pointer opacity-40 group-hover:opacity-100 transition hover:scale-110`}  />
            )} 
          </div>
          {!enoughItems && (
            <div className='mr-4 flex items-center'>
              <div onClick={previousPage} className='cursor-pointer text-muted-foreground hover:text-primary transition'><IoIosArrowBack size={18} /></div>
              <h1 className='px-4 font-bold text-muted-foreground'>{page}</h1>
              <div onClick={nextPage} className={`cursor-pointer text-muted-foreground hover:text-primary transition ${!hasMore && 'invisible'}`}><IoIosArrowForward size={18} /></div>
            </div>
          )}
        </div>
        {playlist.length > 0 &&
          <Suspense fallback={<p>loading...</p>}>
            <PlaylistScroll playlist={playlist} />
          </Suspense>
        }
      </div>
    </div>
  )
}