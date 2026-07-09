import { ReactElement } from 'react';
import { getCsrfToken, getNocFromIdToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo, NextPageContextWithSession, Operator } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import FormElementWrapper from '../components/FormElementWrapper';
import { batchGetOperatorNamesByNocCode } from '../data/auroradb';
import { OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { getSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';

const title = 'Multiple Operators - Create Fares Data Service';
const description = 'Multiple Operators page of the Create Fares Data Service';

interface MultipleOperatorsProps {
    errors?: ErrorInfo[];
    operatorsAndNocs: Operator[];
    csrfToken: string;
}

const MultipleOperators = ({ operatorsAndNocs, errors = [], csrfToken }: MultipleOperatorsProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/multipleOperators" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label htmlFor="operators">
                        <h1 className="govuk-heading-l" id="multiple-operators-page-heading">
                            Choose an operator name and National Operator Code
                        </h1>
                    </label>
                    <FormElementWrapper errors={errors} errorId="operators" errorClass="govuk-select--error">
                        <select className="govuk-select" id="operators" name="operator" defaultValue="">
                            <option value="" disabled>
                                Select One
                            </option>
                            {operatorsAndNocs.map((operatorAndNoc: Operator) => (
                                <option
                                    key={`${operatorAndNoc.name}|${operatorAndNoc.nocCode}`}
                                    value={`${operatorAndNoc.name}|${operatorAndNoc.nocCode}`}
                                    className="service-option"
                                >
                                    {operatorAndNoc.name} - {operatorAndNoc.nocCode}
                                </option>
                            ))}
                        </select>
                    </FormElementWrapper>
                    <span className="govuk-hint hint-text" id="traveline-hint">
                        This data is taken from the NOC Dataset
                    </span>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{
    props: MultipleOperatorsProps;
}> => {
    const csrfToken = getCsrfToken(ctx);
    const idTokenNoc = getNocFromIdToken(ctx);
    let splitNocs: string[] = [];
    if (idTokenNoc) {
        splitNocs = idTokenNoc.split('|');
    }

    const operatorInfo: Operator[] = await batchGetOperatorNamesByNocCode(splitNocs);

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    return {
        props: {
            operatorsAndNocs: operatorInfo,
            csrfToken,
            errors: isWithErrors(operatorAttribute) ? operatorAttribute.errors : [],
        },
    };
};

export default MultipleOperators;
