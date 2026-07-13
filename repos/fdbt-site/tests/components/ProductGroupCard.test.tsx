import { render } from '@testing-library/react';
import ProductGroupCard from '../../src/components/ProductGroupCard';

describe('ProductGroupCard', () => {
    it('should render not checked', () => {
        const { asFragment } = render(
            <ProductGroupCard
                groupDetails={{
                    id: 1,
                    productIds: ['1', '2', '3', '4'],
                    name: 'The capped products',
                }}
                index={0}
                defaultChecked={false}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render checked', () => {
        const { asFragment } = render(
            <ProductGroupCard
                groupDetails={{
                    id: 1,
                    productIds: ['1', '2', '3', '4'],
                    name: 'The capped products',
                }}
                index={0}
                defaultChecked
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render with delete handler', () => {
        const { asFragment } = render(
            <ProductGroupCard
                groupDetails={{
                    id: 1,
                    productIds: ['1', '2', '3', '4'],
                    name: 'The capped products',
                }}
                index={0}
                defaultChecked={false}
                deleteActionHandler={jest.fn()}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
