import { ReactElement } from 'react';
import { CapExpiryUnit } from '../interfaces/matchingJsonTypes';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { CREATE_CAPS_ATTRIBUTE } from '../constants/attributes';
import { Cap, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { isWithErrors } from '../interfaces/typeGuards';
import { FullColumnLayout } from '../layout/Layout';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { upperFirst } from 'lodash';
import { getCapByNocAndId } from '../data/auroradb';
import BackButton from '../components/BackButton';

const title = 'Create Caps - Create Fares Data Service';
const description = 'Create caps page of the Create Fares Data Service';

interface CreateCapsProps {
    errors: ErrorInfo[];
    userInput?: Cap;
    csrfToken: string;
    editId?: number;
}

const CreateCaps = ({ errors = [], userInput, csrfToken, editId }: CreateCapsProps): ReactElement => {
    const optionList: string[] = Object.values(CapExpiryUnit).filter((option) => option !== 'term');

    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/createCaps" method="post" csrfToken={csrfToken}>
                <>
                    {!!editId && errors.length === 0 ? <BackButton href="/viewCaps" /> : null}
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-l" id="create-caps-page-heading">
                        Create your fare caps
                    </h1>
                    <span id="create-cap-hint" className="govuk-hint">
                        If cap duration is more than a day, provide input for the cap start.
                    </span>

                    <div className="govuk-grid-row">
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-visually-hidden">
                                Enter details for cap
                            </legend>
                            <div className="flex-container">
                                <div className="govuk-!-margin-left-4 govuk-!-margin-right-2">
                                    <FormGroupWrapper errors={errors} errorIds={['cap-name']}>
                                        <>
                                            <label className="govuk-label" htmlFor="cap-name">
                                                <span className="govuk-visually-hidden">Cap Name</span>
                                                <span aria-hidden>Cap name</span>
                                            </label>
                                            <span className="govuk-hint" id="cap-name-hint">
                                                50 characters max
                                            </span>
                                            <FormElementWrapper
                                                errors={errors}
                                                errorId="cap-name"
                                                errorClass="govuk-input--error"
                                                hideText
                                            >
                                                <input
                                                    className="govuk-input govuk-input--width-40 govuk-product-name-input__inner__input"
                                                    id="cap-name"
                                                    name="capName"
                                                    type="text"
                                                    aria-describedby="cap-name-hint"
                                                    maxLength={50}
                                                    defaultValue={
                                                        userInput && userInput.capDetails
                                                            ? userInput.capDetails.name
                                                            : ''
                                                    }
                                                />
                                            </FormElementWrapper>
                                        </>
                                    </FormGroupWrapper>
                                </div>
                                <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                                    <FormGroupWrapper errors={errors} errorIds={['cap-price']}>
                                        <>
                                            <label className="govuk-label" htmlFor="cap-price">
                                                <span className="govuk-visually-hidden">Cap Price, in pounds</span>
                                                <span aria-hidden>Price</span>
                                            </label>
                                            <span className="govuk-hint" id="cap-price-hint">
                                                e.g. 2.99
                                            </span>

                                            <div className="govuk-currency-input">
                                                <div className="govuk-currency-input__inner">
                                                    <span className="govuk-currency-input__inner__unit">£</span>
                                                    <FormElementWrapper
                                                        errors={errors}
                                                        errorId="cap-price"
                                                        errorClass="govuk-input--error"
                                                        hideText
                                                        addFormGroupError={false}
                                                    >
                                                        <input
                                                            className="govuk-input govuk-input--width-4 govuk-currency-input__inner__input"
                                                            name="capPrice"
                                                            data-non-numeric
                                                            type="text"
                                                            aria-describedby="cap-price-hint"
                                                            id="cap-price"
                                                            defaultValue={userInput?.capDetails.price || ''}
                                                        />
                                                    </FormElementWrapper>
                                                </div>
                                            </div>
                                        </>
                                    </FormGroupWrapper>
                                </div>
                                <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                                    <FormGroupWrapper
                                        errors={errors}
                                        errorIds={['cap-period-duration-quantity', 'cap-period-duration-unit']}
                                    >
                                        <>
                                            <label className="govuk-label" htmlFor="cap-period-duration">
                                                Cap duration
                                            </label>
                                            <span className="govuk-hint" id="cap-duration-hint">
                                                For example, 3 days
                                            </span>

                                            <div className="govuk-input__wrapper expiry-selector-wrapper">
                                                <FormElementWrapper
                                                    errors={errors}
                                                    errorId="cap-period-duration-quantity"
                                                    errorClass="govuk-input--error"
                                                    hideText
                                                >
                                                    <input
                                                        className="govuk-input govuk-input--width-3"
                                                        name="capDuration"
                                                        type="text"
                                                        id="cap-period-duration-quantity"
                                                        aria-describedby="cap-duration-hint"
                                                        defaultValue={userInput?.capDetails.durationAmount || ''}
                                                    />
                                                </FormElementWrapper>
                                                <FormElementWrapper
                                                    errors={errors}
                                                    errorId="cap-duration-unit"
                                                    errorClass="govuk-select--error"
                                                    hideText
                                                >
                                                    {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                                                    <select
                                                        className="govuk-select govuk-select--width-3 expiry-selector-units"
                                                        name="capDurationUnits"
                                                        id="cap-duration-unit"
                                                        defaultValue={userInput?.capDetails.durationUnits || ''}
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
                                            </div>
                                        </>
                                    </FormGroupWrapper>
                                </div>
                            </div>
                        </fieldset>
                        <input type="hidden" name="id" value={editId} />
                        <input
                            type="submit"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button govuk-!-margin-left-3"
                        />
                    </div>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: CreateCapsProps }> => {
    const csrfToken = getCsrfToken(ctx);

    const capsAttribute = getSessionAttribute(ctx.req, CREATE_CAPS_ATTRIBUTE);
    let userInput = capsAttribute ? capsAttribute : undefined;
    const id = Number(ctx.query.id);
    const editId = Number.isInteger(id) ? id : undefined;
    const nocCode = getAndValidateNoc(ctx);

    if (editId && !userInput) {
        userInput = await getCapByNocAndId(nocCode, editId);
        if (!userInput) {
            throw new Error('No entity for this NOC matches the passed id');
        }
    }

    const errors = isWithErrors(capsAttribute) ? capsAttribute.errors : [];

    return {
        props: {
            errors,
            csrfToken,
            ...(userInput && { userInput }),
            ...(editId && { editId }),
        },
    };
};

export default CreateCaps;
