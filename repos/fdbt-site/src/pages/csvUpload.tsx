import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import UserDataUploadComponent from '../components/UserDataUploads';
import {
    CSV_UPLOAD_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../constants/attributes';
import FaresTriangleExampleCsv from '../assets/files/Fares-Triangle-Example.csv';
import HowToUploadFaresTriangle from '../assets/files/How-to-Upload-a-Fares-Triangle.pdf';
import { NextPageContextWithSession, ErrorInfo, UserDataUploadsProps } from '../interfaces';
import { getSessionAttribute } from '../utils/sessions';
import { getCsrfToken } from '../utils';
import BackButton from '../components/BackButton';
import ErrorSummary from '../components/ErrorSummary';
import FileAttachment from '../components/FileAttachment';
import guidanceDocImage from '../assets/images/Guidance-doc-front-page.png';
import csvImage from '../assets/images/csv.png';
import CsrfForm from '../components/CsrfForm';
import { SUPPORT_EMAIL_ADDRESS } from '../constants';
import AccessibilityDetails from '../components/AccessibilityDetails';

const title = 'CSV Upload - Create Fares Data Service';
const description = 'CSV Upload page of the Create Fares Data Service';

interface CsvUploadProps extends UserDataUploadsProps {
    backHref: string;
    guidanceDocDisplayName: string;
    guidanceDocSize: string;
    csvTemplateDisplayName: string;
    csvTemplateSize: string;
    csrfToken: string;
    supportEmail: string;
}

const CsvUpload = ({
    errors,
    backHref,
    guidanceDocDisplayName,
    guidanceDocSize,
    csvTemplateDisplayName,
    csvTemplateSize,
    csrfToken,
    supportEmail,
    ...props
}: CsvUploadProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
                <ErrorSummary errors={errors} />
                <CsrfForm action="/api/csvUpload" method="post" encType="multipart/form-data" csrfToken={csrfToken}>
                    <UserDataUploadComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        errors={errors}
                        detailBody={
                            <>
                                <p>Some common issues with fares triangle uploads include:</p>
                                <ul className="govuk-list govuk-list--bullet">
                                    <li>Commas in fare stage names</li>
                                    <li>Not filling in every fare stage on the diagonal row</li>
                                </ul>
                                <p>
                                    Use the help file for a more detailed guide on constructing a fares triangle in the
                                    required format or download the fares triangle template to create a new file.
                                </p>
                            </>
                        }
                    />
                    <input type="submit" value="Upload and continue" id="submit-button" className="govuk-button" />
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

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: CsvUploadProps } => {
    const csvUploadAttribute = getSessionAttribute(ctx.req, CSV_UPLOAD_ATTRIBUTE);
    const errors: ErrorInfo[] = csvUploadAttribute?.errors ?? [];
    const poundsOrPence = csvUploadAttribute?.poundsOrPence ?? null;

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const backHref =
        ticket && matchingJsonMetaData
            ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                  matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
              }`
            : '';

    return {
        props: {
            csvUploadTitle: 'Upload fares triangle',
            csvUploadHintText:
                'Upload a fares triangle as a .csv or MS Excel file. Refer to the help documents section to download a help file or a fares triangle template.',
            guidanceDocDisplayName: 'Download Help File - File Type PDF - File Size 592KB',
            guidanceDocSize: '1.2MB',
            csvTemplateDisplayName: 'Download fares triangle CSV template - File Type CSV - File Size 255B',
            csvTemplateSize: '255B',
            errors,
            detailSummary: "My fare triangle won't upload",
            showPriceOption: true,
            poundsOrPence,
            csrfToken: getCsrfToken(ctx),
            backHref,
            supportEmail: SUPPORT_EMAIL_ADDRESS || 'test@example.com',
        },
    };
};

export default CsvUpload;
