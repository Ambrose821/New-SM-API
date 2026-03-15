import { Button } from "@/components/ui/button"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTargetSocial } from "@/hooks/use-target-social"
import type { SocialAccount } from "@/types"
import { useNavigate } from "react-router-dom"

export function SocialCard({social}:{social:SocialAccount}) {
  const Icon = social.icon;
  const navigate = useNavigate()
  const { setSocialAccount } = useTargetSocial()

  const handlePostToAccount = () => {
    setSocialAccount(social)
    navigate("/dashboard/posts")
  }

  return (
    <Card className="mx-auto w-full max-w-xs">
      <Icon className="absolute top-4 right-4" />
      <CardHeader>
        <CardTitle>{social.handle}</CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <Button size="sm" className="w-full">
            Account Info
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={handlePostToAccount}>
          Post to This Account
        </Button>
      </CardFooter>
    </Card>
  )
}
