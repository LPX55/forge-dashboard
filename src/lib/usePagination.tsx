import { useState, useCallback } from "react";

export interface PaginationContext {
    /**
     * Page index; starts at 0.
     */
    index: number;

    /**
     * Page number; equal to `index + 1`
     */
    page: number;

    /**
     * Maximum value that `index` has taken.
     */
    maxIndex: number;

    /**
     * `maxIndex + 1`
     */
    maxPage: number;

    /**
     * @param page page number to set pagination to (1-indexed)
     * @returns
     */
    set: (page: number) => void;
}

/**
 * Pagination hook where the number of pages is open-ended.
 *
 * @returns hook context
 */
export function usePagination(): PaginationContext {
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1);
    const setPageAndMax: (newPage: number) => void = useCallback((newPage) => {
        setPage(newPage);
        if (newPage > maxPage) {
            setMaxPage(newPage);
        }
    }, [setPage, maxPage, setMaxPage]);

    return {
        index: page - 1,
        page: page,
        maxPage: maxPage,
        maxIndex: maxPage - 1,
        set: setPageAndMax
    }
}
