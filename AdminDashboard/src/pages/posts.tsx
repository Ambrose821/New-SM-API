import type { Post } from "@/types";
import PostCard from "@/components/post-card";
import { FullPostDialog } from "@/components/Posts/FullPostDialog";
import { useEffect, useState } from "react";
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
import { getSocials } from "@/util/api/socials";
import { useTargetSocial } from "@/hooks/use-target-social";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { SocialAccount } from "@/types";



export default function Posts(){

const PAGE_LIMIT = 1
const POSTS_PER_PAGE = 12

const [searchTerm, setSearchTerm] = useState<string>('');

const [genres ,setGenres] = useState<string[]>([])

const [pages, setPages] = useState<number>(1)
const [page,setPage] = useState<number>(1)
const [displayedPosts,setDisplayedPosts] = useState<Post[]>([])

const [filteredGenres,setFilteredGenres] = useState<Set<string>>(new Set())
const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set())
const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
const [isPostNowDialogOpen, setIsPostNowDialogOpen] = useState(false)
const [isBulkTargetDialogOpen, setIsBulkTargetDialogOpen] = useState(false)
const [selectedPostingAccountHandle, setSelectedPostingAccountHandle] = useState("")
const [selectedTargetAccountHandle, setSelectedTargetAccountHandle] = useState("")
const [pendingPost, setPendingPost] = useState<Post | null>(null)
const [fullPost, setFullPost] = useState<Post | null>(null)
const [isConfirmingPostNow, setIsConfirmingPostNow] = useState(false)
const [isConfirmingBulkPost, setIsConfirmingBulkPost] = useState(false)

const { socalAccount: targetSocial, setSocialAccount } = useTargetSocial()



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

useEffect(() => {
  if (!isPostNowDialogOpen && !isBulkTargetDialogOpen) {
    return
  }

  const fetchSocialAccounts = async () => {
    try {
      const socialsData = await getSocials("all", "")
      setSocialAccounts(socialsData)
    } catch (error) {
      console.error("Error fetching socials:", error)
    }
  }

  fetchSocialAccounts()
}, [isBulkTargetDialogOpen, isPostNowDialogOpen])

useEffect(() => {
  if (!targetSocial) {
    console.log("** No target social")
    setSelectedPostIds(new Set())
  }
}, [targetSocial])


const toggleGenre = (genre: string,checked : boolean)=>{
  setFilteredGenres(prev=>{
     const next = new Set(prev);
      if (checked) next.add(genre);
      else next.delete(genre);
      return next;
  })
}

const handleTargetPostSelection = (postId: string, checked: boolean) => {
  setSelectedPostIds((previousSelection) => {
    const nextSelection = new Set(previousSelection)
    if (checked) {
      nextSelection.add(postId)
    } else {
      nextSelection.delete(postId)
    }
    return nextSelection
  })
}

const handlePostNowClick = (post: Post) => {
  setPendingPost(post)
  setSelectedPostingAccountHandle("")
  setIsConfirmingPostNow(false)
  setIsPostNowDialogOpen(true)
}

const handleViewFullPost = (post: Post) => {
  setFullPost(post)
}

const handleConfirmPostNow = () => {
  if (!pendingPost || !selectedPostingAccountHandle) {
    return
  }

  toast.message(`Confirmed post for ${selectedPostingAccountHandle}`, {
    description: `Wire your posting action here for "${pendingPost.headline}".`,
  })
  setIsPostNowDialogOpen(false)
  setPendingPost(null)
  setSelectedPostingAccountHandle("")
  setIsConfirmingPostNow(false)
}

const handleOpenBulkTargetDialog = () => {
  setSelectedTargetAccountHandle(targetSocial?.handle ?? "")
  setIsConfirmingBulkPost(targetSocial !== null)
  setIsBulkTargetDialogOpen(true)
}

const handleClosePostNowDialog = (open: boolean) => {
  setIsPostNowDialogOpen(open)
  if (!open) {
    setPendingPost(null)
    setSelectedPostingAccountHandle("")
    setIsConfirmingPostNow(false)
  }
}

const handleCloseBulkTargetDialog = (open: boolean) => {
  setIsBulkTargetDialogOpen(open)
  if (!open) {
    setSelectedTargetAccountHandle("")
    setIsConfirmingBulkPost(false)
  }
}

const handleContinueToConfirm = () => {
  if (!selectedPostingAccountHandle) {
    return
  }
  setIsConfirmingPostNow(true)
}

const handleSetTargetSocial = () => {
  const selectedTargetAccount = socialAccounts.find(
    (account) => account.handle === selectedTargetAccountHandle
  )

  if (!selectedTargetAccount) {
    return
  }

  setSocialAccount(selectedTargetAccount)
  setIsConfirmingBulkPost(true)
}

const handleConfirmBulkPost = () => {
  const selectedTargetAccount = socialAccounts.find(
    (account) => account.handle === selectedTargetAccountHandle
  ) ?? targetSocial

  if (!selectedTargetAccount || selectedPostIds.size === 0) {
    return
  }

  toast.message(`Ready to post ${selectedPostIds.size} item(s) for ${selectedTargetAccount.handle}`, {
    description: "Wire your batch posting action here.",
  })
  setIsBulkTargetDialogOpen(false)
  setSelectedTargetAccountHandle("")
  setIsConfirmingBulkPost(false)
}

const handleBulkPostCancel = () => {
  setSelectedPostIds(new Set());
  setSocialAccount(null);
}

const selectedAccount = socialAccounts.find(
  (account) => account.handle === selectedPostingAccountHandle
)
const selectedBulkAccount = socialAccounts.find(
  (account) => account.handle === selectedTargetAccountHandle
) ?? targetSocial

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
            <div className="flex flex-n sm:ml-auto gap-4">
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

             {!targetSocial && 
              <Button onClick={handleOpenBulkTargetDialog}>
                Bulk post
              </Button>}
        

            </div>
          </div>
          {targetSocial && 
            <div className="mt-4 flex flex-col gap-3 rounded-lg border bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Selecting posts for {targetSocial.handle}</p>
                <p className="text-sm font-semibold">({selectedPostIds.size}) post(s)</p>
                
                <p className="text-sm text-gray-600">
                  Choose the posts you want to send to this account.
                </p>
              </div>
              <div className="flex flex-row gap-4 ">
              <Button
                onClick={handleOpenBulkTargetDialog}
                disabled={selectedPostIds.size === 0}
              >
                Post selected now
              </Button>
              <Button
                onClick={handleBulkPostCancel}
                className="bg-red-700"
              >
                Cancel
              </Button>
              
              </div>
            </div>
          
          }
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPosts.map((post) => (
             
              <div key={String(post._id ?? post.headline)} className="flex">
                <PostCard
                  post={post}
                  showTargetSelector={targetSocial ? true : false}
                  isSelected={post._id ? selectedPostIds.has(String(post._id)) : false}
                  isPostNowDisabled={targetSocial ? true : false}
                  onSelectedChange={(checked) => {
                    if (!post._id) {
                      return
                    }
                    handleTargetPostSelection(String(post._id), checked)
                  }}
                  onViewFullPost={() => handleViewFullPost(post)}
                  onPostNow={() => handlePostNowClick(post)}
                />
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
      <Dialog open={isPostNowDialogOpen} onOpenChange={handleClosePostNowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Post now</DialogTitle>
            <DialogDescription>
              {!isConfirmingPostNow
                ? "Choose the social account you want to post from."
                : `Confirm posting "${pendingPost?.headline}" to ${selectedAccount?.handle}.`}
            </DialogDescription>
          </DialogHeader>
          {!isConfirmingPostNow ? (
            <div className="py-2">
              <Select value={selectedPostingAccountHandle} onValueChange={setSelectedPostingAccountHandle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {socialAccounts.map((account) => (
                      <SelectItem key={`${account.platform}-${account.handle}`} value={account.handle}>
                        {account.handle}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">
              You are about to post this item to {selectedAccount?.handle}.
            </div>
          )}
          <DialogFooter>
            {isConfirmingPostNow ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmingPostNow(false)}
                >
                  Back
                </Button>
                <Button type="button" onClick={handleConfirmPostNow}>
                  Confirm
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleClosePostNowDialog(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleContinueToConfirm}
                  disabled={!selectedPostingAccountHandle}
                >
                  Continue
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isBulkTargetDialogOpen} onOpenChange={handleCloseBulkTargetDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{isConfirmingBulkPost ? "Post selected now" : "Select account"}</DialogTitle>
            <DialogDescription>
              {isConfirmingBulkPost
                ? `Confirm posting ${selectedPostIds.size} selected item(s) to ${selectedBulkAccount?.handle}.`
                : "Choose the account you want to target for bulk posting."}
            </DialogDescription>
          </DialogHeader>
          {!isConfirmingBulkPost ? (
            <div className="py-2">
              <Select value={selectedTargetAccountHandle} onValueChange={setSelectedTargetAccountHandle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {socialAccounts.map((account) => (
                      <SelectItem key={`${account.platform}-${account.handle}-bulk`} value={account.handle}>
                        {account.handle}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">
              You are about to post {selectedPostIds.size} selected item(s) to {selectedBulkAccount?.handle}.
            </div>
          )}
          <DialogFooter>
            {isConfirmingBulkPost ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (targetSocial) {
                      handleCloseBulkTargetDialog(false)
                      return
                    }
                    setIsConfirmingBulkPost(false)
                  }}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmBulkPost}
                  disabled={selectedPostIds.size === 0}
                >
                  Confirm
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleCloseBulkTargetDialog(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSetTargetSocial}
                  disabled={!selectedTargetAccountHandle}
                >
                  Continue
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FullPostDialog
        open={fullPost !== null}
        post={fullPost}
        onOpenChange={(open) => {
          if (!open) {
            setFullPost(null)
          }
        }}
      />
    </div>
  );

}
