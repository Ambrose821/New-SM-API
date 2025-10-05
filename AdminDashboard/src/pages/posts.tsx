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


export default function Posts(){
const samplePosts: Post[] = [
  {
    headline: 'Merab Dvalishvili Eyes UFC History with 100 Takedowns at UFC 320',
    description: 'Merab Dvalishvili could make history at UFC 320, needing three takedowns to become the first UFC fighter to reach 100 career takedowns. Will this milestone cement his legacy as an all-time great?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605159202/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605159202/post.mp4',
    mediaType: 'Video',
    genre: [ 'sports' ],
    imageAttributions: [
      '"Merab Dvalishvili 2022 (2)" by Onlyfans is licensed under CC BY 3.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/3.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b06e0c0471ec5a9b14',
    sourcedAt: new Date('2025-10-04T19:12:48.470Z'),
  // __v: 0
  },
  {
    headline: "Dave Chappelle finds comedy 'easier' to perform in Saudi Arabia than America",
    description: 'Dave Chappelle claims comedy is "easier" to perform in Saudi Arabia than the United States, citing the Riyadh Comedy Festival as a more suitable venue. Is Saudi Arabia a better place for stand-up comedy than the US?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605160520/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605160520/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Dave Chappelle" by JiBs. is licensed under CC BY 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b56e0c0471ec5a9b16',
    sourcedAt: new Date('2025-10-04T19:12:53.893Z'),
  // __v: 0
  },
  {
    headline: "Trump's former commerce chief labels Epstein 'greatest blackmailer' ever",
    description: "Trump's commerce secretary publicly described Jeffrey Epstein as the 'greatest blackmailer' to ever live. Should public officials comment on serious allegations without formal charges or evidence?",
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605161221/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605161221/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Jeffrey Epstein" by trendingtopics is licensed under CC BY 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b66e0c0471ec5a9b18',
    sourcedAt: new Date('2025-10-04T19:12:54.352Z'),
  // __v: 0
  },
  {
    headline: "Netflix's Ed Gein Series Revives Debate About Brother's Mysterious Death",
    description: `Netflix's "Monster: The Ed Gein Story" spotlights the true crimes of the Wisconsin murderer, renewing public interest in lingering questions, especially regarding his brother. Did Ed Gein truly kill his brother Henry, or was it an accident?`,
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605161632/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605161632/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Ed Gein, The Musical Poster" by ShannonJosephDoyle is licensed under CC BY-SA 4.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b76e0c0471ec5a9b1a',
    sourcedAt: new Date('2025-10-04T19:12:55.154Z'),
  // __v: 0
  },
  {
    headline: 'Journalist Mario Guevara Deported to El Salvador After Covering Georgia Protest',
    description: `Journalist Mario Guevara was deported to El Salvador after being arrested while covering a "No Kings" protest in Georgia. Should covering protests lead to a journalist's deportation?`,
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605160251/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605160251/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"El Salvador Flag" by SipoteSalvadoreño is licensed under CC BY 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b76e0c0471ec5a9b1c',
    sourcedAt: new Date('2025-10-04T19:12:55.523Z'),
  // __v: 0
  },
  {
    headline: "Treasury weighs Trump $1 coin for nation's 250th anniversary celebration.",
    description: "The Treasury Department is considering issuing a Donald Trump $1 coin to commemorate America's 250th birthday. Should public figures be honored on currency before their death?",
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605162227/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605162227/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Donald Trump Signs The Pledge" by Michael Vadon is licensed under CC BY-SA 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171b86e0c0471ec5a9b1e',
    sourcedAt: new Date('2025-10-04T19:12:56.124Z'),
  // __v: 0
  },
  {
    headline: 'Idaho Lottery Winners Check: Mega Millions and Pick 3 Results Revealed Oct 3',
    description: 'Idaho Lottery results for Oct. 3, 2025, are out, allowing players to check winning numbers for games like Mega Millions and Pick 3. Should state lotteries continue given their regressive impact on lower-income groups?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605161341/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605161341/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Museum of Idaho logo" by Jcarr29 is licensed under CC BY-SA 4.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171ba6e0c0471ec5a9b20',
    sourcedAt: new Date('2025-10-04T19:12:58.659Z'),
  // __v: 0
  },
  {
    headline: 'Alito reiterates gay marriage disapproval but calls it Supreme Court precedent',
    description: 'Justice Samuel Alito stated his personal disagreement with the 2015 gay marriage ruling but acknowledged it as established legal precedent. Should personal views of justices influence established legal precedents?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605161411/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605161411/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Samuel Alito - Caricature" by DonkeyHotey is licensed under CC BY 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171be6e0c0471ec5a9b22',
    sourcedAt: new Date('2025-10-04T19:13:02.858Z'),
  // __v: 0
  },
  {
    headline: 'USA Hockey Names Preliminary Roster: Matthews, Tkachuk Lead Charge For 2026 Olympics',
    description: 'USA Hockey unveiled its preliminary roster for the Milano Cortina 2026 Olympics, featuring NHL stars like Auston Matthews and Brady Tkachuk, setting the stage for national hockey hopes. Will this preliminary roster deliver gold for Team USA in 2026?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605161568/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605161568/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Team USA coach" by US Embassy Canada is marked with Public Domain Mark 1.0. To view the terms, visit https://creativecommons.org/publicdomain/mark/1.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171c06e0c0471ec5a9b24',
    sourcedAt: new Date('2025-10-04T19:13:04.030Z'),
  // __v: 0
  },
  {
    headline: "Trump's call for political payback opens door for Democrats to do same",
    description: "Donald Trump's stated desire for political retribution against his opponents creates a precedent for Democrats to pursue similar actions if they gain power, potentially escalating partisan conflict. Will pursuing political vengeance ultimately harm democratic institutions for both parties?",
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605163915/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605163915/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Donald Trump Signs The Pledge" by Michael Vadon is licensed under CC BY-SA 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171c06e0c0471ec5a9b26',
    sourcedAt: new Date('2025-10-04T19:13:04.959Z'),
  // __v: 0
  },
  {
    headline: "WNBA Commissioner Engelbert's inaction leaves players feeling unheard and distrustful.",
    description: 'WNBA commissioner Cathy Engelbert has not taken action to rebuild trust with players, leading to continued dissatisfaction. Should the WNBA commissioner prioritize player trust over other league concerns?',
    thumbnailUrl: 'https://mediaapibucket.s3.amazonaws.com/posts/1759605164856/post.mp4thumbnail',
    videoUrl: 'https://mediaapibucket.s3.us-east-1.amazonaws.com/posts/1759605164856/post.mp4',
    mediaType: 'Video',
    genre: [ 'politics' ],
    imageAttributions: [
      '"Prudential Center, Newark, New Jersey" by Ken Lund is licensed under CC BY-SA 2.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/2.0/.',
      ''
    ],
    videoAttributions: [],
    audioAttributions: [],
    posted: false,
  // _id: '68e171c16e0c0471ec5a9b28',
    sourcedAt: new Date('2025-10-04T19:13:05.086Z'),
  // __v: 0
  }
];

const [searchTerm, setSearchTerm] = useState<string>('');

const [displayedPosts,setDisplayedPosts] = useState<Post[]>(samplePosts)

const [filteredGenres,setFilteredGenres] = useState<Set<string>>(new Set())



const getGenres = (posts: Post[]):Set<string> =>{
  const genreSet: Set<string> = new Set()

  posts.forEach((post)=>{
    const genres = post.genre;
    genres.forEach(genre => {
      genreSet.add(genre)
    });
  })

  return(genreSet)

}

const genres:Set<string> = useMemo(()=>{
  return getGenres(samplePosts)

},[samplePosts])

useEffect(()=>{
  if(searchTerm || filteredGenres.size){
    let searchTerms = searchTerm.toLowerCase().split(/[,.; ]+/)
    let interestedPost = samplePosts.filter((post) => {
      const headline = post.headline.toLowerCase();
      const description = post.description?.toLowerCase() ?? "";

      let textHit;
      if(searchTerm){      
        textHit = searchTerms.some(term =>
          term && (headline.includes(term) || description.includes(term))
        );
      }else{
        textHit = true
      }
      let genreHit;//Default to true if no genres are selected (show all)
      console.log(filteredGenres)
      if(filteredGenres.size>0){
        genreHit = post.genre.some(g => filteredGenres.has(g));
      }else{
        genreHit = true
      }
      return genreHit && textHit

    });
    
    setDisplayedPosts(interestedPost)
  }else{
    setDisplayedPosts(samplePosts)
  }
  
},[searchTerm,filteredGenres])

const toggleGenre = (genre: string,checked : boolean)=>{
  setFilteredGenres(prev=>{
     const next = new Set(prev);
      if (checked) next.add(genre);
      else next.delete(genre);
      return next;
  })
}


  return (
    
    <div className="h-full grid grid-rows-[auto_1fr]">
      
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
                  <Button variant="outline" className="inline-flex items-center gap-2">
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
    </div>
  );

}