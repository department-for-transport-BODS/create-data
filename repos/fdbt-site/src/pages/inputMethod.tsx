import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { INPUT_METHOD_ATTRIBUTE } from '../constants/attributes';
import FaresTriangleExampleCsv from '../assets/files/Fares-Triangle-Example.csv';
import HowToUploadFaresTriangle from '../assets/files/How-to-Upload-a-Fares-Triangle.pdf';
import guidanceDocImage from '../assets/images/Guidance-doc-front-page.png';
import csvImage from '../assets/images/csv.png';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { inputMethodErrorsExist } from '../interfaces/typeGuards';
import { getCsrfToken } from '../utils';
import FileAttachment from '../components/FileAttachment';
import AccessibilityDetails from '../components/AccessibilityDetails';
import { SUPPORT_EMAIL_ADDRESS } from '../constants';

const title = 'Input Method - Create Fares Data Service';
const description = 'Input Method selection page of the Create Fares Data Service';

const errorId = 'csv-upload';

interface InputMethodProps {
    errors: ErrorInfo[];
    guidanceDocDisplayName: string;
    guidanceDocSize: string;
    csvTemplateDisplayName: string;
    csvTemplateSize: string;
    csrfToken: string;
    supportEmail: string;
}

const InputMethod = ({
    errors = [],
    csrfToken,
    guidanceDocDisplayName,
    guidanceDocSize,
    csvTemplateDisplayName,
    csvTemplateSize,
    supportEmail,
}: InputMethodProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} errors={errors}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/inputMethod" method="post" csrfToken={csrfToken}>
                        <>
                            <ErrorSummary errors={errors} />
                            <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby="input-method-heading">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                        <h1 id="input-method-heading" className="govuk-fieldset__heading">
                                            Select an input method
                                        </h1>
                                    </legend>

                                    <span className="govuk-hint">
                                        A CSV file is a basic file format which can be created with most spreadsheet
                                        software (Microsoft Excel, Google Sheets etc).
                                    </span>

                                    <span className="govuk-hint">Refer to the help documents for creating a CSV.</span>

                                    <FormElementWrapper
                                        errors={errors}
                                        errorId={errorId}
                                        errorClass="govuk-radios--error"
                                    >
                                        <div className="govuk-radios" id="radio-buttons">
                                            <div className="govuk-radios__item">
                                                <input
                                                    className={`govuk-radios__input ${
                                                        errors.length > 0 ? 'govuk-input--error' : ''
                                                    } `}
                                                    id="csv-upload"
                                                    name="inputMethod"
                                                    type="radio"
                                                    value="csv"
                                                />
                                                <label className="govuk-label govuk-radios__label" htmlFor="csv-upload">
                                                    Upload a fares triangle (CSV)
                                                </label>
                                            </div>
                                            <div className="govuk-radios__item">
                                                <input
                                                    className={`govuk-radios__input ${
                                                        errors.length > 0 ? 'govuk-input--error' : ''
                                                    } `}
                                                    id="manual-entry"
                                                    name="inputMethod"
                                                    type="radio"
                                                    value="manual"
                                                />
                                                <label
                                                    className="govuk-label govuk-radios__label"
                                                    htmlFor="manual-entry"
                                                >
                                                    Manual fares triangle input
                                                </label>
                                            </div>
                                        </div>
                                    </FormElementWrapper>
                                </fieldset>
                            </div>
                            <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                        </>
                    </CsrfForm>
                </div>
                <div className="govuk-grid-column-one-third">
                    <h2 className="govuk-heading-s">Help documents</h2>
                    <FileAttachment
                        displayName={guidanceDocDisplayName}
                        attachmentUrl={`${HowToUploadFaresTriangle}`}
                        imageUrl={guidanceDocImage}
                        size={guidanceDocSize}
                    />
                    <AccessibilityDetails supportEmail={supportEmail} />
                    <FileAttachment
                        displayName={csvTemplateDisplayName}
                        attachmentUrl={`${FaresTriangleExampleCsv}`}
                        imageUrl={csvImage}
                        size={csvTemplateSize}
                    />
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: InputMethodProps } => {
    const csrfToken = getCsrfToken(ctx);
    const inputMethodInfo = getSessionAttribute(ctx.req, INPUT_METHOD_ATTRIBUTE);
    updateSessionAttribute(ctx.req, INPUT_METHOD_ATTRIBUTE, undefined);
    return {
        props: {
            guidanceDocDisplayName: 'Download Help File - File Type PDF - File Size 592KB',
            guidanceDocSize: '1.2MB',
            csvTemplateDisplayName: 'Download fares triangle CSV template - File Type CSV - File Size 255B',
            csvTemplateSize: '255B',
            errors: inputMethodInfo && inputMethodErrorsExist(inputMethodInfo) ? [inputMethodInfo] : [],
            csrfToken,
            supportEmail: SUPPORT_EMAIL_ADDRESS,
        },
    };
};

export default InputMethod;
