import { ReactElement, useState } from 'react';
import DeleteConfirmationPopup from '../components/DeleteConfirmationPopup';
import { getOperatorGroupsByNoc } from '../data/auroradb';
import { NextPageContextWithSession, OperatorGroup, ErrorInfo } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import SubNavigation from '../layout/SubNavigation';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import {
    GS_OPERATOR_GROUP_ATTRIBUTE,
    MANAGE_OPERATOR_GROUP_ERRORS_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    VIEW_OPERATOR_GROUP_ERRORS,
} from '../constants/attributes';
import OperatorGroupCard from '../components/OperatorGroupCard';
import ErrorSummary from '../components/ErrorSummary';
import { FromDb } from '../interfaces/matchingJsonTypes';

const title = 'Operator Groups - Create Fares Data Service';
const description = 'View and edit your operator groups.';

interface ViewOperatorGroupsProps {
    csrfToken: string;
    operatorGroups: FromDb<OperatorGroup>[];
    referer: string | null;
    viewOperatorGroupErrors: ErrorInfo[];
}

const ViewOperatorGroups = ({
    operatorGroups,
    csrfToken,
    referer,
    viewOperatorGroupErrors,
}: ViewOperatorGroupsProps): ReactElement => {
    const [popUpState, setPopUpState] = useState<{
        operatorGroupName: string;
        operatorGroupId: number;
    }>();

    const deleteActionHandler = (id: number, name: string): void => {
        setPopUpState({
            ...popUpState,
            operatorGroupName: name,
            operatorGroupId: id,
        });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };

    const buildDeleteUrl = (idToDelete: number, csrfToken: string): string => {
        return `/api/deleteOperatorGroup?id=${idToDelete}&_csrf=${csrfToken}`;
    };

    return (
        <BaseLayout title={title} description={description} showNavigation referer={referer}>
            <div>
                <ErrorSummary errors={viewOperatorGroupErrors} />
            </div>
            <div
                className="govuk-grid-row"
                data-card-count={operatorGroups.length}
                // eslint-disable-next-line react/no-unknown-property
                operator-groups={operatorGroups.map((element) => element.name).toString()}
            >
                <div className="govuk-grid-column-one-quarter">
                    <SubNavigation />
                </div>

                <div className="govuk-grid-column-three-quarters">
                    <h1 className="govuk-heading-xl">Operator Groups</h1>
                    <p className="govuk-body govuk-!-margin-bottom-8">
                        Define a group of operators for use in a multi-operator product.
                    </p>

                    <div>
                        {!operatorGroups.length ? (
                            <>
                                <NoOperatorGroups />
                                <a
                                    className="govuk-button govuk-button"
                                    data-module="govuk-button"
                                    href="/searchOperators"
                                    aria-disabled
                                >
                                    Add an operator group
                                </a>
                            </>
                        ) : (
                            <div>
                                <div className="card-row">
                                    {operatorGroups.map((operatorGroup, index) => (
                                        <OperatorGroupCard
                                            index={index}
                                            operatorGroup={operatorGroup}
                                            key={operatorGroup.id.toString()}
                                            defaultChecked={false}
                                            deleteActionHandler={deleteActionHandler}
                                        />
                                    ))}
                                </div>
                                <a className="govuk-button" data-module="govuk-button" href="/searchOperators">
                                    Add an operator group
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {popUpState && (
                    <DeleteConfirmationPopup
                        entityName={popUpState.operatorGroupName}
                        deleteUrl={buildDeleteUrl(popUpState.operatorGroupId, csrfToken)}
                        cancelActionHandler={cancelActionHandler}
                        isOpen={!!popUpState.operatorGroupId}
                    />
                )}
            </div>
        </BaseLayout>
    );
};

const NoOperatorGroups = (): ReactElement => {
    return (
        <p className="govuk-body">
            <em>You currently have no operator groups saved.</em>
        </p>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ViewOperatorGroupsProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const nationalOperatorCode = getAndValidateNoc(ctx);
    const operatorGroups = await getOperatorGroupsByNoc(nationalOperatorCode);
    const viewOperatorGroup = getSessionAttribute(ctx.req, VIEW_OPERATOR_GROUP_ERRORS);

    updateSessionAttribute(ctx.req, GS_OPERATOR_GROUP_ATTRIBUTE, undefined);
    updateSessionAttribute(ctx.req, MANAGE_OPERATOR_GROUP_ERRORS_ATTRIBUTE, undefined);
    updateSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE, undefined);
    updateSessionAttribute(ctx.req, VIEW_OPERATOR_GROUP_ERRORS, undefined);

    return {
        props: {
            csrfToken,
            operatorGroups,
            referer: extractGlobalSettingsReferer(ctx),
            viewOperatorGroupErrors: viewOperatorGroup || [],
        },
    };
};

export default ViewOperatorGroups;
