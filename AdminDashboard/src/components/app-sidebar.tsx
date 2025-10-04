import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SignOutButton, UserButton } from "@clerk/clerk-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
       <UserButton/>

      
        <SignOutButton />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}