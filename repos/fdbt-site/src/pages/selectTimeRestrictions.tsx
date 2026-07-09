import { ReactElement } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo, NextPageContextWithSession, PremadeTimeRestriction } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { getTimeRestrictionByNocCode } from '../data/auroradb';
import { TimeRestrictionCardBody } from './viewTimeRestrictions';
import { getSessionAttribute } from '../utils/sessions';
import {
    FULL_TIME_RESTRICTIONS_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
} from '../constants/attributes';
import BackButton from '../components/BackButton';

const title = 'Select Time Restrictions - Create Fares Data Service';
const description = 'Select Time Restrictions page of the Create Fares Data Service';

interface SelectTimeRestrictionsProps {
    csrfToken: string;
    errors: ErrorInfo[];
    timeRestrictions: PremadeTimeRestriction[];
    selectedId: number | null;
    backHref: string;
    isEditing: boolean;
}

const SelectTimeRestrictions = ({
    csrfToken,
    errors,
    timeRestrictions,
    selectedId,
    backHref,
    isEditing,
}: SelectTimeRestrictionsProps): ReactElement => {
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <ErrorSummary errors={errors} />
            <CsrfForm action="/api/defineTimeRestrictions" method="post" csrfToken={csrfToken}>
                <>
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="contact-hint">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading">Are there time restrictions on your ticket?</h1>
                            </legend>

                            <div id="contact-hint" className="govuk-hint">
                                We need to know if your ticket(s) will have any time restrictions, for example select
                                yes if your ticket(s) can only be used on a certain day or during a certain time period.
                                If you have a premade time restriction, you can select it here.
                            </div>

                            <div className="govuk-warning-text">
                                <span className="govuk-warning-text__icon govuk-!-margin-top-1" aria-hidden="true">
                                    !
                                </span>
                                <strong className="govuk-warning-text__text">
                                    <span className="govuk-visually-hidden">Warning</span>
                                    You can create new time restrictions in your{' '}
                                    <a href="/viewTimeRestrictions">operator settings</a>.<br /> Don&apos;t worry you
                                    can navigate back to this page when you are finished.
                                </strong>
                            </div>

                            <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="valid-days-required"
                                        name="timeRestrictionChoice"
                                        type="radio"
                                        value="Premade"
                                        data-aria-controls="conditional-time-restriction"
                                        defaultChecked={
                                            errors.some((error) => error.id === 'time-restriction') ||
                                            (!!selectedId && isEditing)
                                        }
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="valid-days-required">
                                        Yes
                                    </label>
                                </div>

                                <div
                                    className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                    id="conditional-time-restriction"
                                >
                                    <div className="govuk-form-group card-row">
                                        {timeRestrictions.length ? (
                                            timeRestrictions.map((item) => (
                                                <TimeRestrictionCard
                                                    key={item.id}
                                                    timeRestriction={item}
                                                    selectedId={selectedId}
                                                />
                                            ))
                                        ) : (
                                            <p className="govuk-body govuk-error-message">
                                                <a href="/viewTimeRestrictions">
                                                    Create a time restriction in operator settings.
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="valid-days-not-required"
                                        name="timeRestrictionChoice"
                                        type="radio"
                                        value="no"
                                        defaultChecked={!selectedId}
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="valid-days-not-required"
                                    >
                                        No
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <input
                        type="submit"
                        value="Continue"
                        id="continue-button"
                        className="govuk-button govuk-!-margin-right-2"
                    />

                    <a className="govuk-button govuk-button--secondary" href="/viewTimeRestrictions">
                        Create new
                    </a>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

const TimeRestrictionCard = ({
    timeRestriction,
    selectedId,
}: {
    timeRestriction: PremadeTimeRestriction;
    selectedId: number | null;
}): ReactElement => {
    return (
        <div className="card">
            <div className="card__body time-restriction">
                <div className="govuk-radios">
                    <div className="govuk-radios__item card__selector">
                        <input
                            className="govuk-radios__input"
                            id={`${timeRestriction.name}-${timeRestriction.id}-radio`}
                            name="timeRestriction"
                            type="radio"
                            value={timeRestriction.name}
                            aria-label={timeRestriction.name}
                            defaultChecked={selectedId === timeRestriction.id}
                        />
                        <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`${timeRestriction.name}-${timeRestriction.id}-radio`}
                        >
                            <span className="govuk-visually-hidden">{`${timeRestriction.name}`}</span>
                        </label>
                    </div>
                </div>
                <TimeRestrictionCardBody entity={timeRestriction} />
            </div>
        </div>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: SelectTimeRestrictionsProps }> => {
    const csrfToken = getCsrfToken(ctx);

    let errors: ErrorInfo[] = [];

    const timeRestrictionsDefinition = getSessionAttribute(ctx.req, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE);

    if (timeRestrictionsDefinition && 'errors' in timeRestrictionsDefinition) {
        errors = timeRestrictionsDefinition.errors;
    }

    const nationalOperatorCode = getAndValidateNoc(ctx);

    const timeRestrictions = await getTimeRestrictionByNocCode(nationalOperatorCode);

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const selectedId =
        getSessionAttribute(ctx.req, FULL_TIME_RESTRICTIONS_ATTRIBUTE)?.id || ticket?.timeRestriction?.id || null;

    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const isEditing = !!ticket && !!matchingJsonMetaData;

    const backHref =
        ticket && matchingJsonMetaData
            ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                  matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
              }`
            : '';

    return { props: { csrfToken, errors, timeRestrictions, selectedId, backHref, isEditing } };
};

export default SelectTimeRestrictions;
