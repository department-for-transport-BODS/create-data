import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession, OperatorAttribute } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import RadioButtons from '../components/RadioButtons';
import { getSessionAttribute } from '../utils/sessions';
import { CARNET_FARE_TYPE_ATTRIBUTE, OPERATOR_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../constants/attributes';
import { redirectTo } from '../utils/apiUtils';
import { isSchemeOperator, getCsrfToken } from '../utils';
import { isFareTypeAttributeWithErrors } from '../interfaces/typeGuards';

const title = 'Carnet Fare Type - Create Fares Data Service ';
const description = 'Carnet Fare Type selection page of the Create Fares Data Service';

const errorId = 'fare-type-single';

interface CarnetFareTypeProps {
    operatorName: string;
    errors: ErrorInfo[];
    csrfToken: string;
}

const carnetRadioProps = [
    {
        value: 'single',
        label: 'Single, point to point carnet',
        hint: 'A ticket bundle of various point to point journeys',
    },
    {
        value: 'return',
        label: 'Return carnet',
        hint: 'A ticket bundle of inbound and outbound journeys',
    },
    {
        value: 'flatFare',
        label: 'Flat fare/short hop ticket',
        hint: 'A ticket bundle of flat fare journeys',
    },
    {
        value: 'period',
        label: 'Period carnet',
        hint: 'A ticket bundle where each ticket is valid for a number of days, weeks, months or years',
    },
    {
        value: 'multiOperator',
        label: 'Multi-operator carnet',
        hint: 'A ticket bundle that covers more than one operator',
    },
];

const CarnetFareType = ({ operatorName, errors = [], csrfToken }: CarnetFareTypeProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/carnetFareType" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="carnet-fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="carnet-fare-type-page-heading">
                                    Select a carnet fare type
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="carnet-fare-type-operator-hint">
                                {operatorName}
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <RadioButtons options={carnetRadioProps} inputName="fareType" />
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: CarnetFareTypeProps } => {
    const carnet = getSessionAttribute(ctx.req, CARNET_FARE_TYPE_ATTRIBUTE);
    if (!carnet || isSchemeOperator(ctx)) {
        if (ctx.res) {
            redirectTo(ctx.res, '/fareType');
        }
    }
    const csrfToken = getCsrfToken(ctx);
    const operatorName = (getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE) as OperatorAttribute).name || '';
    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);
    const errors: ErrorInfo[] =
        fareTypeAttribute && isFareTypeAttributeWithErrors(fareTypeAttribute) ? fareTypeAttribute.errors : [];

    return {
        props: {
            csrfToken,
            errors,
            operatorName,
        },
    };
};

export default CarnetFareType;
