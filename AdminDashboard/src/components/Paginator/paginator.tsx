import { useEffect, useState } from "react";
import PageButton from "./page-button";
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
interface pageProps{
    pages:number,
    limit:number,
    maxPagesPerSection:number,
    onPageChange:(page:number)=>void
}

export default function Paginator({pageProps}: {pageProps:pageProps}) {

    const [currentPage, setCurrentPage] = useState(1);
    const [currentSection, setCurrentSection] = useState(Math.ceil(currentPage / pageProps.maxPagesPerSection));
    const [currentSectionFirstPage, setCurrentPageFirstPage] = useState((currentSection - 1) * pageProps.maxPagesPerSection + 1);
    const [activePage, setActivePage] = useState(1);

    const totalPages = Math.ceil(pageProps.pages / pageProps.limit);
    const numSections = Math.ceil(totalPages / pageProps.maxPagesPerSection);

    useEffect(() => {
        setCurrentPage(currentPage);
        setCurrentSection(Math.ceil(currentPage / pageProps.maxPagesPerSection));
        pageProps.onPageChange(currentPage);
        console.log(numSections)
    }, [currentPage]);

    const handleSectionChange = (direction: 'next' | 'prev') => {
        let newSection: number = currentSection;
        if (direction === 'next' && currentSection < numSections) {
            newSection = currentSection + 1;
        } else if (direction === 'prev' && currentSection > 1) {
            newSection = currentSection - 1;
        }
        setCurrentSection(newSection);
        setCurrentPageFirstPage((newSection - 1) * pageProps.maxPagesPerSection + 1);
        setCurrentPage((newSection - 1) * pageProps.maxPagesPerSection + 1);
        pageProps.onPageChange((newSection - 1) * pageProps.maxPagesPerSection + 1);
        setActivePage((newSection - 1) * pageProps.maxPagesPerSection + 1);
    }
    const handlePageChange = (page:number) => {
        setCurrentPage(page);
        setActivePage(page);
        pageProps.onPageChange(page);
    }   
    return (
         <div className="flex flex-row justify-center items-center gap-5 p-4">
            {currentSection > 1 && <PageButton  isActivePage={false} page={<ArrowLeft/>}  onClick={()=>{handleSectionChange('prev')}}/>}
            {Array.from({length:currentSectionFirstPage + pageProps.maxPagesPerSection -1 > totalPages ? totalPages - currentSectionFirstPage +1 : pageProps.maxPagesPerSection},(_,i)=>(
                <PageButton isActivePage={i + currentSectionFirstPage == activePage} onClick={()=>handlePageChange(i + currentSectionFirstPage)} page={i + currentSectionFirstPage}/>
            ))}
            {currentSection < numSections && <PageButton isActivePage={false} onClick={()=>{handleSectionChange('next')}} page={<ArrowRight/>} />}
        </div>
    )

}