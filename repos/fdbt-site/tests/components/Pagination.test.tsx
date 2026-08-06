import { render } from '@testing-library/react';
import Pagination from '../../src/components/Pagination';

describe('Pagination', () => {
    it.each([
        [13, 121, 10],
        [1, 5, 10],
        [9, 27, 3],
    ])('should show %s pages, when there are %s results, with %s per page', (expectedPages, numResults, numPerPage) => {
        const { container } = render(
            <Pagination
                currentPage={1}
                link="https://test.example.com"
                numberOfResults={numResults}
                numberPerPage={numPerPage}
            />,
        );

        expect(container.querySelectorAll('.pagination-page')).toHaveLength(expectedPages);
    });

    it('should not show previous button if current page is 1', () => {
        const { container } = render(
            <Pagination currentPage={1} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        expect(container.querySelectorAll('li')[0].textContent).not.toBe('« Previous');
    });

    it('should show previous button if current page is not 1', () => {
        const { container } = render(
            <Pagination currentPage={2} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        expect(container.querySelectorAll('li')[0].textContent).toBe('« Previous');
    });

    it('should show correct previous link', () => {
        const { container } = render(
            <Pagination currentPage={3} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        expect(container.querySelectorAll('a')[0].getAttribute('href')).toBe('https://test.example.com?page=2');
    });

    it('should not show next button if current page is last page', () => {
        const { container } = render(
            <Pagination currentPage={5} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        const listItems = container.querySelectorAll('li');
        expect(listItems[listItems.length - 1].textContent).not.toBe('Next »');
    });

    it('should show next button if current page is not last page', () => {
        const { container } = render(
            <Pagination currentPage={1} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        const listItems = container.querySelectorAll('li');
        expect(listItems[listItems.length - 1].textContent).toBe('Next »');
    });

    it('should show correct next link', () => {
        const { container } = render(
            <Pagination currentPage={3} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        const anchors = container.querySelectorAll('a');
        expect(anchors[anchors.length - 1].getAttribute('href')).toBe('https://test.example.com?page=4');
    });

    it('should mark current page as current', () => {
        const { container } = render(
            <Pagination currentPage={5} link="https://test.example.com" numberOfResults={10} numberPerPage={2} />,
        );

        const currentPages = container.querySelectorAll('.current');
        expect(currentPages[currentPages.length - 1].textContent).toBe('5');
    });
});
