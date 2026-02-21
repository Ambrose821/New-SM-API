import {useState} from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Select, SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem} from '@/components/ui/select'

export function AddSocialDialog() {

  const [alignItemWithTrigger, setAlignItemWithTrigger] = useState(true)
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Add Socials</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Social Account</DialogTitle>
            <DialogDescription>
            Add one of your social media accounts
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
        <Field>
          <FieldLabel>Platform</FieldLabel>
          <Select defaultValue="Instagram">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
              </SelectGroup>
            </SelectContent>
             <FieldLabel>TODO: Conditional input fields based on platform</FieldLabel>
          </Select>
      </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
