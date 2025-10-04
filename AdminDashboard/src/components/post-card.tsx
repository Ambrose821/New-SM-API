import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }){

    return(
        <>
        <div className="max-w-sm rounded-lg shadow-sm bg-white min-h-100 grid grid-rows overflow-hidden ">

            <div className="w-full h-full overflow-hidden">
                <img className =" rounded-t-lg"src={post.thumbnailUrl ?? undefined}></img>
            </div>
            <div className="text-1xl p-1">
                {post.headline}
            </div>
            <div className = "text-xs min-h-8">
                <span className="truncate">{post.description}</span>
            </div>
            <div className=" flex-wrap flex flex-row"> 
                {post.genre.map((genre)=>(
                    <div className="text-xs w-auto m-1 rounded-lg border">{genre}</div>
                ))}
            </div>
            <div className="=2">
                <button>Full Post</button>
            </div>

        </div>
        </>
    );

}