import type { Post } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FullPostDialogProps {
  open: boolean
  post: Post | null
  onOpenChange: (open: boolean) => void
}

const formatAttributions = (attributions: string[] | null | undefined) => {
  if (!attributions || attributions.length === 0) {
    return "None"
  }

  return attributions.join(", ")
}

export function FullPostDialog({ open, post, onOpenChange }: FullPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-10">
          <DialogTitle className="leading-tight">{post?.headline ?? "Full Post"}</DialogTitle>
          <DialogDescription>
            Review the full post details before taking action.
          </DialogDescription>
        </DialogHeader>
        {post && (
          <div className="space-y-6">
            {post.thumbnailUrl && (
              <div className="overflow-hidden rounded-lg border bg-gray-50">
                <img
                  src={post.thumbnailUrl}
                  alt={String(post.headline)}
                  className="max-h-[26rem] w-full object-contain"
                />
              </div>
            )}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Description</h3>
              <p className="text-sm leading-6 text-gray-700">
                {post.description ?? "No description available."}
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {post.genre.map((genre) => (
                  <span key={genre} className="rounded-md border px-2 py-1 text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            </section>
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Media Type</p>
                <p className="mt-1 text-sm text-gray-700">{post.mediaType}</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sourced At</p>
                <p className="mt-1 text-sm text-gray-700">
                  {new Date(post.sourcedAt).toLocaleString()}
                </p>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Links</h3>
              <div className="space-y-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Image:</span> <a href={post.thumbnailUrl?post.thumbnailUrl:""}>{post.thumbnailUrl}</a></p>
                <p><span className="font-medium text-gray-900">Video:</span> <a href={post.videoUrl?post.videoUrl:""}>{post.videoUrl}</a></p>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Attributions</h3>
              <div className="space-y-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Image:</span> {formatAttributions(post.imageAttributions?.map(String))}</p>
                <p><span className="font-medium text-gray-900">Video:</span> {formatAttributions(post.videoAttributions?.map(String))}</p>
                <p><span className="font-medium text-gray-900">Audio:</span> {formatAttributions(post.audioAttributions?.map(String))}</p>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
