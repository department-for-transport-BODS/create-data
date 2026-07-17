import { ReactElement, useState } from 'react';
import ErrorSummary from '../components/ErrorSummary';
import DeleteConfirmationPopup from '../components/DeleteConfirmationPopup';
import PassengerTypeCard from '../components/PassengerTypeCard';
import UnableToDeletePopup from '../components/UnableToDeletePopup';
import {
    GS_PASSENGER_GROUP_ATTRIBUTE,
    MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    VIEW_PASSENGER_TYPE_ERRORS,
} from '../constants/attributes';
import { getGroupPassengerTypesFromGlobalSettings, getPassengerTypesByNocCode } from '../data/auroradb';
import { BaseLayout } from '../layout/Layout';
import SubNavigation from '../layout/SubNavigation';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { SinglePassengerType, FullGroupPassengerType } from '../interfaces/dbTypes';

const title = 'Passenger Types - Create Fares Data Service';
const description = 'View and edit your passenger types.';

interface PassengerTypeProps {
    csrfToken: string;
    singlePassengerTypes: SinglePassengerType[];
    groupPassengerTypes: FullGroupPassengerType[];
    referer: string | null;
    viewPassengerTypeErrors: ErrorInfo[];
}

const ViewPassengerTypes = ({
    singlePassengerTypes,
    groupPassengerTypes,
    csrfToken,
    referer,
    viewPassengerTypeErrors = [],
}: PassengerTypeProps): ReactElement => {
    const [popUpState, setPopUpState] = useState<{
        passengerTypeName: string;
        passengerTypeId: number;
        isGroup: boolean;
        groupsInUse?: string[];
    }>();

    const deleteActionHandler = (id: number, name: string, isGroup: boolean): void => {
        const groupsInUse = groupPassengerTypes.flatMap((group) =>
            group.groupPassengerType.companions.some((individual) => individual.name === name) ? group.name : [],
        );

        setPopUpState({
            ...popUpState,
            passengerTypeName: name,
            passengerTypeId: id,
            isGroup,
            groupsInUse,
        });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };

    const buildDeleteUrl = (isGroup: boolean, idToDelete: number, csrfToken: string): string => {
        return `/api/deletePassenger?id=${idToDelete}&isGroup=${isGroup}&_csrf=${csrfToken}`;
    };

    return (
        <BaseLayout title={title} description={description} showNavigation referer={referer}>
            <div>
                <ErrorSummary errors={viewPassengerTypeErrors} />
            </div>
            <div className="govuk-grid-row" data-card-count={singlePassengerTypes.length + groupPassengerTypes.length}>
                <div className="govuk-grid-column-one-quarter">
                    <SubNavigation />
                </div>

                <div className="govuk-grid-column-three-quarters">
                    <h1 className="govuk-heading-xl">Passenger types</h1>
                    <p className="govuk-body govuk-!-margin-bottom-8">
                        Define age range and required proof documents of your passengers as well as passenger groups.
                    </p>

                    <div>
                        {!singlePassengerTypes.length ? (
                            <NoIndividualPassengerTypes />
                        ) : (
                            <IndividualPassengerTypes
                                singlePassengerTypes={singlePassengerTypes}
                                deleteActionHandler={deleteActionHandler}
                            />
                        )}

                        <a className="govuk-button" data-module="govuk-button" href="/managePassengerTypes">
                            Add a passenger type
                        </a>
                    </div>

                    <div className="govuk-!-margin-top-4">
                        {!groupPassengerTypes.length ? (
                            <NoPassengerTypeGroups />
                        ) : (
                            <PassengerTypeGroups
                                deleteActionHandler={deleteActionHandler}
                                passengerTypeGroups={groupPassengerTypes}
                            />
                        )}

                        {singlePassengerTypes.length ? (
                            <a className="govuk-button" data-module="govuk-button" href="/managePassengerGroup">
                                Add a passenger group
                            </a>
                        ) : (
                            ''
                        )}
                    </div>

                    {popUpState &&
                        (popUpState.groupsInUse?.length ? (
                            <UnableToDeletePopup
                                {...popUpState}
                                csrfToken={csrfToken}
                                cancelActionHandler={cancelActionHandler}
                                isOpen={popUpState.groupsInUse?.length > 0}
                            />
                        ) : (
                            <DeleteConfirmationPopup
                                entityName={popUpState.passengerTypeName}
                                deleteUrl={buildDeleteUrl(popUpState.isGroup, popUpState.passengerTypeId, csrfToken)}
                                cancelActionHandler={cancelActionHandler}
                                isOpen={!!popUpState.passengerTypeId}
                            />
                        ))}
                </div>
            </div>
        </BaseLayout>
    );
};

const NoIndividualPassengerTypes = (): ReactElement => {
    return (
        <>
            <h2 className="govuk-heading-l">Individual</h2>
            <p className="govuk-body">
                <em>You currently have no passenger types saved.</em>
            </p>
        </>
    );
};

interface IndividualPassengerTypesProps {
    singlePassengerTypes: SinglePassengerType[];
    deleteActionHandler: (id: number, name: string, isGroup: boolean) => void;
}

const IndividualPassengerTypes = ({
    singlePassengerTypes,
    deleteActionHandler,
}: IndividualPassengerTypesProps): ReactElement => {
    return (
        <>
            <h2 className="govuk-heading-l">Individual</h2>

            <div className="card-row">
                {singlePassengerTypes.map((singlePassengerType, index) => (
                    <PassengerTypeCard
                        contents={singlePassengerType}
                        index={index}
                        deleteActionHandler={deleteActionHandler}
                        key={singlePassengerType.id.toString()}
                        defaultChecked={false}
                    />
                ))}
            </div>
        </>
    );
};

const NoPassengerTypeGroups = (): ReactElement => {
    return (
        <>
            <h2 className="govuk-heading-l">Groups</h2>

            <div className="govuk-inset-text">
                Individual passengers must be created before they can be added to a group.
            </div>

            <p className="govuk-body">
                <em>You currently have no passenger groups saved.</em>
            </p>
        </>
    );
};

interface PassengerTypeGroupProps {
    deleteActionHandler: (id: number, name: string, isGroup: boolean) => void;
    passengerTypeGroups: FullGroupPassengerType[];
}

const PassengerTypeGroups = ({ deleteActionHandler, passengerTypeGroups }: PassengerTypeGroupProps): ReactElement => {
    return (
        <>
            <h2 className="govuk-heading-l">Groups</h2>

            <div className="card-row">
                {passengerTypeGroups.map((passengerTypeGroup, index) => (
                    <PassengerTypeCard
                        contents={passengerTypeGroup}
                        index={index}
                        deleteActionHandler={deleteActionHandler}
                        key={passengerTypeGroup.id}
                        defaultChecked={false}
                    />
                ))}
            </div>
        </>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: PassengerTypeProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const nationalOperatorCode = getAndValidateNoc(ctx);
    const singlePassengerTypes = await getPassengerTypesByNocCode(nationalOperatorCode, 'single');
    const groupPassengerTypes = await getGroupPassengerTypesFromGlobalSettings(nationalOperatorCode);
    const viewPassengerType = getSessionAttribute(ctx.req, VIEW_PASSENGER_TYPE_ERRORS);

    updateSessionAttribute(ctx.req, GS_PASSENGER_GROUP_ATTRIBUTE, undefined);
    updateSessionAttribute(ctx.req, MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE, undefined);
    updateSessionAttribute(ctx.req, VIEW_PASSENGER_TYPE_ERRORS, undefined);

    return {
        props: {
            csrfToken,
            singlePassengerTypes: singlePassengerTypes,
            groupPassengerTypes,
            referer: extractGlobalSettingsReferer(ctx),
            viewPassengerTypeErrors: viewPassengerType || [],
        },
    };
};

export default ViewPassengerTypes;
