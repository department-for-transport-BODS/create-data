import { render } from '@testing-library/react';
import FormElementWrapper from '../../src/components/FormElementWrapper';

describe('FormElementWrapper', () => {
    describe('no errors', () => {
        it('does nothing if there are no errors', () => {
            const { container } = render(
                <FormElementWrapper errors={[]} errorId="input-error" errorClass="input--error">
                    <input type="text" />
                </FormElementWrapper>,
            );

            expect(container.innerHTML).toBe('<div class=""><input type="text"></div>');
        });
    });

    describe('no matching errors', () => {
        it('does nothing', () => {
            const { container } = render(
                <FormElementWrapper
                    errors={[{ errorMessage: 'Test error', id: 'input-1' }]}
                    errorId="input"
                    errorClass="input--error"
                >
                    <input type="text" />
                </FormElementWrapper>,
            );

            expect(container.querySelectorAll('.govuk-error-message')).toHaveLength(0);
        });
    });

    describe('matching errors', () => {
        const renderMatchingErrors = () =>
            render(
                <FormElementWrapper
                    errors={[
                        { errorMessage: 'Test error', id: 'input' },
                        { errorMessage: 'Test error', id: 'input-2' },
                    ]}
                    errorId="input"
                    errorClass="input--error"
                >
                    <input type="text" />
                </FormElementWrapper>,
            );

        it('adds error message span if there is an error that matches the given errorId', () => {
            const { container } = renderMatchingErrors();
            const errorSpans = container.querySelectorAll('.govuk-error-message');

            expect(errorSpans).toHaveLength(1);
            expect(errorSpans[0].textContent).toBe('Error: Test error');
        });

        it('adds given class', () => {
            const { container } = renderMatchingErrors();
            expect(container.querySelector('input')?.className).toBe('input--error');
        });

        it('adds aria describedby property', () => {
            const { container } = renderMatchingErrors();
            expect(container.querySelector('input')?.getAttribute('aria-describedby')).toBe('input-error');
        });

        it('appends class if child already has class names', () => {
            const { container } = render(
                <FormElementWrapper
                    errors={[
                        { errorMessage: 'Test error', id: 'input' },
                        { errorMessage: 'Test error', id: 'input-2' },
                    ]}
                    errorId="input"
                    errorClass="input--error"
                >
                    <input type="text" className="existing-class" />
                </FormElementWrapper>,
            );

            expect(container.querySelector('input')?.className).toBe('existing-class input--error');
        });

        it('uses first matching error if there are multiple', () => {
            const { container } = render(
                <FormElementWrapper
                    errors={[
                        { errorMessage: 'Test error First', id: 'input' },
                        { errorMessage: 'Test error Second', id: 'input' },
                    ]}
                    errorId="input"
                    errorClass="input--error"
                >
                    <input type="text" className="existing-class" />
                </FormElementWrapper>,
            );

            expect(container.querySelector('.govuk-error-message')?.textContent).toBe('Error: Test error First');
        });
    });
});
