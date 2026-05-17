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
import { Check, ChevronDown,Trash } from "lucide-react";
import Paginator from "@/components/Paginator/paginator";
import { getPosts,getGenres,publishPosts, deletePosts } from "@/util/api/posts";
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
const [selectedPostIdsForPublishing, setSelectedPostIdsForPublishing] = useState<Set<string>>(new Set())
const [selectedPostIdsForDeletion, setSelectedPostIdsForDeletion] = useState<Set<string>>(new Set())
const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
const [isPostNowDialogOpen, setIsPostNowDialogOpen] = useState(false)
const [isBulkTargetDialogOpen, setIsBulkTargetDialogOpen] = useState(false)
const [selectedPostingAccountId, setSelectedPostingAccountId] = useState("")
const [selectedTargetAccountId, setSelectedTargetAccountId] = useState("")
const [pendingPost, setPendingPost] = useState<Post | null>(null)
const [fullPost, setFullPost] = useState<Post | null>(null)
const [isConfirmingPostNow, setIsConfirmingPostNow] = useState(false)
const [isConfirmingBulkPost, setIsConfirmingBulkPost] = useState(false)
const [isDeleting, setIsDeleting] = useState<boolean>(false)
const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)

const { socalAccount: targetSocial, setSocialAccount } = useTargetSocial()

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


useEffect(() =>{
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
    setSelectedPostIdsForPublishing(new Set())
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
  const setSelection = isDeleting ? setSelectedPostIdsForDeletion : setSelectedPostIdsForPublishing

  setSelection((previousSelection) => {
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
  if (isDeleting) {
    return
  }

  setPendingPost(post)
  setSelectedPostingAccountId("")
  setIsConfirmingPostNow(false)
  setIsPostNowDialogOpen(true)
}

const handleViewFullPost = (post: Post) => {
  setFullPost(post)
}

const handleConfirmPostNow = async () => {
  if (!pendingPost?._id || !selectedPostingAccountId) {
    return
  }

  const success = await publishPosts([String(pendingPost._id)], selectedPostingAccountId)
  if (!success) {
    toast.error("Failed to queue post for publishing")
    return
  }

  toast.success(`Queued post for ${selectedAccount?.handle}`, {
    description: `"${pendingPost.headline}" was added to the publish queue.`,
  })
  setIsPostNowDialogOpen(false)
  setPendingPost(null)
  setSelectedPostingAccountId("")
  setIsConfirmingPostNow(false)
}

const handleOpenBulkTargetDialog = () => {
  if (isDeleting) {
    return
  }

  setSelectedTargetAccountId(targetSocial?._id ? String(targetSocial._id) : "")
  setIsConfirmingBulkPost(targetSocial !== null && selectedPostIdsForPublishing.size > 0)
  setIsBulkTargetDialogOpen(true)
}

const handleOpenDeleteDialog = () => {
  if (targetSocial) {
    return
  }

  setIsConfirmingDelete(true)
}

const handleClosePostNowDialog = (open: boolean) => {
  setIsPostNowDialogOpen(open)
  if (!open) {
    setPendingPost(null)
    setSelectedPostingAccountId("")
    setIsConfirmingPostNow(false)
  }
}

const handleCloseDeleteConfirmDialog = (open: boolean) => {
  setIsConfirmingDelete(open)
}

const handleCloseBulkTargetDialog = (open: boolean) => {
  setIsBulkTargetDialogOpen(open)
  if (!open) {
    setSelectedTargetAccountId("")
    setIsConfirmingBulkPost(false)
  }
}

const handleContinueToConfirm = () => {
  if (!selectedPostingAccountId) {
    return
  }
  setIsConfirmingPostNow(true)
}

const handleSetTargetSocial = () => {
  if (isDeleting) {
    return
  }

  const selectedTargetAccount = socialAccounts.find(
    (account) => String(account._id) === selectedTargetAccountId
  )

  if (!selectedTargetAccount) {
    return
  }

  setSocialAccount(selectedTargetAccount)
  setSelectedTargetAccountId("")
  setIsConfirmingBulkPost(false)
  setIsBulkTargetDialogOpen(false)
}

const handleConfirmBulkPost = async () => {
  if (isDeleting) {
    return
  }

  const selectedTargetAccount = socialAccounts.find(
    (account) => String(account._id) === selectedTargetAccountId
  ) ?? targetSocial

  if (!selectedTargetAccount?._id || selectedPostIdsForPublishing.size === 0) {
    return
  }

  const success = await publishPosts(Array.from(selectedPostIdsForPublishing), String(selectedTargetAccount._id))
  if (!success) {
    toast.error("Failed to queue selected posts for publishing")
    return
  }

  toast.success(`Queued ${selectedPostIdsForPublishing.size} item(s) for ${selectedTargetAccount.handle}`)
  setIsBulkTargetDialogOpen(false)
  setSelectedTargetAccountId("")
  setIsConfirmingBulkPost(false)
  setSelectedPostIdsForPublishing(new Set())
}

const handleConfirmDeletePosts = async () => {
  if (!isDeleting || targetSocial) {
    return
  }

  const result = await deletePosts(Array.from(selectedPostIdsForDeletion))
  if(result){
    toast("Posts Deleted")
  }
  else{
    toast("Error Deleting Posts")
  }

  setSelectedPostIdsForDeletion(new Set())
  setIsDeleting(false)
  setIsConfirmingDelete(false)
  fetchGenresAndPosts()
}


const handleBulkPostCancel = () => {
  setSelectedPostIdsForPublishing(new Set());
  setSocialAccount(null);
}

const handleSetPostDeleting = () => {
  setSocialAccount(null)
  setSelectedPostIdsForPublishing(new Set())
  setSelectedPostIdsForDeletion(new Set())
  setIsConfirmingBulkPost(false)
  setIsBulkTargetDialogOpen(false)
  setIsConfirmingDelete(false)
  setIsDeleting((current) => !current)
}

const handleSelectDisplayed = (checked: boolean) => {
  if(!checked){
    setSelectedPostIdsForDeletion(new Set())
    return
  }
  const postIds = displayedPosts
    .map((p) => (p._id))
    .filter((id): id is string => typeof id === "string" && id.length>0)

  if(postIds.length> 0){
    setSelectedPostIdsForDeletion(new Set(postIds))
  }
  
}

const selectedAccount = socialAccounts.find(
  (account) => String(account._id) === selectedPostingAccountId
)
const selectedBulkAccount = socialAccounts.find(
  (account) => String(account._id) === selectedTargetAccountId
) ?? targetSocial
const activeSelectedPostIds = isDeleting ? selectedPostIdsForDeletion : selectedPostIdsForPublishing

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
              <Button onClick={handleOpenBulkTargetDialog} disabled={isDeleting}>
                Bulk post
              </Button>}
            
              <Button 
                className="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleSetPostDeleting}
                disabled={targetSocial ? true : false}
              >
               { isDeleting ? <span>Cancel</span> : <Trash/>} 
              </Button>
        

            </div>
          </div>
          {(targetSocial || isDeleting) && 
            <div className="relative mt-4 flex flex-col gap-3 rounded-lg border bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Selecting posts for {targetSocial ? targetSocial.handle : "Deletion"}</p>
                <p className="text-sm font-semibold">({activeSelectedPostIds.size}) post(s)</p>
                
              </div>

              <div className="flex flex-row gap-4 ">
              <Button
                onClick={targetSocial ? handleOpenBulkTargetDialog : handleOpenDeleteDialog}
                disabled={activeSelectedPostIds.size === 0}
              >
               {targetSocial ? "Post Now" : "Delete"} 
              </Button>
              {targetSocial &&
                <Button
                  onClick={handleBulkPostCancel}
                  className="bg-red-700"
                >
                  Cancel
                </Button>
              }
              </div>
            </div>
          
          }
         {isDeleting && <label htmlFor="delete-displayed" className="flex cursor-pointer flex-row items-center gap-4 bg-transparent">
            <span>Select Displayed</span>
            <input
              type="checkbox"
              id="delete-displayed"
              className="peer sr-only"
              onChange={(event) => handleSelectDisplayed(event.target.checked)}
            />
            <span className="flex size-4 items-center justify-center rounded-sm border border-gray-400 bg-transparent transition-colors peer-checked:[&>svg]:visible">
              <Check className="invisible size-3 text-black" strokeWidth={3} />
            </span>
          </label>
         }
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className=" flex items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPosts.map((post) => (
             
              <div key={String(post._id ?? post.headline)} className="flex">
                <PostCard
                  post={post}
                  showTargetSelector={(targetSocial || isDeleting) ? true : false}
                  isSelected={post._id ? activeSelectedPostIds.has(String(post._id)) : false}
                  isPostNowDisabled={(targetSocial || isDeleting) ? true : false}
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

      <Dialog open={isConfirmingDelete} onOpenChange={handleCloseDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-sm">
           <DialogHeader>
            <DialogTitle>Delete these posts</DialogTitle>
            <DialogDescription>
              Are you sure you would like to delete these posts?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleCloseDeleteConfirmDialog(false)
                  }}
                >
                  No
                </Button>
                <Button 
                  className="bg-red-500 text-white"
                  type="button"
                  onClick={handleConfirmDeletePosts}
                >
                  Yes
                </Button>
              </>
          </DialogFooter>
        </DialogContent>

      </Dialog>

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
              <Select value={selectedPostingAccountId} onValueChange={setSelectedPostingAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {socialAccounts.map((account) => (
                      <SelectItem key={String(account._id)} value={String(account._id)}>
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
                  disabled={!selectedPostingAccountId}
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
                ? `Confirm posting ${selectedPostIdsForPublishing.size} selected item(s) to ${selectedBulkAccount?.handle}.`
                : "Choose the account you want to target for bulk posting."}
            </DialogDescription>
          </DialogHeader>
          {!isConfirmingBulkPost ? (
            <div className="py-2">
              <Select value={selectedTargetAccountId} onValueChange={setSelectedTargetAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {socialAccounts.map((account) => (
                      <SelectItem key={`${String(account._id)}-bulk`} value={String(account._id)}>
                        {account.handle}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">
              You are about to post {selectedPostIdsForPublishing.size} selected item(s) to {selectedBulkAccount?.handle}.
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
                  disabled={selectedPostIdsForPublishing.size === 0}
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
                  disabled={!selectedTargetAccountId}
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
