import { render } from '@testing-library/react';
import { ReactElement } from 'react';

import ReturnValidity, { getServerSideProps, getFieldset } from '../../src/pages/returnValidity';
import {
    mockReturnValidityFieldset,
    mockReturnValidityFieldsetWithTextInputErrors,
    mockReturnValidityFieldsetWithDropdownInputErrors,
    mockReturnValidityFieldsetWithTextAndDropdownInputErrors,
    mockReturnValidityFieldsetWithRadioErrors,
    getMockContext,
} from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';
import { RETURN_VALIDITY_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('returnValidity', () => {
        const textInputError: ErrorInfo[] = [
            { errorMessage: 'Enter a whole number greater than zero', id: 'return-validity-amount' },
        ];
        const dropdownInputError: ErrorInfo[] = [
            { errorMessage: 'Choose one of the options from the dropdown list', id: 'return-validity-units' },
        ];
        const textAndDropdownInputErrors: ErrorInfo[] = [
            { errorMessage: 'Enter a whole number greater than zero', id: 'return-validity-amount' },
            { errorMessage: 'Choose one of the options from the dropdown list', id: 'return-validity-units' },
        ];
        const radioError: ErrorInfo[] = [
            { errorMessage: 'Choose one of the options below', id: 'return-validity-defined' },
        ];

        it('should render the page correctly', () => {
            const wrapper = renderToFragment(
                <ReturnValidity errors={[]} fieldset={mockReturnValidityFieldset} csrfToken="" backHref="" />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it.each([
            ['only text input', mockReturnValidityFieldsetWithTextInputErrors, textInputError],
            ['only dropdown input', mockReturnValidityFieldsetWithDropdownInputErrors, dropdownInputError],
            [
                'both text and dropdown input',
                mockReturnValidityFieldsetWithTextAndDropdownInputErrors,
                textAndDropdownInputErrors,
            ],
            ['radio', mockReturnValidityFieldsetWithRadioErrors, radioError],
        ])('should render the page with errors when %s errors are present', (_case, fieldset, errors) => {
            const wrapper = renderToFragment(
                <ReturnValidity errors={errors} fieldset={fieldset} csrfToken="" backHref="" />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        describe('getFieldset', () => {
            it.each([
                ['with no errors', [], mockReturnValidityFieldset],
                [
                    'with input errors when they are present',
                    textAndDropdownInputErrors,
                    mockReturnValidityFieldsetWithTextAndDropdownInputErrors,
                ],
                ['with radio errors when they are present', radioError, mockReturnValidityFieldsetWithRadioErrors],
            ])('should return a fieldset %s', (_case, errors, mockFieldset) => {
                const fieldset = getFieldset(errors, '', '');
                expect(fieldset).toEqual(mockFieldset);
            });
        });

        describe('getServerSideProps', () => {
            it('should return no errors and a base fieldset when the user first visits the page', () => {
                const ctx = getMockContext();
                const result = getServerSideProps(ctx);
                expect(result.props.errors).toEqual([]);
                expect(result.props.fieldset).toEqual(mockReturnValidityFieldset);
            });

            it('should return errors and a fieldset whith errors when the user has dropdown errors', () => {
                const ctx = getMockContext({
                    session: {
                        [RETURN_VALIDITY_ATTRIBUTE]: {
                            errors: textAndDropdownInputErrors,
                        },
                    },
                });
                const result = getServerSideProps(ctx);
                expect(result.props.errors).toEqual(textAndDropdownInputErrors);
                expect(result.props.fieldset).toEqual(mockReturnValidityFieldsetWithTextAndDropdownInputErrors);
            });
        });
    });
});
