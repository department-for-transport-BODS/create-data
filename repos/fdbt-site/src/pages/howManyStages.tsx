import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { NUMBER_OF_STAGES_ATTRIBUTE } from '../constants/attributes';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { getCsrfToken } from '../utils';

const title = 'How Many Stages - Create Fares Data Service';
const description = 'How Many Stages selection page of the Create Fares Data Service';

interface HowManyStagesProps {
    errors: ErrorInfo[];
    csrfToken: string;
}

const HowManyStages = ({ errors, csrfToken }: HowManyStagesProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/howManyStages" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset" aria-describedby="number-of-stages-hint">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading">How many fare stages does the service have?</h1>
                        </legend>
                        <span className="govuk-hint" id="number-of-stages-hint">
                            If the service has more than 20 fare stages you will be required to upload a CSV file. A
                            template file is available if required.
                        </span>
                        <FormElementWrapper
                            errors={errors}
                            errorId="less-than-20-fare-stages"
                            errorClass="govuk-radios--error"
                        >
                            <div className="govuk-radios" id="radio-buttons">
                                <div className="govuk-radios__item">
                                    <input
                                        className={`govuk-radios__input ${
                                            errors.length > 0 ? 'govuk-input--error' : ''
                                        } `}
                                        id="less-than-20-fare-stages"
                                        name="howManyStages"
                                        type="radio"
                                        value="lessThan20"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="less-than-20-fare-stages"
                                    >
                                        20 fare stages or fewer
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className={`govuk-radios__input ${
                                            errors.length > 0 ? 'govuk-input--error' : ''
                                        } `}
                                        id="more-than-20-fare-stages"
                                        name="howManyStages"
                                        type="radio"
                                        value="moreThan20"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="more-than-20-fare-stages"
                                    >
                                        Greater than 20 fare stages
                                    </label>
                                </div>
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: HowManyStagesProps } => {
    const csrfToken = getCsrfToken(ctx);
    const numberOfStagesAttribute = getSessionAttribute(ctx.req, NUMBER_OF_STAGES_ATTRIBUTE);
    const errors: ErrorInfo[] = numberOfStagesAttribute ? numberOfStagesAttribute.errors : [];
    return { props: { errors, csrfToken } };
};

export default HowManyStages;
