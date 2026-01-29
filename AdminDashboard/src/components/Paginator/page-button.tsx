
import type React from "react"

interface PageButtonProps{
    page: number | string | React.JSX.Element | React.ReactNode,
    isActivePage: boolean,
    onClick: ()=>void
};
export default function PageButton({page, onClick,isActivePage}:PageButtonProps){   
    return (
        <div onClick={onClick} className={isActivePage?"w-s cursor-pointer rounded-md border border-grey px-5 py-2 bg-black text-white":"w-s rounded-md border border-grey px-5 py-2 cursor-pointer hover:bg-gray-200"}>{page}</div>
    )
}