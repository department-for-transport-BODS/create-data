import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ProductCreated, { getServerSideProps } from '../../src/pages/productCreated';
import { getMockContext } from '../testData/mockData';
import {
    FARE_TYPE_ATTRIBUTE,
    INPUT_METHOD_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
} from '../../src/constants/attributes';
import { OperatorAttribute } from '../../src/interfaces';
import { getSessionAttribute } from '../../src/utils/sessions';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('productCreated', () => {
        it('should render correctly for products that are not multi-operator external products', () => {
            const tree = renderToFragment(<ProductCreated csrfToken={'test'} isMultiOperatorExternalProduct={false} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for multi-operator external products', () => {
            const tree = renderToFragment(<ProductCreated csrfToken={'test'} isMultiOperatorExternalProduct={true} />);
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('clears all session data except operator data', () => {
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                cookies: {},
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [FARE_TYPE_ATTRIBUTE]: {
                        fareType: 'single',
                    },
                    [SERVICE_ATTRIBUTE]: {
                        service: 'test',
                    },
                    [INPUT_METHOD_ATTRIBUTE]: {
                        inputMethod: 'csv',
                    },
                },
            });

            getServerSideProps(ctx);

            expect(getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE)).toEqual(operatorData);
            expect(getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE)).toBeUndefined();
            expect(getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE)).toBeUndefined();
            expect(getSessionAttribute(ctx.req, INPUT_METHOD_ATTRIBUTE)).toBeUndefined();
        });
    });
});
