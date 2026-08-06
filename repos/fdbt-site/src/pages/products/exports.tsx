import React, { ReactElement, useState } from 'react';
import { ErrorInfo, NextPageContextWithSession } from '../../interfaces';
import { BaseLayout } from '../../layout/Layout';
import { formatFailedFileNames, getAndValidateNoc, getCsrfToken } from '../../utils';
import CsrfForm from '../../components/CsrfForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllProductsByNoc as getAllProductsByNoc } from '../../data/auroradb';
import useSWR from 'swr';
import { Export } from '../api/getExportProgress';
import InfoPopup from '../../components/InfoPopup';
import ErrorSummary from '../../components/ErrorSummary';
import InformationSummary from '../../components/InformationSummary';
import DeleteConfirmationPopup from '../../components/DeleteConfirmationPopup';

const title = 'Exports';
const description = 'Export your products into NeTEx.';
const fetcher = (input: RequestInfo, init: RequestInit) => fetch(input, init).then((res) => res.json());

interface GlobalSettingsProps {
    csrf: string;
    operatorHasProducts: boolean;
}

const getTag = (exportDetails: Export): ReactElement => {
    if (exportDetails.netexCount === 0) {
        return (
            <strong className="govuk-tag govuk-tag--blue">
                {`Loading products (${exportDetails.numberOfFilesExpected})`}
            </strong>
        );
    }

    if (exportDetails.netexCount === exportDetails.numberOfFilesExpected) {
        if (exportDetails.signedUrl) {
            return (
                <strong className="govuk-tag govuk-tag--green">{`Export complete ${exportDetails.netexCount} / ${exportDetails.numberOfFilesExpected}`}</strong>
            );
        }
        return (
            <strong className="govuk-tag govuk-tag--blue">{`Export zipping ${exportDetails.netexCount} / ${exportDetails.numberOfFilesExpected}`}</strong>
        );
    }

    if (exportDetails.exportFailed) {
        const numberOfFilesMissing = exportDetails.numberOfFilesExpected - exportDetails.netexCount;
        return (
            <strong className="govuk-tag govuk-tag--red">{`Export failed - ${numberOfFilesMissing} ${
                numberOfFilesMissing > 0 ? 'files' : 'file'
            } failed`}</strong>
        );
    }

    return (
        <strong className="govuk-tag govuk-tag--blue">{`In progress ${exportDetails.netexCount} / ${exportDetails.numberOfFilesExpected}`}</strong>
    );
};

const getExportAction = (
    exportDetails: Export,
    setFailedFilesPopup: React.Dispatch<React.SetStateAction<{ failedValidationFilenames: string[] } | undefined>>,
    csrf: string,
    deleteActionHandler?: (name: string) => void,
) => {
    if (exportDetails.signedUrl && !exportDetails.exportFailed) {
        return (
            <>
                <div>
                    <a href={exportDetails.signedUrl} className="govuk-link govuk-body">
                        Download file
                    </a>
                </div>
                {deleteActionHandler ? (
                    <div>
                        <button
                            type="button"
                            id={`delete-${exportDetails.name}`}
                            className="govuk-link govuk-body button-link"
                            onClick={() => deleteActionHandler(exportDetails.name)}
                        >
                            Delete export
                        </button>
                    </div>
                ) : null}
            </>
        );
    }
    if (exportDetails.failedValidationFilenames.length > 0) {
        return (
            <button
                className="govuk-button margin-bottom-0"
                onClick={() => {
                    setFailedFilesPopup({
                        failedValidationFilenames: exportDetails.failedValidationFilenames,
                    });
                }}
            >
                {' '}
                View failure details
            </button>
        );
    }
    if (!exportDetails.signedUrl && !exportDetails.exportFailed) {
        return (
            <CsrfForm csrfToken={csrf} method={'post'} action={'/api/deleteExport'}>
                <input type="hidden" name="exportName" value={exportDetails.name} />
                <button type="submit" className="govuk-button govuk-button--warning">
                    Cancel export in progress
                </button>
            </CsrfForm>
        );
    } else {
        return null;
    }
};

const Exports = ({ csrf, operatorHasProducts }: GlobalSettingsProps): ReactElement => {
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [deletePopUpState, setDeletePopUpState] = useState<{
        name: string;
    }>();
    const [failedFilesPopup, setFailedFilesPopup] = useState<{ failedValidationFilenames: string[] } | undefined>(
        undefined,
    );
    const [exportErrorState, setExportErrorState] = useState<ErrorInfo | undefined>(undefined);

    const deleteActionHandler = (exportName: string): void => {
        setDeletePopUpState({
            name: exportName,
        });
    };

    const { data } = useSWR('/api/getExportProgress', fetcher, {
        refreshInterval: 3000,
        refreshWhenHidden: true,
    });

    const exports: Export[] | undefined = data?.exports;

    const exportInProgress: Export | undefined = exports
        ? exports.find((exportDetails) => !exportDetails.signedUrl && !exportDetails.exportFailed)
        : undefined;

    const anExportIsInProgress = !!exportInProgress;

    const exportButtonActionHandler = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        isExportInProgress: boolean,
        buttonId: 'export-all-button' | 'select-exports-button',
    ): void => {
        if (isExportInProgress) {
            e.preventDefault();
            setExportErrorState({
                id: buttonId,
                errorMessage:
                    'A new export cannot be started until the current export has finished. Please wait and try again later.',
            });
        } else {
            if (buttonId === 'export-all-button') {
                setShowExportPopup(true);
            }
        }
    };

    return (
        <>
            <BaseLayout title={title} description={description} showNavigation>
                <div className="govuk-grid-row">
                    {!!exportErrorState && (
                        <>
                            <ErrorSummary
                                errors={[
                                    {
                                        id: exportErrorState.id,
                                        errorMessage: exportErrorState.errorMessage,
                                    },
                                ]}
                            />
                        </>
                    )}
                    {anExportIsInProgress && <InformationSummary informationText={'Export in progress.'} />}
                    <div className="govuk-grid-column-full">
                        <div className="dft-flex dft-flex-justify-space-between">
                            <h1 className="govuk-heading-xl">Export your data</h1>{' '}
                            <div>
                                <CsrfForm csrfToken={csrf} method={'post'} action={'/api/exports'}>
                                    <button
                                        id="export-all-button"
                                        type="submit"
                                        className={`govuk-button${
                                            !operatorHasProducts ? ' govuk-visually-hidden' : ''
                                        }`}
                                        onClick={(e) =>
                                            exportButtonActionHandler(e, anExportIsInProgress, 'export-all-button')
                                        }
                                    >
                                        Export all fares
                                    </button>
                                </CsrfForm>
                                <a href="/products/selectExports">
                                    <button
                                        id="select-exports-button"
                                        type="button"
                                        className={`govuk-button${
                                            !operatorHasProducts ? ' govuk-visually-hidden' : ''
                                        }`}
                                        onClick={(e) =>
                                            exportButtonActionHandler(e, anExportIsInProgress, 'select-exports-button')
                                        }
                                    >
                                        Select products to export
                                    </button>
                                </a>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                {!operatorHasProducts ? (
                                    <div className="govuk-inset-text govuk-!-margin-top-0">
                                        Export is disabled as you have no products.
                                    </div>
                                ) : null}
                                <p className="govuk-body-m govuk-!-margin-bottom-9">
                                    This will export all of your current active products and any pending products. Any
                                    products flagged with ‘Needs Attention’ will be exported but may not be correct.
                                    Incomplete products, expired products, or products for expired services will not be
                                    included in the export. Once your export is complete, it will appear in the list
                                    below and you can download this and upload it to{' '}
                                    <a href="https://publish.bus-data.dft.gov.uk/">BODS</a>.
                                </p>
                            </div>
                        </div>

                        <h2 className="govuk-heading-m govuk-!-margin-bottom-6">Previously exported fares</h2>

                        {!exports ? (
                            <LoadingSpinner />
                        ) : exports.length === 0 ? (
                            <p className="govuk-body-m">
                                <em>You currently have no exports</em>
                            </p>
                        ) : (
                            <table className="govuk-table">
                                <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">
                                            Export name
                                        </th>
                                        <th scope="col" className="govuk-table__header">
                                            Export status
                                        </th>
                                        <th scope="col" className="govuk-table__header">
                                            <span className="govuk-visually-hidden">Actions</span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="govuk-table__body">
                                    {exports?.map((exportDetails) => {
                                        return (
                                            <tr className="govuk-table__row" key={exportDetails.name}>
                                                <td className="govuk-table__cell">{exportDetails.name}</td>
                                                <td className="govuk-table__cell">{getTag(exportDetails)}</td>
                                                <td className="govuk-table__cell">
                                                    {getExportAction(
                                                        exportDetails,
                                                        setFailedFilesPopup,
                                                        csrf,
                                                        deleteActionHandler,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {showExportPopup && (
                            <InfoPopup
                                title="We are preparing your export"
                                text="Your export will take a few seconds to show in the table below."
                                okActionHandler={() => setShowExportPopup(false)}
                                isOpen={showExportPopup}
                            />
                        )}

                        {!!failedFilesPopup && (
                            <div className="popup">
                                <div className="popup__content">
                                    <h1 className="govuk-heading-m govuk-!-margin-bottom-8">
                                        Product names of invalid NeTEx files
                                    </h1>

                                    <p className="govuk-body-m govuk-!-margin-bottom-8">
                                        {formatFailedFileNames(failedFilesPopup.failedValidationFilenames)}
                                    </p>

                                    <span className="govuk-hint" id="info-hint">
                                        Use the contact link at the bottom of the screen to let us know.
                                    </span>

                                    <span className="govuk-hint" id="info-hint">
                                        If you want to fix your export, use the &apos;Cancel&apos; button and then
                                        &apos;Select products to export&apos; button to exclude the failing products.
                                    </span>

                                    <button className="govuk-button" onClick={() => setFailedFilesPopup(undefined)}>
                                        Ok
                                    </button>
                                </div>
                            </div>
                        )}

                        {deletePopUpState && (
                            <DeleteConfirmationPopup
                                entityName={deletePopUpState.name}
                                deleteUrl={`/api/deleteExport?_csrf=${csrf}`}
                                cancelActionHandler={(): void => {
                                    setDeletePopUpState(undefined);
                                }}
                                hintText="When you delete this export it will be removed from the system and will no longer be available to download."
                                isOpen={!!deletePopUpState.name}
                                hiddenInput={{ name: 'exportName', value: deletePopUpState.name }}
                            />
                        )}
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: GlobalSettingsProps }> => {
    const noc = getAndValidateNoc(ctx);
    const operatorHasProducts = (await getAllProductsByNoc(noc)).length > 0;

    return {
        props: {
            csrf: getCsrfToken(ctx),
            operatorHasProducts,
        },
    };
};

export default Exports;
