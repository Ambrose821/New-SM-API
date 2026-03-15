import type { Post } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface pageProps{
    pages:number,
    limit:number,
    currentPage:number,
    totalPages:number,
    maxDisplayedPages:number,
    onPageChange:(page:number)=>void
}
interface PostCardProps {
    post: Post;
    showTargetSelector?: boolean;
    isSelected?: boolean;
    isPostNowDisabled?: boolean;
    onSelectedChange?: (checked: boolean) => void;
    onPostNow?: () => void;
    onViewFullPost?: () => void;
}

export default function PostCard({
    post,
    showTargetSelector = false,
    isSelected = false,
    isPostNowDisabled = false,
    onSelectedChange,
    onPostNow,
    onViewFullPost,
}: PostCardProps){

    return(
        <>
        <div className="w-full max-w-xs rounded-lg h-160 max-h-160 shadow-sm bg-white min-h-100 grid grid-rows-[1fr_auto_auto_auto_auto] overflow-hidden relative">

            <div className="overflow-hidden">
                <img className ="w-full h-full object-fit rounded-t-lg"src={post.thumbnailUrl ?? undefined}></img>
            </div>
            <div className="text-1xl p-1 font-bold">
                <span className="line-clamp-2">
                       {post.headline}
                </span>
             
            </div>
            <div className="text-xs min-h-8">
                <span className="line-clamp-2">{post.description}</span>
            </div>
            <div className="flex-wrap flex flex-row items-start content-center m-1"> 
                {post.genre.map((genre)=>(
                    <div className="text-xs w-auto m-1 rounded-lg border p-1">{genre}</div>
                ))}
            </div>

            <div className="m-2.5 flex flex-col gap-2">
                {showTargetSelector && (
                    <label className="absolute top-3 right-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => onSelectedChange?.(event.target.checked)}
                            className="sr-only"
                        />
                        <span
                            className={cn(
                                "flex size-4 items-center justify-center rounded-sm border border-gray-400 bg-transparent transition-colors",
                                isSelected && "bg-white"
                            )}
                        >
                            <Check className={cn("size-3 text-black", !isSelected && "invisible")} strokeWidth={3} />
                        </span>
                    </label>
                )}
                <div className="flex flex-row justify-between items-center gap-2">
                    <Button variant="ghost" className="px-0" onClick={onViewFullPost}>
                        Full Post
                    </Button>
                    <Button
                        className={cn(isPostNowDisabled && "bg-gray-300 text-gray-500 hover:bg-gray-300")}
                        disabled={isPostNowDisabled}
                        onClick={onPostNow}
                    >
                        Post Now
                    </Button>
                </div>
            </div>
        </div>
        </>
    );

}
