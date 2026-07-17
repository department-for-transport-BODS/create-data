import { render } from '@testing-library/react';
import ProductRow from '../../src/components/ProductRow';

describe('product row', () => {
    it('renders the right amount of rows for a flatfare carnet', () => {
        const numberToRender = 2;
        const { container, asFragment } = render(
            <ProductRow numberOfProductsToDisplay={numberToRender} errors={[]} userInput={[]} flatFare carnet school />,
        );
        expect(container.querySelectorAll('.flex-container')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });

    it('renders the right amount of rows for a period carnet', () => {
        const numberToRender = 1;
        const { container, asFragment } = render(
            <ProductRow
                numberOfProductsToDisplay={numberToRender}
                errors={[]}
                userInput={[]}
                flatFare={false}
                carnet
                school
            />,
        );
        expect(container.querySelectorAll('.flex-container')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });

    it('renders the right amount of rows for a period ticket', () => {
        const numberToRender = 4;
        const { container, asFragment } = render(
            <ProductRow
                numberOfProductsToDisplay={numberToRender}
                errors={[]}
                userInput={[]}
                flatFare={false}
                carnet={false}
                school={false}
            />,
        );
        expect(container.querySelectorAll('.flex-container')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });

    it('renders the right amount of rows for a flatFare ticket', () => {
        const numberToRender = 3;
        const { container, asFragment } = render(
            <ProductRow
                numberOfProductsToDisplay={numberToRender}
                errors={[]}
                userInput={[]}
                flatFare
                carnet={false}
                school={false}
            />,
        );
        expect(container.querySelectorAll('.flex-container')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });
});
