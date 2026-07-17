import { ReactElement } from 'react';
import { FullGroupPassengerType, SinglePassengerType } from '../interfaces/dbTypes';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import PassengerTypeCard from '../components/PassengerTypeCard';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../constants/attributes';
import { getGroupPassengerTypesFromGlobalSettings, getPassengerTypesByNocCode } from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { isPassengerType, isPassengerTypeAttributeWithErrors } from '../interfaces/typeGuards';
import TwoThirdsLayout from '../layout/Layout';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import BackButton from '../components/BackButton';

const title = 'Select Passenger Type - Create Fares Data Service';
const description = 'Select Passenger Type selection page of the Create Fares Data Service';

interface PassengerTypeProps {
    errors: ErrorInfo[];
    csrfToken: string;
    savedGroups: FullGroupPassengerType[];
    savedPassengerTypes: SinglePassengerType[];
    selectedId: number | null;
    backHref: string;
}

const SelectPassengerType = ({
    errors = [],
    csrfToken,
    savedGroups,
    savedPassengerTypes,
    selectedId,
    backHref,
}: PassengerTypeProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}

        <CsrfForm action="/api/selectPassengerType" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="passenger-type-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="passenger-type-page-heading">
                                Select a passenger type
                            </h1>
                        </legend>

                        <div className="govuk-warning-text">
                            <span className="govuk-warning-text__icon govuk-!-margin-top-1" aria-hidden="true">
                                !
                            </span>
                            <strong className="govuk-warning-text__text">
                                <span className="govuk-visually-hidden">Warning</span>
                                You can create new types in your{' '}
                                <a className="govuk-link" href="/viewPassengerTypes">
                                    operator settings.
                                </a>{' '}
                                <br />
                                Don&apos;t worry you can navigate back to this page when you are finished.
                            </strong>
                        </div>

                        {savedPassengerTypes.length === 0 ? (
                            <span className="govuk-body">
                                <i>You currently have no saved passenger types</i>
                            </span>
                        ) : (
                            <>
                                <h3 className="govuk-heading-m">Individuals</h3>

                                <div className="card-row" id="individual-passengers">
                                    {savedPassengerTypes.map((passengerType, index) => (
                                        <PassengerTypeCard
                                            defaultChecked={selectedId === passengerType.id}
                                            index={index}
                                            contents={passengerType}
                                            key={passengerType.id.toString()}
                                        />
                                    ))}
                                </div>

                                <h3 className="govuk-heading-m">Groups</h3>
                                <div className="card-row">
                                    {savedGroups.length ? (
                                        <>
                                            {savedGroups.map((passengerTypeGroup, index) => (
                                                <PassengerTypeCard
                                                    contents={passengerTypeGroup}
                                                    index={index}
                                                    key={passengerTypeGroup.id.toString()}
                                                    defaultChecked={selectedId === passengerTypeGroup.id}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <div className="govuk-grid-column-two-thirds">
                                            <p className="govuk-body">
                                                <em>You currently have no saved groups</em>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </fieldset>
                </div>
                {!!savedPassengerTypes.length && (
                    <input
                        type="submit"
                        value="Continue"
                        id="continue-button"
                        className="govuk-button govuk-!-margin-right-2"
                    />
                )}
                <a className="govuk-button govuk-button--secondary" href="/viewPassengerTypes">
                    Create new
                </a>
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: PassengerTypeProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const nationalOperatorCode = getAndValidateNoc(ctx);
    const singlePassengerTypes = await getPassengerTypesByNocCode(nationalOperatorCode, 'single');
    const groupPassengerTypes = await getGroupPassengerTypesFromGlobalSettings(nationalOperatorCode);
    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const selectedId =
        (isPassengerType(passengerTypeAttribute) && passengerTypeAttribute.id) || ticket?.passengerType.id || null;

    const errors: ErrorInfo[] =
        passengerTypeAttribute && isPassengerTypeAttributeWithErrors(passengerTypeAttribute)
            ? passengerTypeAttribute.errors
            : [];

    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const backHref =
        ticket && matchingJsonMetaData
            ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                  matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
              }`
            : '';

    return {
        props: {
            errors,
            csrfToken,
            savedGroups: groupPassengerTypes,
            savedPassengerTypes: singlePassengerTypes,
            selectedId,
            backHref,
        },
    };
};

export default SelectPassengerType;
