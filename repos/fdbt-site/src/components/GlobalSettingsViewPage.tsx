import { capitalize } from 'lodash';
import { FunctionComponent, ReactElement, useState } from 'react';
import { ErrorInfo } from '../interfaces';
import DeleteConfirmationPopup from '../components/DeleteConfirmationPopup';
import { BaseLayout } from '../layout/Layout';
import SubNavigation from '../layout/SubNavigation';
import ErrorSummary from './ErrorSummary';

type Entity = { id: number; name: string };

interface GlobalSettingsViewPageProps<T extends Entity> {
    csrfToken: string;
    entities: T[];
    referer: string | null;
    title: string;
    description: string;
    entityDescription: string;
    CardBody: FunctionComponent<{ entity: T }>;
    errors?: ErrorInfo[];
}

export const GlobalSettingsViewPage = <T extends Entity>({
    entities,
    referer,
    csrfToken,
    title,
    description,
    entityDescription,
    CardBody,
    errors = [],
}: GlobalSettingsViewPageProps<T>): ReactElement => {
    const entityUrl = entityDescription
        .split(' ')
        .map((it) => capitalize(it))
        .join('');

    const [popUpState, setPopUpState] = useState<{ entityId: number; entityName: string }>();

    const deleteActionHandler = (id: number, name: string): void => {
        setPopUpState({ entityId: id, entityName: name });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };

    const buildDeleteUrl = (idToDelete: number, csrfToken: string): string => {
        return `/api/delete${entityUrl}?id=${idToDelete}&_csrf=${csrfToken}`;
    };

    const noEntities = () => (
        <div className="govuk-heading-m">
            <p className="govuk-body">
                <em>You currently have no {entityDescription}s saved.</em>
            </p>
            <a className="govuk-button" data-module="govuk-button" href={`/manage${entityUrl}`}>
                Add a {entityDescription}
            </a>
        </div>
    );

    const cards = () => (
        <>
            <div className="card-row">
                {entities.map((entity) => (
                    <div className="card" key={entity.id} id={`${entity.id}`}>
                        <div className={'card__body ' + entityDescription.replace(/ /g, '-')}>
                            <div className="card__actions">
                                <ul className="actions__list">
                                    <li className="actions__item">
                                        <a
                                            className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular"
                                            href={`/manage${entityUrl}?id=${entity.id}`}
                                        >
                                            Edit
                                        </a>
                                    </li>

                                    <li className="actions__item">
                                        <button
                                            className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular actions__delete"
                                            onClick={() => {
                                                deleteActionHandler(entity.id, entity.name);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {<CardBody entity={entity} />}
                        </div>
                    </div>
                ))}
            </div>

            <a className="govuk-button" data-module="govuk-button" href={`/manage${entityUrl}`}>
                Add a {entityDescription}
            </a>
        </>
    );

    return (
        <BaseLayout title={title} description={description} showNavigation referer={referer}>
            <div>
                <ErrorSummary errors={errors} />
            </div>
            <div className="govuk-width-container" data-card-count={entities.length}>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                        <SubNavigation />
                    </div>

                    <div className="govuk-grid-column-three-quarters">
                        <h1 className="govuk-heading-xl">{title}</h1>
                        <p className="govuk-body govuk-!-margin-bottom-8">{description}</p>

                        {entities.length ? cards() : noEntities()}

                        {popUpState && (
                            <DeleteConfirmationPopup
                                entityName={popUpState.entityName}
                                deleteUrl={buildDeleteUrl(popUpState.entityId, csrfToken)}
                                cancelActionHandler={cancelActionHandler}
                                isOpen={!!popUpState.entityId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};
