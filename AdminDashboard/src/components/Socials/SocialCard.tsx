import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SocialAccount } from "@/types"

export function SocialCard({social}:{social:SocialAccount}) {
  const Icon = social.icon;

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
        <Button variant="outline" size="sm" className="w-full">
          Post to This Account
        </Button>
      </CardFooter>
    </Card>
  )
}
