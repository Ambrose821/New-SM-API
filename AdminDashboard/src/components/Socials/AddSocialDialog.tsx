import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { InstagramForm, type InstagramFormValues } from "./Forms/InstagramForm"
import { createInstagramAccount } from "@/util/api/socials"
import { toast } from "sonner"

const DEFAULT_PLATFORM = "Instagram"

interface AddSocialDialogProps {
  platforms: string[]
}

export function AddSocialDialog({ platforms }: AddSocialDialogProps) {
  const initialPlatform = useMemo(() => {
    if (platforms.includes(DEFAULT_PLATFORM)) return DEFAULT_PLATFORM
    return platforms[0] ?? ""
  }, [platforms])

  const [platform, setPlatform] = useState<string>(initialPlatform)
  const [instagramForm, setInstagramForm] = useState<InstagramFormValues>({
    username: "",
    facebookId: "",
  })

  useEffect(() => {
    if (!platforms.includes(platform)) {
      setPlatform(initialPlatform)
    }
  }, [platform, platforms, initialPlatform])

  const selectedPlatform = platform.toLowerCase()

  const renderPlatformForm = () => {
    switch (selectedPlatform) {
      case "instagram":
        return <InstagramForm value={instagramForm} onChange={setInstagramForm} />
      default:
        return <div>Cannot add this platform yet</div>
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    switch(selectedPlatform) {
      case "instagram":
        try{
          await createInstagramAccount(instagramForm.username,instagramForm.facebookId)
          toast.success("Social Added")
        }catch(error){
          toast.error("Something went wrong adding the account")
        }
      break;
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Socials</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Social Account</DialogTitle>
            <DialogDescription>Add one of your social media accounts</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Platform</FieldLabel>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {platforms.map((platformOption) => (
                      <SelectItem key={platformOption} value={platformOption}>
                        {platformOption}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {renderPlatformForm()}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
