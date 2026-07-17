import { ReactElement } from 'react';
import uniqBy from 'lodash/uniqBy';
import TwoThirdsLayout from '../layout/Layout';
import { FARE_STAGES_ATTRIBUTE, STAGE_NAMES_ATTRIBUTE } from '../constants/attributes';
import CsrfForm from '../components/CsrfForm';
import { ErrorInfo, NextPageContextWithSession, InputCheck } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { isInputCheck, isFareStage } from '../interfaces/typeGuards';
import { getCsrfToken } from '../utils';

const title = 'Stage Names - Create Fares Data Service';
const description = 'Stage Names entry page of the Create Fares Data Service';

interface StageNameProps {
    numberOfFareStages: number;
    inputChecks: InputCheck[];
    errors: ErrorInfo[];
    defaults: string[];
    csrfToken: string;
}

export const renderInputField = (
    index: number,
    inputCheck: InputCheck,
    errors: ErrorInfo[] = [],
    defaultInput: string,
): ReactElement => {
    let inputToRender = '';

    if (defaultInput) {
        inputToRender = defaultInput;
    } else if (defaultInput === '') {
        inputToRender = !inputCheck?.error ? inputCheck?.input : '';
    }
    return (
        <div
            className={`govuk-form-group${inputCheck?.error ? ' govuk-form-group--error' : ''}`}
            key={`fare-stage-name-${index + 1}`}
        >
            <label className="govuk-label" htmlFor={`fare-stage-name-${index + 1}`}>
                Fare Stage {index + 1}
            </label>
            <FormElementWrapper
                errors={errors}
                errorClass="govuk-input--error"
                errorId={`fare-stage-name-${index + 1}`}
            >
                <input
                    className="govuk-input govuk-input--width-30 stage-name-input-field"
                    id={`fare-stage-name-${index + 1}`}
                    name="stageNameInput"
                    type="text"
                    defaultValue={inputToRender}
                />
            </FormElementWrapper>
        </div>
    );
};

export const renderInputFields = (
    numberOfFareStages: number,
    inputChecks: InputCheck[],
    errors: ErrorInfo[],
    defaults: string[],
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfFareStages; i += 1) {
        const defaultValue = defaults.length > 0 ? defaults[i] : '';
        elements.push(renderInputField(i, inputChecks[i], errors, defaultValue));
    }

    return elements;
};

export const filterErrors = (errors: ErrorInfo[]): ErrorInfo[] => uniqBy(errors, 'errorMessage');

const StageNames = ({
    numberOfFareStages,
    inputChecks,
    csrfToken,
    errors = [],
    defaults,
}: StageNameProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <CsrfForm action="/api/stageNames" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading">
                            Enter the names of the fare stages in order from first to last
                        </h1>
                    </legend>
                    <div className="govuk-hint">Fare stage names are limited to 70 characters</div>
                    <div>{renderInputFields(numberOfFareStages, inputChecks, errors, defaults)}</div>
                </fieldset>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: StageNameProps } => {
    const csrfToken = getCsrfToken(ctx);
    const fareStagesAttribute = getSessionAttribute(ctx.req, FARE_STAGES_ATTRIBUTE);

    if (!isFareStage(fareStagesAttribute)) {
        throw new Error('Necessary fare stage session not found to show stage names page');
    }

    const numberOfFareStages = Number(fareStagesAttribute.fareStages);
    const stageNamesInfo = getSessionAttribute(ctx.req, STAGE_NAMES_ATTRIBUTE);

    let inputChecks: InputCheck[] = [];
    if (stageNamesInfo && stageNamesInfo.length > 0 && isInputCheck(stageNamesInfo)) {
        inputChecks = stageNamesInfo;
    }

    if (inputChecks.length > 0) {
        const errors: ErrorInfo[] = [];
        inputChecks.forEach((inputCheck) => {
            if (inputCheck.error !== '') {
                errors.push({ errorMessage: inputCheck.error, id: inputCheck.id });
            }
        });
        return { props: { numberOfFareStages, inputChecks, errors, defaults: [], csrfToken } };
    }

    return {
        props: {
            numberOfFareStages,
            inputChecks,
            errors: [],
            defaults: !isInputCheck(stageNamesInfo) && stageNamesInfo ? stageNamesInfo : [],
            csrfToken,
        },
    };
};

export default StageNames;
