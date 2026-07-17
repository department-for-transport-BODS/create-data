import { ReactElement } from 'react';
import kebabCase from 'lodash/kebabCase';
import { BaseLayout } from '../layout/Layout';
import { NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { GS_PURCHASE_METHOD_ATTRIBUTE } from '../constants/attributes';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { sentenceCaseString } from '../utils';
import { GlobalSettingsManageProps, getGlobalSettingsManageProps } from '../utils/globalSettings';
import { getSalesOfferPackageByIdAndNoc } from '../data/auroradb';
import InformationSummary from '../components/InformationSummary';
import { FromDb, SalesOfferPackage } from '../interfaces/matchingJsonTypes';
import BackButton from '../components/BackButton';

const title = 'Manage Purchase Methods - Create Fares Data Service';
const description = 'Manage Purchase Methods page of the Create Fares Data Service';

const editingInformationText =
    'Editing and saving new changes will be applied to all fares using this purchase method.';

// DistributionChannelType

export const purchaseLocationsList = (isCapped = false): { id: string; method: string[] } => {
    return {
        id: 'checkbox-0-on-board',
        method: isCapped ? ['onBoard', 'mobileDevice'] : ['onBoard', 'online', 'mobileDevice', 'postal', 'agency'],
    };
};

export const paymentMethodsList = (isCapped = false): { id: string; paymentMethods: string[] } => {
    return {
        id: isCapped ? 'checkbox-0-debit-card' : 'checkbox-0-cash',
        paymentMethods: isCapped
            ? ['debitCard', 'creditCard', 'mobilePhone', 'contactlessTravelCard']
            : ['cash', 'debitCard', 'creditCard', 'mobilePhone', 'cheque', 'directDebit', 'contactlessTravelCard'],
    };
};

export const ticketFormatsList = (
    isCapped = false,
): { id: string; ticketFormats: { value: string; display: string }[] } => {
    return {
        id: isCapped ? 'checkbox-0-mobile-app' : 'checkbox-0-paper-ticket',
        ticketFormats: isCapped
            ? [
                  { value: 'mobileApp', display: 'Mobile app' },
                  { value: 'smartCard', display: 'Smart card' },
                  { value: 'electronic_document', display: 'Digital' },
              ]
            : [
                  { value: 'paperTicket', display: 'Paper ticket' },
                  { value: 'mobileApp', display: 'Mobile app' },
                  { value: 'smartCard', display: 'Smart card' },
                  { value: 'electronic_document', display: 'Digital' },
              ],
    };
};

export type ManagePurchaseMethodsProps = GlobalSettingsManageProps<FromDb<SalesOfferPackage>> & { isCapped: boolean };

export const valuesMap: { [key: string]: string } = {
    agency: 'Travel Shop',
    contactlessTravelCard: 'Contactless SmartCard (e.g Oyster)',
};

const ManagePurchaseMethod = ({
    inputs,
    csrfToken,
    errors,
    editMode,
    isCapped,
}: ManagePurchaseMethodsProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            {editMode && errors.length === 0 ? (
                <>
                    <BackButton href="/viewPurchaseMethods"></BackButton>
                    <InformationSummary informationText={editingInformationText} />{' '}
                </>
            ) : null}
            <ErrorSummary errors={errors} />

            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/managePurchaseMethod" method="post" csrfToken={csrfToken}>
                        <>
                            <h1 className="govuk-heading-l">
                                Provide {isCapped ? 'capped' : ''} purchase method details
                            </h1>
                            {isCapped ? (
                                <span id="purchase-method-hint" className="govuk-hint">
                                    Capped purchase methods have fewer options than an ordinary purchase method, because
                                    they are the specific ways in which a passenger can purchase one of your capped
                                    products.
                                </span>
                            ) : null}
                            <span id="purchase-method-option-hint" className="govuk-hint">
                                Select at least one from each section below
                            </span>
                            <input type="hidden" name="id" value={inputs?.id} />
                            <input type="hidden" name="isCapped" value={String(isCapped)} />
                            <FormGroupWrapper errorIds={[purchaseLocationsList(isCapped).id]} errors={errors}>
                                <fieldset className="govuk-fieldset" aria-describedby="sop-purchase-locations">
                                    <legend
                                        className="govuk-fieldset__legend govuk-fieldset__legend--s"
                                        id="sop-purchase-locations"
                                    >
                                        Where can tickets be sold?
                                    </legend>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId={purchaseLocationsList(isCapped).id}
                                        errorClass="govuk-form-group--error"
                                    >
                                        <>
                                            {purchaseLocationsList(isCapped).method.map((purchaseLocation, index) => {
                                                const purchaseLocationId = kebabCase(purchaseLocation);
                                                return (
                                                    <div
                                                        className="govuk-checkboxes__item"
                                                        key={`checkbox-item-${purchaseLocationId}`}
                                                    >
                                                        <input
                                                            className="govuk-checkboxes__input"
                                                            id={`checkbox-${index}-${purchaseLocationId}`}
                                                            name="purchaseLocations"
                                                            type="checkbox"
                                                            value={purchaseLocation}
                                                            defaultChecked={inputs?.purchaseLocations.includes(
                                                                purchaseLocation,
                                                            )}
                                                        />
                                                        <label
                                                            className="govuk-label govuk-checkboxes__label"
                                                            htmlFor={`checkbox-${index}-${purchaseLocationId}`}
                                                        >
                                                            {valuesMap[purchaseLocation] ||
                                                                sentenceCaseString(purchaseLocation)}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    </FormElementWrapper>
                                </fieldset>
                            </FormGroupWrapper>
                            <FormGroupWrapper errorIds={[paymentMethodsList(isCapped).id]} errors={errors}>
                                <fieldset className="govuk-fieldset" aria-describedby="sop-payment-methods">
                                    <legend
                                        className="govuk-fieldset__legend govuk-fieldset__legend--s"
                                        id="sop-payment-methods"
                                    >
                                        How can tickets be paid for?
                                    </legend>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId={paymentMethodsList(isCapped).id}
                                        errorClass="govuk-form-group--error"
                                    >
                                        <>
                                            {paymentMethodsList(isCapped).paymentMethods.map((paymentMethod, index) => {
                                                const paymentMethodId = kebabCase(paymentMethod);
                                                return (
                                                    <div
                                                        className="govuk-checkboxes__item"
                                                        key={`checkbox-item-${paymentMethodId}`}
                                                    >
                                                        <input
                                                            className="govuk-checkboxes__input"
                                                            id={`checkbox-${index}-${paymentMethodId}`}
                                                            name="paymentMethods"
                                                            type="checkbox"
                                                            value={paymentMethod}
                                                            defaultChecked={inputs?.paymentMethods.includes(
                                                                paymentMethod,
                                                            )}
                                                        />
                                                        <label
                                                            className="govuk-label govuk-checkboxes__label"
                                                            htmlFor={`checkbox-${index}-${paymentMethodId}`}
                                                        >
                                                            {valuesMap[paymentMethod] ||
                                                                sentenceCaseString(paymentMethod)}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    </FormElementWrapper>
                                </fieldset>
                            </FormGroupWrapper>
                            <FormGroupWrapper errorIds={[ticketFormatsList(isCapped).id]} errors={errors}>
                                <fieldset className="govuk-fieldset" aria-describedby="sop-ticket-formats">
                                    <legend
                                        className="govuk-fieldset__legend govuk-fieldset__legend--s"
                                        id="sop-ticket-formats"
                                    >
                                        What format do the tickets come in?
                                    </legend>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId={ticketFormatsList(isCapped).id}
                                        errorClass="govuk-form-group--error"
                                    >
                                        <>
                                            {ticketFormatsList(isCapped).ticketFormats.map((ticketFormat, index) => {
                                                const ticketFormatId = kebabCase(ticketFormat.value);
                                                return (
                                                    <div
                                                        className="govuk-checkboxes__item"
                                                        key={`checkbox-item-${ticketFormatId}`}
                                                    >
                                                        <input
                                                            className="govuk-checkboxes__input"
                                                            id={`checkbox-${index}-${ticketFormatId}`}
                                                            name="ticketFormats"
                                                            type="checkbox"
                                                            value={ticketFormat.value}
                                                            defaultChecked={inputs?.ticketFormats.includes(
                                                                ticketFormat.value,
                                                            )}
                                                        />
                                                        <label
                                                            className="govuk-label govuk-checkboxes__label"
                                                            htmlFor={`checkbox-${index}-${ticketFormatId}`}
                                                        >
                                                            {ticketFormat.display}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    </FormElementWrapper>
                                </fieldset>
                            </FormGroupWrapper>
                            <FormGroupWrapper errorIds={['purchase-method-name']} errors={errors}>
                                <div className={`govuk-form-group`}>
                                    <label htmlFor="purchase-method-name">
                                        <h1 className="govuk-fieldset__legend govuk-fieldset__legend--s">
                                            Provide a name for your purchase method
                                        </h1>
                                    </label>

                                    <p className="govuk-hint" id="group-name-hint">
                                        50 characters maximum
                                    </p>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="purchase-method-name"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                            id="purchase-method-name"
                                            name="name"
                                            type="text"
                                            maxLength={50}
                                            defaultValue={inputs?.name || ''}
                                        />
                                    </FormElementWrapper>
                                </div>
                            </FormGroupWrapper>
                            <input
                                type="submit"
                                value={`${editMode ? 'Update' : 'Add'} purchase method`}
                                id="continue-button"
                                className="govuk-button"
                            />
                        </>
                    </CsrfForm>
                </div>
                <div className="govuk-grid-column-one-third">
                    <h1 className="govuk-heading-s">What is a purchase method?</h1>
                    <p className="govuk-body">To create NeTEx for your fares, you need to provide the following:</p>
                    <ol className="govuk-body">
                        <li>Where a ticket can be bought</li>
                        <li>What payment methods can be used to buy a ticket</li>
                        <li>In what format a ticket will be used by passengers</li>
                    </ol>
                    <p className="govuk-body">
                        This combination of information is known as a <b>purchase method</b>.
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ManagePurchaseMethodsProps }> => {
    const globalSettingsProps = await getGlobalSettingsManageProps<FromDb<SalesOfferPackage>>(
        ctx,
        getSalesOfferPackageByIdAndNoc,
        getSessionAttribute(ctx.req, GS_PURCHASE_METHOD_ATTRIBUTE),
    );

    const isCapped = ctx.query.isCapped && ctx.query.isCapped === 'true' ? true : false;
    return { props: { ...globalSettingsProps.props, isCapped } };
};

export default ManagePurchaseMethod;
