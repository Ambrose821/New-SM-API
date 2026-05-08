import { useState } from "react"
import {
  Activity,
  Bot,
  CalendarClock,
  DatabaseZap,
  Image,
  Layers3,
  Link2,
  PauseCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Pipeline } from "@/types"
import { runPipeline } from "@/util/api/pipeline"
import { toast } from "sonner"

function formatFrequency(frequency: string | null | undefined) {
  if (!frequency) {
    return "Manual"
  }

  return frequency.charAt(0).toUpperCase() + frequency.slice(1)
}

function getSourceHost(sourceUrl: string | null | undefined) {
  if (!sourceUrl) {
    return "No source URL"
  }

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "")
  } catch {
    return sourceUrl
  }
}

function PipelineMetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex truncate min-w-0 items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[0.68rem] leading-none font-medium text-muted-foreground uppercase">
          {label}
        </div>
        <div className="mt-1 truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <div className="text-xs font-medium text-muted-foreground uppercase">{label}</div>
      <div className="min-w-0 break-words text-sm font-medium">{value}</div>
    </div>
  )
}

export function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const [isRunning, setIsRunning] = useState(false)
  const backgroundImageSource = pipeline.backgroundImageSource.strategy
  const foregroundImageSource = pipeline.foregroundImageSource?.strategy ?? "None"
  const llmAgent = pipeline.llm.agent
  const isActive = Boolean(pipeline.isActive)
  const genres = pipeline.genre?.filter(Boolean) ?? []
  const description = pipeline.description || "No description provided."
  const sourceHost = getSourceHost(pipeline.source_url)
  const genreText = genres.length > 0 ? genres.join(", ") : "Untagged"
  const pipelineId = pipeline.id ? String(pipeline.id) : null

  const handleRunPipeline = async () => {
    if (!pipelineId) {
      toast.error("This pipeline cannot be run until it has been saved.")
      return
    }

    setIsRunning(true)
    try {
      const result = await runPipeline(pipelineId)
      toast.success("Pipeline run queued", {
        description: result.jobId ? `Job ID: ${result.jobId}` : result.message,
      })
    } catch {
      toast.error("Could not queue pipeline run")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="h-full overflow-hidden rounded-lg border-slate-200 py-0 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <CardHeader className="gap-3 px-5 pt-5">
        <CardAction>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {isActive ? (
              <PlayCircle className="size-3.5" />
            ) : (
              <PauseCircle className="size-3.5" />
            )}
            {isActive ? "Active" : "Paused"}
          </span>
        </CardAction>

        <div className="flex min-w-0 items-start gap-3 pr-20">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Layers3 className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{pipeline.name}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2 min-h-10">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-2">
          <PipelineMetaItem
            icon={CalendarClock}
            label="Schedule"
            value={formatFrequency(pipeline.frequency)}
          />
          <PipelineMetaItem icon={DatabaseZap} label="Source" value={pipeline.source} />
          <PipelineMetaItem icon={Image} label="Background" value={backgroundImageSource} />
          <PipelineMetaItem icon={Sparkles} label="Foreground" value={foregroundImageSource} />
        </div>

        <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <Bot className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{llmAgent}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link2 className="size-4 shrink-0" />
          <span className="truncate">{sourceHost}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.length > 0 ? (
            genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {genre}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
              untagged
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto gap-2 border-t px-5 py-4">
        <Button
          size="sm"
          className="flex-1 gap-2"
          onClick={handleRunPipeline}
          disabled={isRunning}
        >
          <Activity className="size-4" />
          {isRunning ? "Queueing" : "Run"}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader className="pr-8">
              <DialogTitle className="leading-tight">{pipeline.name}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {isActive ? (
                    <PlayCircle className="size-3.5" />
                  ) : (
                    <PauseCircle className="size-3.5" />
                  )}
                  {isActive ? "Active" : "Paused"}
                </span>
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                    untagged
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Frequency" value={formatFrequency(pipeline.frequency)} />
                <DetailRow label="Source type" value={pipeline.source} />
                <DetailRow label="Source host" value={sourceHost} />
                <DetailRow label="Genres" value={genreText} />
                <DetailRow label="Background" value={backgroundImageSource} />
                <DetailRow label="Foreground" value={foregroundImageSource} />
                <DetailRow label="LLM agent" value={llmAgent} />
                <DetailRow
                  label="Social account"
                  value={pipeline.socialAccountId ? String(pipeline.socialAccountId) : "Global"}
                />
              </div>

              <DetailRow label="Source URL" value={pipeline.source_url || "No source URL"} />
            </div>

            <DialogFooter showCloseButton>
              <Button className="gap-2" onClick={handleRunPipeline} disabled={isRunning}>
                <Activity className="size-4" />
                {isRunning ? "Queueing" : "Run Pipeline"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
