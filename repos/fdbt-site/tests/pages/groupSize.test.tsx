import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import GroupSize, { getServerSideProps, GroupSizeProps } from '../../src/pages/groupSize';
import { getMockContext } from '../testData/mockData';
import { GroupTicketAttributeWithErrors } from '../../src/interfaces';
import { GROUP_SIZE_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('groupSize', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<GroupSize groupTicketInfo={{ maxGroupSize: '' }} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <GroupSize
                    groupTicketInfo={{
                        maxGroupSize: 'not a number',
                        errors: [
                            {
                                errorMessage: 'Enter a whole number between 1 and 30',
                                id: 'max-group-size',
                                userInput: 'not a number',
                            },
                        ],
                    }}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('should return default props when there is no GROUP_SIZE_ATTRIBUTE', () => {
            const ctx = getMockContext();
            const expectedProps: { props: GroupSizeProps } = {
                props: {
                    groupTicketInfo: {
                        maxGroupSize: '',
                    },
                    csrfToken: '',
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(expectedProps);
        });

        it('should return props containing errors when the GROUP_SIZE_ATTRIBUTE contains errors', () => {
            const groupTicketInfoWithErrors: GroupTicketAttributeWithErrors = {
                maxGroupSize: 'wrong input',
                errors: [
                    {
                        errorMessage: 'Enter a whole number between 1 and 30',
                        id: 'max-group-size',
                        userInput: 'wrong input',
                    },
                ],
            };
            const ctx = getMockContext({
                session: {
                    [GROUP_SIZE_ATTRIBUTE]: groupTicketInfoWithErrors,
                },
            });
            const expectedProps: { props: GroupSizeProps } = {
                props: {
                    groupTicketInfo: groupTicketInfoWithErrors,
                    csrfToken: '',
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(expectedProps);
        });
    });
});
