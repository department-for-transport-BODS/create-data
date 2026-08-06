import upperFirst from 'lodash/upperFirst';
import { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import { ExpiryUnit, CarnetExpiryUnit, CapExpiryUnit } from '../interfaces/matchingJsonTypes';
import FormElementWrapper from './FormElementWrapper';

interface DurationSelectorProps {
    defaultDuration?: string;
    quantityId: string;
    hintId?: string;
    quantityName: string;
    defaultUnit?: ExpiryUnit | CarnetExpiryUnit | CapExpiryUnit;
    unitName: string;
    unitId: string;
    carnet?: boolean;
    school?: boolean;
    errors?: ErrorInfo[];
    hideFormGroupError?: boolean;
    cap?: boolean;
}

const ExpirySelector = ({
    defaultDuration,
    quantityId,
    hintId,
    quantityName,
    defaultUnit,
    unitName,
    unitId,
    carnet = false,
    errors,
    school = false,
    hideFormGroupError = false,
    cap = false,
}: DurationSelectorProps): ReactElement => {
    let optionList: string[] = [];
    Object.values(carnet ? CarnetExpiryUnit : cap ? CapExpiryUnit : ExpiryUnit).map((unit) => {
        optionList.push(unit);
    });
    if (!school) {
        optionList = optionList.filter((option) => option !== 'term');
    }

    return (
        <div className="govuk-input__wrapper expiry-selector-wrapper">
            <>
                <FormElementWrapper
                    errors={errors || []}
                    errorId={quantityId}
                    errorClass="govuk-input--error"
                    hideText
                    addFormGroupError={!hideFormGroupError}
                >
                    <input
                        className="govuk-input govuk-input--width-3"
                        name={quantityName}
                        type="text"
                        id={quantityId}
                        aria-labelledby={hintId || ''}
                        defaultValue={defaultDuration || ''}
                    />
                </FormElementWrapper>
                <FormElementWrapper errors={errors || []} errorId={unitId} errorClass="govuk-select--error" hideText>
                    <select
                        className="govuk-select expiry-selector-units"
                        name={unitName}
                        id={unitId}
                        aria-labelledby={hintId || ''}
                        defaultValue={defaultUnit || ''}
                    >
                        <option value="" disabled key="select-one">
                            Select One
                        </option>
                        {optionList.map((unit) => (
                            <option value={unit} key={unit}>{`${upperFirst(unit)}${
                                unit !== 'no expiry' ? 's' : ''
                            }`}</option>
                        ))}
                    </select>
                </FormElementWrapper>
            </>
        </div>
    );
};

export default ExpirySelector;
