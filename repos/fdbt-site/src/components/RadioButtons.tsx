import { ReactElement } from 'react';
import { RadioButtonsProps } from '../interfaces';

const RadioButtons = ({ options, inputName }: RadioButtonsProps): ReactElement => {
    return (
        <div className="govuk-radios">
            {options.map((option) => (
                <div className="govuk-radios__item" key={option.value}>
                    <input
                        className="govuk-radios__input"
                        id={`radio-option-${option.value}`}
                        name={inputName}
                        type="radio"
                        value={option.value}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={`radio-option-${option.value}`}>
                        <b>{option.label}</b>
                    </label>
                    <div id={`${option.value}-hint`} className="govuk-hint govuk-radios__hint">
                        {option.hint}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RadioButtons;
