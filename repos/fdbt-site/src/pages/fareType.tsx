import { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import RadioButtons from '../components/RadioButtons';
import { INTERNAL_NOC } from '../constants';
import { FARE_TYPE_ATTRIBUTE, GS_REFERER, OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { getOperatorDetails } from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession, RadioOption } from '../interfaces';
import { isFareTypeAttributeWithErrors } from '../interfaces/typeGuards';
import TwoThirdsLayout from '../layout/Layout';
import { getAndValidateNoc, getCsrfToken, isSchemeOperator } from '../utils/index';
import logger from '../utils/logger';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { redirectTo } from '../utils/apiUtils';

const title = 'Fare Type - Create Fares Data Service ';
const description = 'Fare Type selection page of the Create Fares Data Service';

const errorId = 'radio-option-single';

interface FareTypeProps {
    operatorName: string;
    schemeOp: boolean;
    errors: ErrorInfo[];
    csrfToken: string;
}

export const buildUuid = (noc: string): string => {
    const uuid = uuidv4();

    return noc + uuid.substring(0, 8);
};

const buildRadioProps = (schemeOp: boolean): RadioOption[] => {
    if (schemeOp) {
        return [
            {
                value: 'period',
                label: 'Period ticket',
                hint: 'A ticket valid for a number of days, weeks, months or years',
            },
            {
                value: 'carnetPeriod',
                label: 'Carnet period ticket',
                hint: 'A bundle of period tickets, each valid for a number of days, weeks, months or years',
            },
            {
                value: 'flatFare',
                label: 'Flat fare ticket',
                hint: 'A fixed fee ticket for a single journey',
            },
            {
                value: 'carnetFlatFare',
                label: 'Carnet flat fare ticket',
                hint: 'A bundle of fixed fee tickets, each for a single journey',
            },
        ];
    }

    const radioProps = [
        {
            value: 'single',
            label: 'Single ticket',
            hint: 'A ticket for a point to point journey',
        },
        {
            value: 'return',
            label: 'Return ticket',
            hint: 'An inbound and outbound ticket for the same service',
        },
        {
            value: 'flatFare',
            label: 'Flat fare/short hop ticket',
            hint: 'A fixed fee ticket for a single or return journey',
        },
        {
            value: 'period',
            label: 'Period ticket',
            hint: 'A ticket valid for a number of days, weeks, months or years',
        },
        {
            value: 'carnet',
            label: 'Carnet ticket',
            hint: 'A bundle of pre-paid tickets',
        },
        {
            value: 'multiOperator',
            label: 'Multi-operator (internal)',
            hint: 'A ticket that covers more than one NOC in your organisation',
        },
        {
            value: 'schoolService',
            label: 'Academic term/year ticket',
            hint: 'A ticket available to pupils in full-time education',
        },
    ];

    return radioProps;
};

const FareType = ({ operatorName, schemeOp, errors = [], csrfToken }: FareTypeProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/fareType" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="fare-type-page-heading">
                                    Select a fare type
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="fare-type-operator-hint">
                                {operatorName}
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <RadioButtons options={buildRadioProps(schemeOp)} inputName="fareType" />
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: FareTypeProps }> => {
    updateSessionAttribute(ctx.req, GS_REFERER, undefined);
    const csrfToken = getCsrfToken(ctx);
    const schemeOp = isSchemeOperator(ctx);

    const nocCode = getAndValidateNoc(ctx);

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    if (!operatorAttribute || !nocCode) {
        throw new Error('Could not extract the necessary operator info for the fareType page.');
    }
    const operatorName = operatorAttribute.name || '';

    if (schemeOp || nocCode !== INTERNAL_NOC) {
        logger.info('', {
            context: 'pages.fareType',
            message: 'transaction start',
        });
    }

    if (schemeOp) {
        updateSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE, { fareType: 'multiOperator' });
        const operatorDetails = await getOperatorDetails(nocCode);
        if (!operatorDetails && ctx.res) {
            updateSessionAttribute(ctx.req, GS_REFERER, 'fareType');
            redirectTo(ctx.res, '/manageOperatorDetails');
        }
    }

    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);

    const errors: ErrorInfo[] =
        fareTypeAttribute && isFareTypeAttributeWithErrors(fareTypeAttribute) ? fareTypeAttribute.errors : [];

    return { props: { operatorName, schemeOp, errors, csrfToken } };
};

export default FareType;
