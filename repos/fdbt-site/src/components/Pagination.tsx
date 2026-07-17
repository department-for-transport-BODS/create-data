import { ReactElement } from 'react';

interface PaginationProps {
    numberPerPage: number;
    numberOfResults: number;
    currentPage: number;
    link: string;
}

const Pagination = ({ numberPerPage, numberOfResults, currentPage, link }: PaginationProps): ReactElement => {
    const getSummary = (): string => {
        let start = (currentPage - 1) * numberPerPage + 1;
        let end = start + numberPerPage - 1;

        if (end > numberOfResults) {
            end = numberOfResults;
        }

        if (start > numberOfResults) {
            start = numberOfResults;
        }

        return `Showing ${start} - ${end} of ${numberOfResults} results`;
    };

    const numberOfPages = Math.ceil(numberOfResults / numberPerPage);
    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;

    return (
        <nav role="navigation" aria-label="Pagination">
            <div className="pagination__summary">{getSummary()}</div>
            <ul className="pagination govuk-body">
                {previousPage > 0 && (
                    <li className="pagination__item">
                        <a
                            className="pagination__link"
                            href={`${link}?page=${previousPage}`}
                            aria-label="Previous page"
                        >
                            <span aria-hidden="true" role="presentation">
                                &laquo;
                            </span>{' '}
                            Previous
                        </a>
                    </li>
                )}
                {[...Array(numberOfPages)].map((_, i) => (
                    <li className="pagination__item pagination-page" key={i}>
                        <a
                            className={`pagination__link ${currentPage === i + 1 ? 'current' : ''}`}
                            href={`${link}?page=${i + 1}`}
                            aria-current={currentPage === i + 1 ? 'true' : 'false'}
                            aria-label={`Page ${i + 1}${currentPage === i + 1 && ', current page'}`}
                        >
                            {i + 1}
                        </a>
                    </li>
                ))}
                {nextPage <= numberOfPages && (
                    <li className="pagination__item">
                        <a className="pagination__link" href={`${link}?page=${nextPage}`} aria-label="Next page">
                            Next{' '}
                            <span aria-hidden="true" role="presentation">
                                &raquo;
                            </span>
                        </a>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Pagination;
