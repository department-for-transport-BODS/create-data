import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { getMockContext } from '../testData/mockData';
import ProductDateInfo, { getServerSideProps } from '../../src/pages/productDateInformation';
import { ErrorInfo } from '../../src/interfaces';
import { PRODUCT_DATE_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('productDateInformation', () => {
        it('should render the product date information page upon first landing', () => {
            const wrapper = renderToFragment(
                <ProductDateInfo
                    startDateErrors={[]}
                    endDateErrors={[]}
                    inputs={{
                        startDateDay: '',
                        startDateMonth: '',
                        startDateYear: '',
                        endDateDay: '',
                        endDateMonth: '',
                        endDateYear: '',
                    }}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        it('should render start date errors correctly when start date errors are passed to the page', () => {
            const wrapper = renderToFragment(
                <ProductDateInfo
                    startDateErrors={[{ errorMessage: 'Start date must be a real date', id: 'start-day-input' }]}
                    endDateErrors={[]}
                    inputs={{
                        startDateDay: 'first',
                        startDateMonth: 'august',
                        startDateYear: '2020',
                        endDateDay: '',
                        endDateMonth: '',
                        endDateYear: '',
                    }}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render end date errors correctly when end date errors are passed to the page', () => {
            const wrapper = renderToFragment(
                <ProductDateInfo
                    startDateErrors={[]}
                    endDateErrors={[
                        {
                            id: 'end-year-input',
                            errorMessage: 'End date year has an invalid character',
                        },
                    ]}
                    inputs={{
                        startDateDay: '01',
                        startDateMonth: '01',
                        startDateYear: '2020',
                        endDateDay: '01',
                        endDateMonth: '01',
                        endDateYear: '20.25',
                    }}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render end date errors and start date errors when both errors are passed to the page', () => {
            const wrapper = renderToFragment(
                <ProductDateInfo
                    startDateErrors={[{ errorMessage: 'Start date must be a real date', id: 'start-day-input' }]}
                    endDateErrors={[
                        {
                            id: 'end-year-input',
                            errorMessage: 'End date year has an invalid character',
                        },
                    ]}
                    inputs={{
                        startDateDay: 'first',
                        startDateMonth: 'august',
                        startDateYear: '2020',
                        endDateDay: '01',
                        endDateMonth: '01',
                        endDateYear: '20.25',
                    }}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('should return props containing no errors and valid fieldsets when no product session is present', () => {
            const ctx = getMockContext();
            const result = getServerSideProps(ctx);

            expect(result.props.endDateErrors).toEqual([]);
            expect(result.props.startDateErrors).toEqual([]);
            expect(result.props.inputs).toEqual({
                startDateDay: '',
                startDateMonth: '',
                startDateYear: '',
                endDateDay: '',
                endDateMonth: '',
                endDateYear: '',
            });
        });

        it('should return props containing no errors and valid fieldsets when no are present', () => {
            const ctx = getMockContext({
                session: {
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        errors: [],
                        dates: {
                            startDateDay: '01',
                            startDateMonth: '01',
                            startDateYear: '2020',
                            endDateDay: '01',
                            endDateMonth: '01',
                            endDateYear: '2025',
                        },
                    },
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.endDateErrors).toEqual([]);
            expect(result.props.startDateErrors).toEqual([]);
            expect(result.props.inputs).toEqual({
                startDateDay: '01',
                startDateMonth: '01',
                startDateYear: '2020',
                endDateDay: '01',
                endDateMonth: '01',
                endDateYear: '2025',
            });
        });

        it('should return props containing errors and valid fieldsets when radio and all input errors are present', () => {
            const errors: ErrorInfo[] = [
                {
                    id: 'start-day-input',
                    errorMessage: 'Start date must be a real date',
                },
                {
                    id: 'end-day-input',
                    errorMessage: 'End date must be a real date',
                },
            ];

            const ctx = getMockContext({
                session: {
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        errors,
                        dates: {
                            startDateDay: 'first',
                            startDateMonth: 'august',
                            startDateYear: '2020',
                            endDateDay: '01',
                            endDateMonth: '01',
                            endDateYear: '20.25',
                        },
                    },
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.startDateErrors).toEqual([errors[0]]);
            expect(result.props.endDateErrors).toEqual([errors[1]]);
            expect(result.props.inputs).toEqual({
                startDateDay: 'first',
                startDateMonth: 'august',
                startDateYear: '2020',
                endDateDay: '01',
                endDateMonth: '01',
                endDateYear: '20.25',
            });
        });
    });
});
