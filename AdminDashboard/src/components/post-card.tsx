import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }){

    return(
        <>
        <div className="w-full max-w-xs rounded-lg h-160 max-h-160 shadow-sm bg-white min-h-100 grid grid-rows-[1fr_auto_auto_auto_auto] overflow-hidden">

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
            <div className=" flex-wrap flex flex-row items-start content-center"> 
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