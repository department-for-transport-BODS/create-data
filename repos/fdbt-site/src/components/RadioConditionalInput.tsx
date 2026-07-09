import { ReactElement } from 'react';
import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import {
    ErrorInfo,
    BaseReactElement,
    RadioWithoutConditionals,
    RadioWithConditionalInputs,
    RadioButton,
    RadioConditionalInputFieldset,
} from '../interfaces';
import FormElementWrapper from './FormElementWrapper';

interface RadioConditionalInputProps {
    fieldset: RadioConditionalInputFieldset;
}

export const createErrorId = (input: BaseReactElement, inputErrors: ErrorInfo[]): string => {
    const el = inputErrors.find(({ id }) => id === input.id);
    if (el) {
        return el.id;
    }
    return '';
};

export const renderConditionalTextInput = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional${error ? '' : ' govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <fieldset className="govuk-fieldset" aria-describedby={radio.inputHint.id}>
                <legend
                    className={`govuk-fieldset__legend govuk-fieldset__legend--s${
                        radio.inputHint.hidden ? ' govuk-visually-hidden' : ''
                    }`}
                    id={radio.inputHint.id}
                >
                    {radio.inputHint.content}
                </legend>
                {(radio.inputs as BaseReactElement[]).map((input) => {
                    const errorId = createErrorId(input, radio.inputErrors);
                    return (
                        <div
                            key={input.id}
                            className={`govuk-form-group${errorId !== '' ? ' govuk-form-group--error' : ''}`}
                        >
                            <label className="govuk-label" htmlFor={input.id}>
                                {input.label}
                            </label>
                            <FormElementWrapper
                                errors={radio.inputErrors}
                                errorId={errorId}
                                errorClass="govuk-input--error"
                            >
                                <input
                                    className="govuk-input govuk-!-width-one-third"
                                    id={input.id}
                                    name={input.name}
                                    type="text"
                                    disabled={input.disabled}
                                    defaultValue={input.defaultValue || ''}
                                />
                            </FormElementWrapper>
                        </div>
                    );
                })}
            </fieldset>
        </div>
    );
};

const renderConditionalCheckbox = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional ${error ? '' : 'govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" aria-describedby={radio.inputHint.id}>
                    <legend
                        className={`govuk-fieldset__legend govuk-fieldset__legend--s${
                            radio.inputHint.hidden ? ' govuk-visually-hidden' : ''
                        }`}
                        id={radio.inputHint.id}
                    >
                        {radio.inputHint.content}
                    </legend>
                    <FormElementWrapper
                        errors={radio.inputErrors}
                        errorId={error ? radio.inputErrors[0].id : ''}
                        errorClass=""
                    >
                        <div className="govuk-checkboxes">
                            {(radio.inputs as BaseReactElement[]).map((input) => {
                                return (
                                    <div key={input.id} className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id={input.id}
                                            name={input.name}
                                            value={camelCase(input.id)}
                                            type="checkbox"
                                            defaultChecked={input.defaultChecked}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor={input.id}>
                                            {input.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </FormElementWrapper>
                </fieldset>
            </div>
        </div>
    );
};

export const renderConditionalTextWithUnitsInput = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional${error ? '' : ' govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <fieldset className="govuk-fieldset" role="group" aria-describedby={radio.inputHint.id}>
                <legend
                    className={`govuk-fieldset__legend govuk-fieldset__legend--s${
                        radio.inputHint.hidden ? ' govuk-visually-hidden' : ''
                    }`}
                    id={radio.inputHint.id}
                >
                    {radio.inputHint.content}
                </legend>
                {(radio.inputs as BaseReactElement[]).map((input) => {
                    const errorId = createErrorId(input, radio.inputErrors);
                    return (
                        <div
                            key={input.id}
                            className={`govuk-form-group${errorId !== '' ? ' govuk-form-group--error' : ''}`}
                        >
                            <label className="govuk-label" htmlFor={input.id}>
                                {input.label}
                            </label>
                            <FormElementWrapper
                                errors={radio.inputErrors}
                                errorId={errorId}
                                errorClass={`${
                                    input.id.includes('units') ? 'govuk-select--error' : 'govuk-input--error'
                                }`}
                            >
                                {input.id.includes('units') ? (
                                    <select
                                        className="govuk-select"
                                        id={input.id}
                                        name={input.name}
                                        defaultValue={input.defaultValue || ''}
                                    >
                                        <option value="" disabled>
                                            Select a {input.name}
                                        </option>
                                        {input.options?.map((unit) => (
                                            <option key={`${unit}-option`} value={unit}>
                                                {startCase(`${unit}s`)}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        id={input.id}
                                        name={input.name}
                                        type="text"
                                        defaultValue={input.defaultValue || ''}
                                    />
                                )}
                            </FormElementWrapper>
                        </div>
                    );
                })}
            </fieldset>
        </div>
    );
};

const renderConditionalDateInputs = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional ${error ? '' : 'govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            {(radio.inputs as BaseReactElement[]).map((input) => {
                const inputGroupError = radio.inputErrors.find(({ id }) => {
                    return id.includes(input.id);
                });

                return (
                    <div className="govuk-form-group" key={input.id}>
                        <fieldset className="govuk-fieldset" role="group">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{input.label}</legend>
                            <div className={`govuk-form-group${inputGroupError ? ' govuk-form-group--error' : ''}`}>
                                <div className="govuk-date-input" id={input.id}>
                                    {inputGroupError ? (
                                        <span id={input.id} className="govuk-error-message">
                                            {inputGroupError.errorMessage}
                                        </span>
                                    ) : null}
                                    <div className="govuk-date-input__item">
                                        <div className="govuk-form-group">
                                            <label
                                                className="govuk-label govuk-date-input__label"
                                                htmlFor={`${input.id}-day`}
                                            >
                                                Day
                                            </label>
                                            <input
                                                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                                    inputGroupError ? 'govuk-input--error' : ''
                                                }`}
                                                id={`${input.id}-day`}
                                                name={`${input.name}Day`}
                                                type="text"
                                                defaultValue={
                                                    input.defaultValue ? input.defaultValue.split('#')[0] : ''
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="govuk-date-input__item">
                                        <div className="govuk-form-group">
                                            <label
                                                className="govuk-label govuk-date-input__label"
                                                htmlFor={`${input.id}-month`}
                                            >
                                                Month
                                            </label>
                                            <input
                                                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                                    inputGroupError ? 'govuk-input--error' : ''
                                                }`}
                                                id={`${input.id}-month`}
                                                name={`${input.name}Month`}
                                                type="text"
                                                defaultValue={
                                                    input.defaultValue ? input.defaultValue.split('#')[1] : ''
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="govuk-date-input__item">
                                        <div className="govuk-form-group">
                                            <label
                                                className="govuk-label govuk-date-input__label"
                                                htmlFor={`${input.id}-year`}
                                            >
                                                Year
                                            </label>
                                            <input
                                                className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                                                    inputGroupError ? 'govuk-input--error' : ''
                                                }`}
                                                id={`${input.id}-year`}
                                                name={`${input.name}Year`}
                                                type="text"
                                                defaultValue={
                                                    input.defaultValue ? input.defaultValue.split('#')[2] : ''
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                );
            })}
        </div>
    );
};

const renderConditionalDropdown = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional ${error ? '' : 'govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" aria-describedby={radio.inputHint.id}>
                    <legend
                        className={`govuk-fieldset__legend govuk-fieldset__legend--s${
                            radio.inputHint.hidden ? ' govuk-visually-hidden' : ''
                        }`}
                        id={radio.inputHint.id}
                    >
                        {radio.inputHint.content}
                    </legend>
                    <FormElementWrapper
                        errors={radio.inputErrors}
                        errorId={error ? radio.inputErrors[0].id : ''}
                        errorClass=""
                    >
                        <select
                            className="govuk-select"
                            id={radio.selectIdentifier || 'conditional-dropdown'}
                            name={radio.selectIdentifier || 'conditional-dropdown'}
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Select One
                            </option>
                            {(radio.inputs as BaseReactElement[]).map((input) => (
                                <option key={input.name} value={input.name} className="govuk-select">
                                    {input.name}
                                </option>
                            ))}
                        </select>
                    </FormElementWrapper>
                </fieldset>
            </div>
        </div>
    );
};

export const conditionalRadioInputDefaultExists = (radio: RadioWithConditionalInputs): boolean => {
    if (radio.inputType === 'text' || radio.inputType === 'textWithUnits') {
        return (radio.inputs as BaseReactElement[]).some((input) => input.defaultValue !== '');
    }
    if (radio.inputType === 'date') {
        return (radio.inputs as BaseReactElement[]).some((input) => input.defaultValue !== '##');
    }
    if (radio.inputType === 'checkbox') {
        return (radio.inputs as BaseReactElement[]).some((input) => input.defaultChecked);
    }
    return false;
};

const renderConditionalRadioButton = (
    radio: RadioWithConditionalInputs,
    radioLabel: ReactElement,
    radioButtonHint?: ReactElement,
): ReactElement => {
    const uncheckedRadioInput = (
        <input
            className="govuk-radios__input"
            id={radio.id}
            name={radio.name}
            type="radio"
            value={radio.value}
            data-aria-controls={radio.dataAriaControls}
        />
    );
    const checkedRadioInput = (
        <input
            className="govuk-radios__input"
            id={radio.id}
            name={radio.name}
            type="radio"
            value={radio.value}
            data-aria-controls={radio.dataAriaControls}
            defaultChecked
        />
    );

    const inputTypeMap = {
        checkbox: renderConditionalCheckbox,
        text: renderConditionalTextInput,
        textWithUnits: renderConditionalTextWithUnitsInput,
        date: renderConditionalDateInputs,
        dropdown: renderConditionalDropdown,
    };

    return (
        <div key={radio.id}>
            <div className="govuk-radios__item">
                {radio.inputErrors.length > 0 || (conditionalRadioInputDefaultExists(radio) && !radio.disableAutoSelect)
                    ? checkedRadioInput
                    : uncheckedRadioInput}
                {radioLabel}
                {radio.radioButtonHint ? radioButtonHint : null}
            </div>
            {inputTypeMap[radio.inputType](radio)}
        </div>
    );
};

const isRadioWithConditionalInputs = (
    radioButton: RadioWithConditionalInputs | RadioWithoutConditionals,
): radioButton is RadioWithConditionalInputs => {
    return (radioButton as RadioWithConditionalInputs).inputHint !== undefined;
};

const renderRadioButtonSet = (radio: RadioButton): ReactElement => {
    const radioButtonLabel: ReactElement = (
        <label className="govuk-label govuk-radios__label" htmlFor={radio.id}>
            {radio.label}
        </label>
    );

    const radioButtonHint: ReactElement = (
        <span className="govuk-hint govuk-radios__hint" id={radio.radioButtonHint?.id}>
            {radio.radioButtonHint?.content}
        </span>
    );

    if (isRadioWithConditionalInputs(radio)) {
        return renderConditionalRadioButton(radio, radioButtonLabel, radioButtonHint);
    }

    return (
        <div key={radio.id} className="govuk-radios__item">
            <input
                className="govuk-radios__input"
                id={radio.id}
                name={radio.name}
                type="radio"
                value={radio.value}
                defaultChecked={radio.defaultChecked}
            />
            {radioButtonLabel}
            {radio.radioButtonHint ? radioButtonHint : null}
        </div>
    );
};

const RadioConditionalInput = ({ fieldset }: RadioConditionalInputProps): ReactElement => {
    const radioError = fieldset.radioError.length > 0;

    return (
        <div className={`govuk-form-group ${radioError ? 'govuk-form-group--error' : ''}`} id="conditional-form-group">
            <fieldset className="govuk-fieldset" aria-describedby={fieldset.heading.id}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2
                        className={`govuk-fieldset__heading${fieldset.heading.hidden ? ' govuk-visually-hidden' : ''}`}
                        id={fieldset.heading.id}
                    >
                        {fieldset.heading.content}
                    </h2>
                </legend>
                <FormElementWrapper
                    errors={fieldset.radioError}
                    errorId={radioError ? fieldset.radioError[0].id : ''}
                    errorClass="govuk-radios--error"
                >
                    <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                        {fieldset.radios.map(renderRadioButtonSet)}
                    </div>
                </FormElementWrapper>
            </fieldset>
            <br />
            <br />
        </div>
    );
};

export default RadioConditionalInput;
