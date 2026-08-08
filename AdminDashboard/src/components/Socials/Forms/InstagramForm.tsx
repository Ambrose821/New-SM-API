import { Button } from "@/components/ui/button"
import {
  Field,

  FieldGroup,
} from "@/components/ui/field"

import { Instagram} from "lucide-react"
import { Link } from "react-router-dom"

import instagram from "../../../util/instagram/instagram"


export function InstagramForm() {
  

  return (
    <FieldGroup>
      <Field>
      <Link to={instagram.SIGNIN_EMBED_URL}>
       <Button 
          className="bg-[#E1306C] hover:bg-[#C13584] text-white my-2" type ="button">
        <Instagram className="mr-2 h-4 w-4" /> Connect Instagram
      </Button>
        </Link>
      </Field>
    </FieldGroup>
  )
}
