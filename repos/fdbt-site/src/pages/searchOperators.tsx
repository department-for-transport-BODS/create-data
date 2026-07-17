import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession, Operator, OperatorGroup } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { MULTIPLE_OPERATOR_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { getOperatorGroupByNocAndId, getSearchOperatorsBySearchText } from '../data/auroradb';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { removeExcessWhiteSpace } from '../utils/apiUtils/validator';
import { isSearchInputValid } from './api/searchOperators';
import { isMultipleOperatorAttributeWithErrors } from '../interfaces/typeGuards';
import { useState } from 'react';
import InformationSummary from '../components/InformationSummary';
import BackButton from '../components/BackButton';

const title = 'Search Operators - Create Fares Data Service';
const description = 'Search Operators page for the Create Fares Data Service';
const editingInformationText = 'Editing and saving new changes will be applied to all fares using this operator group.';
export const searchInputId = 'search-input';
export const addOperatorsErrorId = 'add-operator-0';
export const removeOperatorsErrorId = 'remove-operator-0';

export interface SearchOperatorProps {
    searchText: string;
    errors: ErrorInfo[];
    databaseSearchResults: Operator[];
    preSelectedOperators: Operator[];
    csrfToken: string;
    editMode: boolean;
    inputs?: OperatorGroup | undefined;
}

export const alphabetiseOperatorList = (operators: Operator[]): Operator[] =>
    operators.sort((a, b) => a.nocCode.toLowerCase().localeCompare(b.nocCode.toLowerCase()));

export const showSelectedOperators = (
    selectedOperators: Operator[],
    setSelectedOperators: React.Dispatch<React.SetStateAction<Operator[]>>,
    errors: ErrorInfo[],
    operatorGroupName: string,
    databaseSearchResults: Operator[],
    setSearchResults: React.Dispatch<React.SetStateAction<Operator[]>>,
    searchResults: Operator[],
): ReactElement => {
    const removeOperatorsErrors: ErrorInfo[] = [];

    errors.forEach((err) => {
        if (err.id === removeOperatorsErrorId) {
            removeOperatorsErrors.push(err);
        }
    });

    const removeOperator = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        nocCode: string,
        removeAll?: boolean,
    ) => {
        if (removeAll) {
            setSelectedOperators([]);
            setSearchResults(alphabetiseOperatorList(databaseSearchResults));
        } else {
            const newSelectedOperators = selectedOperators.filter((operator) => operator.nocCode !== nocCode);
            const operatorToRemove = databaseSearchResults.find((operator) => operator.nocCode === nocCode) as Operator;
            setSelectedOperators(newSelectedOperators);

            if (operatorToRemove) {
                setSearchResults(alphabetiseOperatorList([...searchResults, operatorToRemove]));
            }
        }
        if (event) {
            event.preventDefault();
        }
    };

    return (
        <div>
            <div
                className={`govuk-form-group ${
                    errors.length > 0 && errors[0].id == 'operator-group-name' ? 'govuk-form-group--error' : ''
                }`}
            >
                <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        <h3 className="govuk-fieldset__heading" id="operator-group-name-heading">
                            Enter a name for this group
                        </h3>
                    </legend>
                    {errors.length > 0 && errors[0].id == 'operator-group-name' ? (
                        <span id="operator-group-name-error" className="govuk-error-message">
                            <span className="govuk-visually-hidden">Error: </span>
                            {errors[0].errorMessage}
                        </span>
                    ) : null}
                    <input
                        id="operator-group-name"
                        className={`govuk-input ${
                            errors.length > 0 && errors[0].id == 'operator-group-name' ? 'govuk-input--error' : ''
                        }`}
                        aria-labelledby="operator-group-name-heading"
                        name="operatorGroupName"
                        type="text"
                        key="operator-group-name"
                        defaultValue={operatorGroupName}
                    />
                </fieldset>
            </div>
            <table className="govuk-table border-collapse width-100">
                <caption className="govuk-table__caption govuk-table__caption--m">Selected operator(s)</caption>
                <thead className="selectedOperators-header-color">
                    <tr>
                        <th
                            scope="col"
                            className="govuk-!-padding-left-2 govuk-table__header govuk-table__caption--s govuk-!-font-size-16"
                        >
                            {selectedOperators.length} added
                        </th>
                        <th scope="col" className="govuk-table__header text-align-right">
                            <button
                                id="removeAll"
                                className="selectedOperators-button button-link govuk-!-margin-left-2"
                                onClick={(event) => removeOperator(event, '', true)}
                                name="removeOperator"
                            >
                                Remove all
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    {selectedOperators.map((operator, index) => (
                        <tr key={`selected-operator-${index}`}>
                            <td className="govuk-label govuk-!-font-size-16 govuk-!-padding-top-1" key={`td0-${index}`}>
                                {operator.name} - {operator.nocCode}
                            </td>
                            <td className="govuk-link text-align-right" key={`td1-${index}`}>
                                <button
                                    id={`remove-${index}`}
                                    className="govuk-link button-link"
                                    onClick={(event) => removeOperator(event, operator.nocCode)}
                                    name="removeOperator"
                                    value={operator.name}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const renderSearchBox = (
    operatorsAdded: boolean,
    errors: ErrorInfo[],
    selectedOperators: Operator[],
    searchText: string,
): ReactElement => {
    const fieldsetProps = {
        legend: {
            className: operatorsAdded
                ? 'govuk-fieldset__legend govuk-fieldset__legend--m'
                : 'govuk-fieldset__legend govuk-fieldset__legend--l',
        },
        heading: {
            className: 'govuk-fieldset__heading',
            id: 'operator-search',
            content: operatorsAdded
                ? 'Search for more operators that the ticket covers'
                : 'Search for the operators that the ticket covers',
        },
    };
    const searchInputErrors: ErrorInfo[] = [];
    errors.forEach((err) => {
        if (err.id === searchInputId) {
            searchInputErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${searchInputErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset">
                <legend className={fieldsetProps.legend.className}>
                    <h2 className={fieldsetProps.heading.className} id={fieldsetProps.heading.id}>
                        {fieldsetProps.heading.content}
                    </h2>
                </legend>
                {searchInputErrors.length > 0 ? (
                    <span id={`${searchInputId}-error`} className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error: </span>
                        {searchInputErrors[0].errorMessage}
                    </span>
                ) : null}
                <label className="govuk-label" htmlFor={searchInputId}>
                    Operator name
                </label>
                <input
                    className={`govuk-input govuk-!-width-three-quarters${
                        searchInputErrors.length > 0 ? ' govuk-input--error' : ''
                    }`}
                    id={searchInputId}
                    name="searchText"
                    type="text"
                    defaultValue={searchText}
                />
                <input
                    type="hidden"
                    name="selectedOperators"
                    value={selectedOperators.map((operator) => `${operator.nocCode}#${operator.name}`)}
                />
                {selectedOperators.map((operator, index) => {
                    const { nocCode, name } = operator;
                    return (
                        <input
                            id={`add-operator-${index}`}
                            name="userSelectedOperators"
                            type="hidden"
                            value={`${nocCode}#${name}`}
                            key={`input-${nocCode}`}
                        />
                    );
                })}
                <input
                    type="submit"
                    value="Search"
                    name="search"
                    id="search-button"
                    className="govuk-button govuk-!-margin-left-5"
                />
            </fieldset>
        </div>
    );
};

export const showSearchResults = (
    searchText: string,
    errors: ErrorInfo[],
    databaseSearchResultsCount: number,
    selectedOperators: Operator[],
    setSelectedOperators: React.Dispatch<React.SetStateAction<Operator[]>>,
    searchResults: Operator[],
    setSearchResults: React.Dispatch<React.SetStateAction<Operator[]>>,
): ReactElement => {
    const addOperatorsErrors: ErrorInfo[] = [];
    errors.forEach((err) => {
        if (err.id === addOperatorsErrorId) {
            addOperatorsErrors.push(err);
        }
    });

    const addOperator = (operatorNocCode: string, operatorName: string) => {
        const newSelectedOperators = [...selectedOperators, { nocCode: operatorNocCode, name: operatorName }];
        setSelectedOperators(newSelectedOperators);
        const newSearchResults = alphabetiseOperatorList(
            searchResults.filter(
                (operator) =>
                    !newSelectedOperators.find((selectedOperator) => selectedOperator.nocCode === operator.nocCode),
            ),
        );
        setSearchResults(newSearchResults);
    };

    return (
        <div className={`govuk-form-group ${addOperatorsErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby="operator-search-results">
                <legend className="govuk-fieldset__legend">
                    {databaseSearchResultsCount !== 0 && (
                        <h2 className="govuk-body-l govuk-!-margin-bottom-0" id="operator-search-results">
                            Your search for &apos;<strong>{searchText}</strong>&apos; returned
                            <strong>
                                {' '}
                                {databaseSearchResultsCount} result{databaseSearchResultsCount !== 1 ? 's' : ''}
                            </strong>
                        </h2>
                    )}
                </legend>
                <FormElementWrapper errors={addOperatorsErrors} errorId={addOperatorsErrorId} errorClass="">
                    <>
                        <div className="govuk-checkboxes">
                            <p className="govuk-hint" id="bods-hint-text">
                                Select the operators results and click add operator(s). Bus data is taken from Bus Open
                                Data Service (BODS). Any other transport modes will be sourced from Traveline National
                                Dataset (TNDS).
                            </p>
                            <p className="govuk-hint" id="noc-hint-text">
                                You will see that all operator names are followed by a series of characters. These
                                characters are the operator&apos;s National Operator Code (NOC).
                            </p>
                            {searchResults.map((operator, index) => {
                                const { nocCode, name } = operator;
                                return (
                                    <div className="govuk-checkboxes__item" key={`checkbox-item-${nocCode}`}>
                                        <input
                                            className="govuk-checkboxes__input"
                                            id={`operator-to-add-${index}`}
                                            type="checkbox"
                                            onClick={() => addOperator(operator.nocCode, operator.name)}
                                        />
                                        <label
                                            className="govuk-label govuk-checkboxes__label"
                                            htmlFor={`operator-to-add-${index}`}
                                        >
                                            {name} - {nocCode}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                </FormElementWrapper>
            </fieldset>
        </div>
    );
};

const SearchOperators = ({
    searchText,
    errors,
    databaseSearchResults,
    preSelectedOperators,
    csrfToken,
    editMode,
    inputs,
}: SearchOperatorProps): ReactElement => {
    const operatorsAdded = preSelectedOperators.length > 0;
    const initialSortedDatabaseResults = alphabetiseOperatorList(databaseSearchResults);
    const searchResultsToDisplay =
        databaseSearchResults.length > 0 || errors.find((err) => err.id === addOperatorsErrorId);
    const [selectedOperators, setSelectedOperators] = useState<Operator[]>(preSelectedOperators);
    const [searchResults, setSearchResults] = useState(initialSortedDatabaseResults);
    const operatorGroupName = inputs ? inputs.name : '';
    const id = inputs ? inputs.id : undefined;

    return (
        <BaseLayout title={title} description={description}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    {editMode && errors.length === 0 ? (
                        <>
                            <BackButton href="/viewOperatorGroups" />
                            <InformationSummary informationText={editingInformationText} />
                        </>
                    ) : null}
                    <ErrorSummary errors={errors} />
                    <CsrfForm action="/api/searchOperators" method="post" csrfToken={csrfToken}>
                        {renderSearchBox(operatorsAdded, errors, selectedOperators, searchText)}
                        <input name="id" type="hidden" value={id} readOnly />
                    </CsrfForm>
                    {searchResultsToDisplay
                        ? showSearchResults(
                              searchText,
                              errors,
                              initialSortedDatabaseResults.length,
                              selectedOperators,
                              setSelectedOperators,
                              searchResults,
                              setSearchResults,
                          )
                        : null}
                </div>
                <div className="govuk-grid-column-one-third selectedOperators">
                    <CsrfForm action="/api/searchOperators" method="post" csrfToken={csrfToken}>
                        {showSelectedOperators(
                            selectedOperators,
                            setSelectedOperators,
                            errors,
                            operatorGroupName,
                            initialSortedDatabaseResults,
                            setSearchResults,
                            searchResults,
                        )}
                        <div>
                            {selectedOperators.map((operator, index) => {
                                const { nocCode, name } = operator;
                                return (
                                    <input
                                        key={`selected-${nocCode}`}
                                        id={`add-operator-${index}`}
                                        name="userSelectedOperators"
                                        type="hidden"
                                        value={`${nocCode}#${name}`}
                                    />
                                );
                            })}
                            <input
                                type="submit"
                                value="Confirm operators and continue"
                                name="continueButtonClick"
                                id="continue-button"
                                className="govuk-button width-100"
                            />
                            <input name="id" type="hidden" value={id} readOnly />
                        </div>
                    </CsrfForm>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: SearchOperatorProps }> => {
    const csrfToken = getCsrfToken(ctx);

    let errors: ErrorInfo[] = [];
    let searchText = '';
    const searchResults: Operator[] = [];

    const editId = Number.isInteger(Number(ctx.query.id)) ? Number(ctx.query.id) : undefined;
    const nocCode = getAndValidateNoc(ctx);
    let inputs: OperatorGroup | undefined;

    const searchOperatorsAttribute = getSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE);
    let selectedOperators: Operator[] = searchOperatorsAttribute?.selectedOperators
        ? searchOperatorsAttribute.selectedOperators
        : [];

    if (editId) {
        inputs = await getOperatorGroupByNocAndId(editId, nocCode);
        if (!inputs) {
            throw new Error('No entity for this NOC matches the passed id');
        }

        if (!searchOperatorsAttribute) {
            selectedOperators = selectedOperators.concat(inputs.operators);
        }
    }

    if (isMultipleOperatorAttributeWithErrors(searchOperatorsAttribute)) {
        errors = searchOperatorsAttribute.errors;
        updateSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators });
    }

    const { searchOperator } = ctx.query;

    if (searchOperator) {
        searchText = searchOperator ? removeExcessWhiteSpace(searchOperator.toString()) : '';

        if (searchText.length < 3) {
            errors = [
                {
                    errorMessage: 'Search requires a minimum of three characters',
                    id: 'search-input',
                },
            ];
        } else if (!isSearchInputValid(searchText)) {
            errors.push({
                errorMessage: 'Search must only include alphanumeric characters, hyphens or colons',
                id: searchInputId,
            });
        }
        const results = await getSearchOperatorsBySearchText(searchText);

        const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

        if (!operatorAttribute?.name) {
            throw new Error('Could not extract the necessary operator info for the searchOperators page.');
        }

        results.forEach((operator: Operator) => {
            if (operator.name !== operatorAttribute.name) {
                searchResults.push(operator);
            }
        });
        if (searchResults.length === 0) {
            errors = [
                {
                    errorMessage: `No operators found for '${searchText}'. Either the operator is not in the NOC Database, or there is no published service data for the operator. Try another search term.`,
                    id: 'search-input',
                },
            ];
        }
    }
    return {
        props: {
            errors,
            searchText,
            databaseSearchResults: searchResults,
            preSelectedOperators: selectedOperators,
            csrfToken,
            editMode: !!editId,
            ...(inputs && { inputs }),
        },
    };
};

export default SearchOperators;
