import type { SocialAccount, InstagramAccount } from "@/types";

import { useEffect, useState } from "react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ChevronDown, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe } from "lucide-react";
import { SocialCard } from "@/components/Socials/SocialCard";
import { useNavigate } from "react-router";
import {AddSocialDialog}from "@/components/Socials/AddSocialDialog"


const platform_icons = {
    "instagram": Instagram,
    "facebook": Facebook,
    "twitter": Twitter,
    "tiktok": Globe, // TikTok doesn't have a lucide icon, using Globe as fallback
    "linkedin": Linkedin,
    "youtube": Youtube,
} as const;

const social_accounts: SocialAccount[] = [
    {
        handle: "test_account_1",
        platform: "instagram",
        icon: platform_icons["instagram"],
        instagramId: "11111"
    } as InstagramAccount,
    {
        handle: "test_account_2",
        platform: "instagram",
        icon: platform_icons.instagram,
        instagramId: "22222"
    } as InstagramAccount,
]



export default function Socials(){

const [searchTerm, setSearchTerm] = useState<string>('');
const [platforms, setPlatforms] = useState<string[]>([])
const [filteredPlatforms,setFilteredPlatforms] = useState<Set<string>>(new Set())
const [displayedSocials, setDisplayedSocials] = useState<SocialAccount[]>([])
const navigate = useNavigate()

const togglePlatforms = (platform: string,checked : boolean)=>{
  setFilteredPlatforms(prev=>{
     const next = new Set(prev);
      if (checked) next.add(platform);
      else next.delete(platform);
      return next;
  })
}
 return (

        <div className="h-full grid grid-rows-[auto_1fr_auto]">
          
          <div className="sticky top-0 bg-white/80 border-b">
            
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
      
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             
                <div className="relative w-full sm:max-w-xl">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </span>
                  <input
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none "
                    type="text"
                    placeholder="Search posts by keywords (headline + description)"
                  />
                </div>
                      
                <div className="flex flex-row gap-7 sm:ml-auto">
                  <AddSocialDialog/>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="inline-flex items-center gap-2 border border-gray-">
                        Platform <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                      {[...platforms].map((platform) => (
                        <DropdownMenuCheckboxItem
                          key={platform}
                          className="capitalize"
                          checked={filteredPlatforms.has(platform)} 
                          onCheckedChange={(v) => togglePlatforms(platform, Boolean(v))}
                        >
                          {platform}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
    
          <div className="overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {social_accounts.map((social) => (
                  <div key={social.handle} className="flex">
                    <SocialCard social={social}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className=" flex flex-row justify-center items-center border-t">
          </div>
        </div>
 )
}
