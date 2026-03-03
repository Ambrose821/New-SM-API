import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface InstagramFormValues {
  username: string
  facebookId: string
}

interface InstagramFormProps {
  value: InstagramFormValues
  onChange: (nextValue: InstagramFormValues) => void
}

export function InstagramForm({ value, onChange }: InstagramFormProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input
          id="username"
          placeholder="@username"
          value={value.username}
          onChange={(e) => onChange({ ...value, username: e.target.value })}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="facebookId">Facebook Page ID Linked to the account</FieldLabel>
        <Input
          id="facebookId"
          placeholder="Facebook Page Id"
          value={value.facebookId}
          onChange={(e) => onChange({ ...value, facebookId: e.target.value })}
          required
        />
        <FieldDescription>
          Instagram accounts must be business or creator accounts linked to a Facebook page
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
