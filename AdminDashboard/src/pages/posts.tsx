import type { Post } from "@/types";
import PostCard from "@/components/post-card";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"; // <-- all from shadcn
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Paginator from "@/components/Paginator/paginator";
import { getPosts,getGenres } from "@/util/api/posts";



export default function Posts(){

const PAGE_LIMIT = 1
const POSTS_PER_PAGE = 12

const [searchTerm, setSearchTerm] = useState<string>('');

const [genres ,setGenres] = useState<string[]>([])

const [pages, setPages] = useState<number>(1)
const [page,setPage] = useState<number>(1)
const [displayedPosts,setDisplayedPosts] = useState<Post[]>([])

const [filteredGenres,setFilteredGenres] = useState<Set<string>>(new Set())


useEffect(() =>{
  const fetchGenresAndPosts = async () => {
    try {
      const filteredGenresArray = Array.from(filteredGenres);
      const genreParam = filteredGenresArray.length > 0 ? filteredGenresArray.join(',') : 'all';
      const genresData = await getGenres();
      const postsData = await getPosts(page, POSTS_PER_PAGE, searchTerm,'sourcedAt',genreParam,'any');
      setGenres(genresData);
      setDisplayedPosts(postsData.posts);
      setPages(Math.ceil(postsData.numberOfPosts/POSTS_PER_PAGE)); 
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };
  fetchGenresAndPosts();
},[searchTerm,filteredGenres,page])



useEffect(()=>{
  
},[])

const toggleGenre = (genre: string,checked : boolean)=>{
  setFilteredGenres(prev=>{
     const next = new Set(prev);
      if (checked) next.add(genre);
      else next.delete(genre);
      return next;
  })
}


  return (
    
    <div className="h-full grid grid-rows-[auto_1fr_auto]">
      
      <div className="sticky top-0 bg-white/80 border-b">
        
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
  
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         
            <div className="relative w-full sm:max-w-xl">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none "
                type="text"
                placeholder="Search posts by keywords (headline + description)"
              />
            </div>

            <div className="sm:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="inline-flex items-center gap-2 border border-gray-">
                    Genre <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                  {[...genres].map((genre) => (
                    <DropdownMenuCheckboxItem
                      key={genre}
                      className="capitalize"
                      checked={filteredGenres.has(genre)} 
                      onCheckedChange={(v) => toggleGenre(genre, Boolean(v))}
                    >
                      {genre}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPosts.map((post) => (
             
              <div key={String(post.headline)} className="flex">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className=" flex flex-row justify-center items-center border-t">
       <Paginator pageProps ={{
        pages:pages,
        limit:PAGE_LIMIT,
        maxPagesPerSection:7,
        onPageChange: (page:number)=>{
         setPage(page);
        }
       }
       }/>
      </div>
    </div>
  );

}