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
    const [maxPagesPerSection, setMaxPagesPerSection] = useState(pageProps.maxPagesPerSection);
    const [currentSection, setCurrentSection] = useState(Math.ceil(currentPage / maxPagesPerSection));
    const [currentSectionFirstPage, setCurrentPageFirstPage] = useState((currentSection - 1) * maxPagesPerSection + 1);
    const [activePage, setActivePage] = useState(1);

    const totalPages = Math.ceil(pageProps.pages / pageProps.limit);
    const numSections = Math.ceil(totalPages / maxPagesPerSection);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(max-width: 640px)");
        const update = () => {
            const next = mq.matches ? Math.min(3, pageProps.maxPagesPerSection) : pageProps.maxPagesPerSection;
            setMaxPagesPerSection(next);
        };
        update();
        if (mq.addEventListener) {
            mq.addEventListener("change", update);
            return () => mq.removeEventListener("change", update);
        }
        mq.addListener(update);
        return () => mq.removeListener(update);
    }, [pageProps.maxPagesPerSection]);

    useEffect(() => {
        setCurrentSection(Math.ceil(currentPage / maxPagesPerSection));
        setCurrentPageFirstPage((Math.ceil(currentPage / maxPagesPerSection) - 1) * maxPagesPerSection + 1);
        pageProps.onPageChange(currentPage);
        console.log(numSections)
    }, [currentPage, maxPagesPerSection]);

    const handleSectionChange = (direction: 'next' | 'prev') => {
        let newSection: number = currentSection;
        if (direction === 'next' && currentSection < numSections) {
            newSection = currentSection + 1;
        } else if (direction === 'prev' && currentSection > 1) {
            newSection = currentSection - 1;
        }
        setCurrentSection(newSection);
        setCurrentPageFirstPage((newSection - 1) * maxPagesPerSection + 1);
        setCurrentPage((newSection - 1) * maxPagesPerSection + 1);
        pageProps.onPageChange((newSection - 1) * maxPagesPerSection + 1);
        setActivePage((newSection - 1) * maxPagesPerSection + 1);
    }
    const handlePageChange = (page:number) => {
        setCurrentPage(page);
        setActivePage(page);
        pageProps.onPageChange(page);
    }   
    return (
         <div className="flex flex-row justify-center items-center gap-5 p-4">
            {currentSection > 1 && <PageButton  isActivePage={false} page={<ArrowLeft/>}  onClick={()=>{handleSectionChange('prev')}}/>}
            {Array.from({length:currentSectionFirstPage + maxPagesPerSection -1 > totalPages ? totalPages - currentSectionFirstPage +1 : maxPagesPerSection},(_,i)=>(
                <PageButton isActivePage={i + currentSectionFirstPage == activePage} onClick={()=>handlePageChange(i + currentSectionFirstPage)} page={i + currentSectionFirstPage}/>
            ))}
            {currentSection < numSections && <PageButton isActivePage={false} onClick={()=>{handleSectionChange('next')}} page={<ArrowRight/>} />}
        </div>
    )

}
