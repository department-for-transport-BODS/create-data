import ErrorSummary from '../components/ErrorSummary';
import { ReactElement, useState } from 'react';
import CsrfForm from '../components/CsrfForm';
import { BaseLayout } from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { GS_FARE_DAY_END_ATTRIBUTE } from '../constants/attributes';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { getFareDayEnd } from '../data/auroradb';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';
import SubNavigation from '../layout/SubNavigation';
import InfoPopup from '../components/InfoPopup';
import InformationSummary from '../components/InformationSummary';

const title = 'Manage Fare Day End - Create Fares Data Service';
const description = 'Manage Fare Day End page of the Create Fares Data Service';

const editingInformationText = 'Editing and saving new changes will be applied to all fares using your fare day end.';

export const fareDayEndInputId = 'fare-day-end-input';

type ManageFareDayEndProps = {
    errors: ErrorInfo[];
    csrfToken: string;
    fareDayEnd: string;
    referer: string | null;
    saved: boolean;
};

const ManageFareDayEnd = ({ errors, csrfToken, fareDayEnd, referer, saved }: ManageFareDayEndProps): ReactElement => {
    const [showSaved, setShowSaved] = useState(saved);

    return (
        <BaseLayout title={title} description={description} showNavigation referer={referer}>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                        <SubNavigation />
                    </div>

                    <div className="govuk-grid-column-three-quarters">
                        {fareDayEnd && errors.length === 0 ? (
                            <InformationSummary informationText={editingInformationText} />
                        ) : null}
                        <ErrorSummary errors={errors} />

                        <h1 className="govuk-heading-xl">Fare day end</h1>
                        <p className="govuk-body govuk-!-margin-bottom-4" id={'fare-day-text'}>
                            If your fare day extends past midnight, enter the time on the following morning when your
                            tickets expire.
                        </p>

                        <div className="govuk-inset-text">
                            Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                        </div>

                        <CsrfForm action="/api/manageFareDayEnd" method="post" csrfToken={csrfToken}>
                            <FormGroupWrapper errorIds={[fareDayEndInputId]} errors={errors}>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={fareDayEndInputId}
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className={`govuk-input govuk-input--width-5 govuk-!-margin-right-4`}
                                        id={fareDayEndInputId}
                                        name={`fareDayEnd`}
                                        aria-labelledby="fare-day-text"
                                        type="text"
                                        defaultValue={fareDayEnd}
                                    />
                                </FormElementWrapper>
                            </FormGroupWrapper>
                            <input type="submit" value={`Save`} className="govuk-button" />
                            {showSaved && (
                                <InfoPopup
                                    title="Success"
                                    text={`You have saved your fare day end time.`}
                                    okActionHandler={() => setShowSaved(false)}
                                    isOpen={showSaved}
                                />
                            )}
                        </CsrfForm>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ManageFareDayEndProps }> => {
    const attribute = getSessionAttribute(ctx.req, GS_FARE_DAY_END_ATTRIBUTE);

    const [fareDayEnd, errors] =
        attribute && 'input' in attribute
            ? [attribute.input, attribute.errors]
            : [(await getFareDayEnd(getAndValidateNoc(ctx))) ?? '', []];

    const saved = attribute && 'saved' in attribute && attribute.saved;
    if (saved) {
        // only want the saved banner to display once
        updateSessionAttribute(ctx.req, GS_FARE_DAY_END_ATTRIBUTE, undefined);
    }

    return {
        props: {
            fareDayEnd,
            errors,
            csrfToken: getCsrfToken(ctx),
            referer: extractGlobalSettingsReferer(ctx),
            saved: !!saved,
        },
    };
};

export default ManageFareDayEnd;
