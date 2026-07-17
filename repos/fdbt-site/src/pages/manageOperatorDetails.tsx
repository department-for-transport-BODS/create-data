import ErrorSummary from '../components/ErrorSummary';
import { ReactElement, useState } from 'react';
import CsrfForm from '../components/CsrfForm';
import { BaseLayout } from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { GS_OPERATOR_DETAILS_ATTRIBUTE } from '../constants/attributes';
import { getAndValidateNoc, getCsrfToken, isSchemeOperator } from '../utils';
import { getOperatorDetails, getOperatorDetailsFromNocTable } from '../data/auroradb';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';
import SubNavigation from '../layout/SubNavigation';
import InfoPopup from '../../src/components/InfoPopup';
import { OperatorDetails } from '../../src/interfaces/matchingJsonTypes';

const title = 'Manage Operator Details - Create Fares Data Service';
const description = 'Manage Operator Details End page of the Create Fares Data Service';

type ManageOperatorDetailsProps = {
    errors: ErrorInfo[];
    csrfToken: string;
    operatorDetails: OperatorDetails;
    referer: string | null;
    saved: boolean;
};

const ManageOperatorDetails = ({
    errors,
    csrfToken,
    operatorDetails,
    referer,
    saved,
}: ManageOperatorDetailsProps): ReactElement => {
    const [showSaved, setShowSaved] = useState(saved);

    const inputDetails = [
        {
            inputId: 'operatorName',
            label: 'Operator name',
            defaultValue: operatorDetails.operatorName,
        },
        {
            inputId: 'contactNumber',
            label: 'Contact number',
            defaultValue: operatorDetails.contactNumber,
        },
        {
            inputId: 'email',
            label: 'Email',
            defaultValue: operatorDetails.email,
        },
        {
            inputId: 'url',
            label: 'URL',
            defaultValue: operatorDetails.url,
        },
        {
            inputId: 'street',
            label: 'Street',
            defaultValue: operatorDetails.street,
        },
        {
            inputId: 'town',
            label: 'Town',
            defaultValue: operatorDetails.town,
        },
        {
            inputId: 'county',
            label: 'County',
            defaultValue: operatorDetails.county,
        },
        {
            inputId: 'postcode',
            label: 'Postcode',
            defaultValue: operatorDetails.postcode,
        },
    ];

    return (
        <BaseLayout title={title} description={description} showNavigation referer={referer}>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                        <SubNavigation />
                    </div>
                    <div className="govuk-grid-column-three-quarters">
                        <ErrorSummary errors={errors} />
                        <h1 className="govuk-heading-xl">Operator Details</h1>
                        <p className="govuk-body govuk-!-margin-bottom-4" id={'operator-details-text'}>
                            This information will be included in your fares data and therefore may be presented to
                            passengers.
                        </p>
                        <CsrfForm action="/api/manageOperatorDetails" method="post" csrfToken={csrfToken}>
                            {inputDetails.map((details) => (
                                <FormGroupWrapper key={details.inputId} errorIds={[details.inputId]} errors={errors}>
                                    <div className="govuk-form-group">
                                        <label
                                            className="govuk-label govuk-!-font-weight-bold"
                                            htmlFor={details.inputId}
                                        >
                                            {details.label}
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId={details.inputId}
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className={`govuk-input govuk-input--width-20 govuk-!-margin-right-4`}
                                                id={`${details.inputId}`}
                                                name={details.inputId}
                                                aria-describedby="operator-details-text"
                                                type="text"
                                                defaultValue={details.defaultValue}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </FormGroupWrapper>
                            ))}
                            <input type="submit" value={`Save`} className="govuk-button" />
                            {showSaved && (
                                <InfoPopup
                                    title="Success"
                                    text={`You have saved your operator details.`}
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
): Promise<{ props: ManageOperatorDetailsProps }> => {
    const attribute = getSessionAttribute(ctx.req, GS_OPERATOR_DETAILS_ATTRIBUTE);
    const noc = getAndValidateNoc(ctx);
    const schemeOp = isSchemeOperator(ctx);

    const operatorDetails =
        attribute && 'input' in attribute
            ? attribute.input
            : (await getOperatorDetails(noc)) ||
              (await getOperatorDetailsFromNocTable(noc)) || {
                  operatorName: '',
                  contactNumber: '',
                  email: '',
                  url: '',
                  street: '',
                  town: '',
                  county: '',
                  postcode: '',
              };

    const errors = attribute && 'input' in attribute ? attribute.errors : [];
    const saved = attribute && 'saved' in attribute && attribute.saved;
    if (saved) {
        // only want the saved banner to display once
        updateSessionAttribute(ctx.req, GS_OPERATOR_DETAILS_ATTRIBUTE, undefined);
    }

    if (schemeOp && operatorDetails.operatorName === '') {
        if (
            !errors.find(
                (error) =>
                    error.errorMessage ===
                    'Before you can create any fare information, you must provide the information below',
            )
        ) {
            errors.splice(0, 0, {
                errorMessage: 'Before you can create any fare information, you must provide the information below',
                id: 'operatorName',
            });
        }
    }

    return {
        props: {
            operatorDetails,
            errors,
            csrfToken: getCsrfToken(ctx),
            referer: extractGlobalSettingsReferer(ctx),
            saved: !!saved,
        },
    };
};

export default ManageOperatorDetails;
