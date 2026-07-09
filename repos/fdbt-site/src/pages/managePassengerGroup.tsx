import upperFirst from 'lodash/upperFirst';
import { ReactElement } from 'react';
import InformationSummary from '../components/InformationSummary';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { GS_PASSENGER_GROUP_ATTRIBUTE } from '../constants/attributes';
import { getGroupPassengerTypeById, getPassengerTypesByNocCode } from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import { getAndValidateNoc } from '../utils';
import { getGlobalSettingsManageProps, GlobalSettingsManageProps } from '../utils/globalSettings';
import { getSessionAttribute } from '../utils/sessions';
import { GroupPassengerTypeDb, SinglePassengerType } from '../interfaces/dbTypes';

const title = 'Manage Passenger Group - Create Fares Data Service';
const description = 'Manage Passenger Group page of the Create Fares Data Service';

const editingInformationText =
    'Editing and saving new changes will be applied to all fares using this passenger group.';

interface ManagePassengerGroupProps extends GlobalSettingsManageProps<GroupPassengerTypeDb> {
    passengers: SinglePassengerType[];
}

const hasError = (errors: ErrorInfo[], name: string) => {
    if (errors.filter((e) => e.id === name).length > 0) {
        return ' govuk-form-group--error';
    }
    return '';
};

const findCorrectPassengerType = (inputs: GroupPassengerTypeDb | undefined, passenger: SinglePassengerType) => {
    return inputs?.groupPassengerType.companions.find((companion) => companion.id === passenger.id);
};

const ManagePassengerGroup = ({
    passengers,
    csrfToken,
    errors = [],
    inputs,
    editMode,
}: ManagePassengerGroupProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/managePassengerGroup" method="post" csrfToken={csrfToken}>
                <>
                    {editMode && errors.length === 0 ? (
                        <InformationSummary informationText={editingInformationText} />
                    ) : null}
                    <ErrorSummary errors={errors} />
                    <input type="hidden" name="groupId" value={inputs?.id} />
                    <h1 className="govuk-heading-xl" id="group-page-heading">
                        Provide passenger group details
                    </h1>
                    <div className={`govuk-form-group${hasError(errors, 'max-group-size')}`} id="max-group-size-header">
                        <label htmlFor="max-group-size">
                            <h1 className="govuk-heading-m" id="group-size-heading">
                                How many passengers can use this ticket at one time?
                            </h1>
                        </label>

                        <p className="govuk-hint" id="group-size-example">
                            We need to know the maximum size of the group of passengers that can use this ticket at one
                            time. Example: Up to 5 passengers at a time would require an input of 5
                        </p>
                        <FormElementWrapper errors={errors} errorId="max-group-size" errorClass="govuk-input--error">
                            <input
                                className="govuk-input govuk-input--width-2"
                                id="max-group-size"
                                name="maxGroupSize"
                                type="text"
                                defaultValue={inputs?.groupPassengerType.maxGroupSize || ''}
                            />
                        </FormElementWrapper>
                    </div>

                    <div className={`govuk-form-group${hasError(errors, 'passenger-type-0')}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="passenger-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                <h1 className="govuk-fieldset__heading" id="passenger-type-page-heading">
                                    Which type of passengers can use this ticket?
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="passenger-type-hint">
                                Select the passenger types included in your group ticket.
                            </span>
                            <FormElementWrapper
                                errors={errors}
                                errorId="passenger-type-0"
                                errorClass="govuk-checkboxes--error"
                            >
                                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                    {passengers.map(
                                        (passenger, index): ReactElement => (
                                            <div key={passenger.id}>
                                                <div className="govuk-checkboxes__item" key={passenger.id}>
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`passenger-type-${index}`}
                                                        name="passengerTypes"
                                                        type="checkbox"
                                                        value={passenger.id}
                                                        data-aria-controls={`conditional-input-${index}`}
                                                        defaultChecked={!!findCorrectPassengerType(inputs, passenger)}
                                                    />
                                                    <label
                                                        className="govuk-label govuk-checkboxes__label"
                                                        htmlFor={`passenger-type-${index}`}
                                                    >
                                                        {upperFirst(`${passenger.name}`)}
                                                    </label>
                                                </div>
                                                <div
                                                    className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden"
                                                    id={`conditional-input-${index}`}
                                                >
                                                    <label htmlFor={`maximum-passengers-${passenger.name}`}>
                                                        <h1 className="govuk-heading-s" id="individual-limit-heading">
                                                            We need to know how many passengers can use this at one time
                                                        </h1>
                                                    </label>
                                                    <div className="govuk-form-group">
                                                        <label
                                                            className="govuk-label"
                                                            htmlFor={`minimum-passengers-${passenger.id}`}
                                                        >
                                                            Minimum (optional)
                                                        </label>
                                                        <input
                                                            className="govuk-input govuk-!-width-one-third"
                                                            id={`minimum-passengers-${passenger.id}`}
                                                            name={`minimumPassengers${passenger.id}`}
                                                            data-test-id={'minimum-passengers'}
                                                            defaultValue={
                                                                findCorrectPassengerType(inputs, passenger)
                                                                    ?.minNumber ?? ''
                                                            }
                                                        />
                                                    </div>
                                                    <div className="govuk-form-group">
                                                        <label
                                                            className="govuk-label"
                                                            htmlFor={`maximum-passengers-${passenger.id}`}
                                                        >
                                                            Maximum (required)
                                                        </label>
                                                        <input
                                                            className="govuk-input govuk-!-width-one-third"
                                                            id={`maximum-passengers-${passenger.id}`}
                                                            name={`maximumPassengers${passenger.id}`}
                                                            data-test-id={'maximum-passengers'}
                                                            defaultValue={
                                                                findCorrectPassengerType(inputs, passenger)
                                                                    ?.maxNumber ?? ''
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <input
                                                    type="hidden"
                                                    name={`passengerType${passenger.id}`}
                                                    value={passenger.name}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <div
                        className={`govuk-form-group${hasError(errors, 'passenger-group-name')}`}
                        id="passenger-group-name"
                    >
                        <label htmlFor="passenger-group-name">
                            <h1 className="govuk-heading-m" id="passenger-group-name-heading">
                                Provide a name for your group
                            </h1>
                        </label>

                        <p className="govuk-hint" id="group-name-hint">
                            50 characters maximum
                        </p>
                        <FormElementWrapper
                            errors={errors}
                            errorId="passenger-group-name"
                            errorClass="govuk-input--error"
                        >
                            <input
                                className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                id="passenger-group-name"
                                name="passengerGroupName"
                                type="text"
                                maxLength={50}
                                defaultValue={inputs?.name || ''}
                            />
                        </FormElementWrapper>
                    </div>
                    <input
                        type="submit"
                        value={`${editMode ? 'Update' : 'Add'} passenger group`}
                        id="continue-button"
                        className="govuk-button"
                    />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ManagePassengerGroupProps }> => {
    const userInputsAndErrors = getSessionAttribute(ctx.req, GS_PASSENGER_GROUP_ATTRIBUTE);
    const nationalOperatorCode = getAndValidateNoc(ctx);
    const passengers = await getPassengerTypesByNocCode(nationalOperatorCode, 'single');

    const props = await getGlobalSettingsManageProps(ctx, getGroupPassengerTypeById, userInputsAndErrors);

    return {
        props: {
            ...props.props,
            passengers,
        },
    };
};

export default ManagePassengerGroup;
