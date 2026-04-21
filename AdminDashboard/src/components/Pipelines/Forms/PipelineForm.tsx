import { useState, type CSSProperties, type ReactNode } from "react"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import useMediaApiState from "@/hooks/use-media-api-state"

type PostTemplateOption = {
  value: string
  title: string
  description: string
  category: string
  brand?: string
  bgUrl: string
  fgUrl?: string
  caption: ReactNode
  ctaText: string
}



const POST_TEMPLATE_OPTIONS: PostTemplateOption[] = [
  {
    value: "with-foreground",
    title: "With Foreground",
    description: "Foreground avatar, headline text, category pill, brand, and CTA.",
    category: "Finance",
    brand: "BrandA",
    bgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    fgUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    caption: (
      <>
        Turn everyday trends into <b>high-performing posts</b>
      </>
    ),
    ctaText: "READ CAPTION FOR DETAILS",
  },
  {
    value: "no-foreground",
    title: "No Foreground",
    description: "A tighter editorial layout for quick updates and topical posts.",
    category: "News",
    brand: "BrandA",
    bgUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e",
    caption: (
      <>
        What changed today and <b>why it matters</b>
      </>
    ),
    ctaText: "READ CAPTION FOR DETAILS",
  },
]

interface PostTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

function TemplatePreviewCard({
  option,
}: {
  option: PostTemplateOption
  selected: boolean
}) {
  const bgStyle = {
    backgroundImage: `url(${option.bgUrl})`,
  } satisfies CSSProperties

  const fgStyle = {
    backgroundImage: `url(${option.fgUrl})`,
  } satisfies CSSProperties

  return (
    <div className="relative mx-auto aspect-4/5 w-50 overflow-hidden rounded-lg bg-black shadow-sm transition ">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[0.5px] brightness-[0.85]"
        style={bgStyle}
      />
      <div className="absolute top-[8%] left-[8%] rounded-[3px] bg-white px-1 py-0.5 text-[0.38rem] leading-none font-extrabold text-black uppercase sm:text-[0.42rem]">
        {option.category}
      </div>
      <div className="absolute top-[8%] right-[8%] text-[0.38rem] leading-none font-extrabold text-white sm:text-[0.42rem]">
        {option.brand}
      </div>
      {option.fgUrl && (
        <div
          className="absolute top-[16%] right-[8%] aspect-square w-[36%] rounded-full border-2 border-[#f7ffa0] bg-cover bg-center shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
          style={fgStyle}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-linear-to-t from-black/95 via-black/80 to-black/0" />
      <div className="absolute right-[8%] bottom-[22%] left-[8%] text-center font-[Impact] text-[0.62rem] leading-[1.05] font-black text-white uppercase text-shadow-[0_1px_0_rgba(0,0,0,0.7)] sm:text-[0.72rem] [&_b]:text-[#ffeb3b]">
        {option.caption}
      </div>
      <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-white px-1.5 py-0.5 text-[0.34rem] leading-none font-extrabold text-black sm:text-[0.38rem]">
        {option.ctaText}
      </div>
    </div>
  )
}

function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 py-5"
    >
      {POST_TEMPLATE_OPTIONS.map((option) => (
        <FieldLabel
          key={option.value}
          htmlFor={`${option.value}-template`}
          className="w-full cursor-pointer rounded-lg border bg-card p-2 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
        >
          <div className="flex w-full flex-col gap-2">
            <TemplatePreviewCard option={option} selected={value === option.value} />
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value={option.value}
                id={`${option.value}-template`}
                className="mt-0.5 size-3"
              />
              <div className="min-w-0">
                <FieldTitle>{option.title}</FieldTitle>
                <FieldDescription className="">
                  {option.description}
                </FieldDescription>
              </div>
            </div>
          </div>
        </FieldLabel>
      ))}
    </RadioGroup>
  )
}

export default function PipelineForm() {
  const [postType, selectPostType] = useState(POST_TEMPLATE_OPTIONS[0].value)
  const [sourceType, setSourceType] = useState<string>('')
  const [sourceUrl, setSourceURL] = useState<string>('')
  const [bgImageSource, setBgImageSource] = useState<string>('')
  const [fgImageSource, setFgImageSource] = useState<string>('')
  const [languageModel, setLanguageModel] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [genre, setGenre] = useState('')
  const [requiresUrl, setRequiresUrl] = useState<boolean>(false)

  const mediaState = useMediaApiState()  



  const handleSourceTypeChange = (value: string) => {


    const nextSourceType = mediaState?.pipelineOptions.sources.find(
      (option) => option === value
    )
    if(nextSourceType){
      setSourceType(nextSourceType)
      setRequiresUrl(nextSourceType === 'rssApp')

      if (nextSourceType !== 'rssApp') {
        setSourceURL('')
      }
    }
  }
  
  const requiresFgSource = (): boolean => {
    return postType != "no-foreground"
  }

 



  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Post template</FieldLabel>
        <FieldDescription>
          Choose the visual layout that will be used when generated posts are created.
        </FieldDescription>
        <PostTypeSelector value={postType} onChange={selectPostType} />
      </Field>

      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          value = {name}
          placeholder="Pipeline Name"
          onChange={(e) => {setName(e.target.value)}}
          required
        />
      </Field>


      <Field>
        <FieldLabel htmlFor="genre">
          Genre
        </FieldLabel>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger id="genre" className="w-full">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectGroup>
              {
                mediaState?.genres.map((genre) =>(
                  <SelectItem value={genre}>{genre}</SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>
          Select the genre for the posts being created.
          This will affect the genre pill added to the posts
        </FieldDescription>
      </Field>


      <Field>
        <FieldLabel htmlFor="background-image-source">
          Background image source
        </FieldLabel>
        <Select value={bgImageSource} onValueChange={setBgImageSource}>
          <SelectTrigger id="background-image-source" className="w-full">
            <SelectValue placeholder="Background image source" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectGroup>
              {
                mediaState?.pipelineOptions.imageSources.map((source) =>(
                  <SelectItem value={source}>{source}</SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>
          Select the provider used to generate or fetch the main background image.
        </FieldDescription>
      </Field>

      {requiresFgSource() && (
        <Field>
          <FieldLabel htmlFor="foreground-image-source">
            Foreground image source
          </FieldLabel>
          <Select value={fgImageSource} onValueChange={setFgImageSource}>
            <SelectTrigger id="foreground-image-source" className="w-full">
              <SelectValue placeholder="Foreground image source" />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              <SelectGroup>
                {
                mediaState?.pipelineOptions.imageSources.map((source) =>(
                  <SelectItem value={source}>{source}</SelectItem>
                ))
              }
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            Select the provider for the foreground subject shown on templates that support it.
          </FieldDescription>
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="source-type">Source type</FieldLabel>
        <Select value={sourceType} onValueChange={handleSourceTypeChange}>
          <SelectTrigger id="source-type" className="w-full">
            <SelectValue placeholder="Source type" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectGroup>
              {mediaState?.pipelineOptions.sources.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>
          Choose where the pipeline should pull post ideas or source content from.
        </FieldDescription>
      </Field>

      {requiresUrl && (
        <Field>
          <FieldLabel htmlFor="sourceUrl">Source URL</FieldLabel>
          <Input
            id="sourceUrl"
            placeholder="Source URL (eg RSS Feed)"
            value={sourceUrl}
            onChange={(e) => setSourceURL(e.target.value)}
            required
          />
          <FieldDescription>
            Enter the feed or endpoint URL used by the selected source type.
          </FieldDescription>
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="language-model">Language model</FieldLabel>
        <Select value={languageModel} onValueChange={setLanguageModel} required>
          <SelectTrigger id="language-model" className="w-full">
            <SelectValue placeholder="Language model" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectGroup>
              <SelectItem value="geminie-2.5-flash">Gemini 2.5</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>
          Select the model that writes captions, headlines, and supporting post text.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
