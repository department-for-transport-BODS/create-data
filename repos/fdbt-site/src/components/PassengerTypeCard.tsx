import { ReactElement } from 'react';
import { FullGroupPassengerType, SinglePassengerType } from '../interfaces/dbTypes';
import { getProofDocumentsString, sentenceCaseString } from '../utils';

interface PassengerTypeCardProps {
    contents: FullGroupPassengerType | SinglePassengerType;
    index: number;
    deleteActionHandler?: (id: number, name: string, isGroup: boolean) => void;
    defaultChecked: boolean;
}

const PassengerTypeCard = ({
    contents,
    index,
    deleteActionHandler,
    defaultChecked,
}: PassengerTypeCardProps): ReactElement => {
    const { name, id } = contents;
    const isGroup = 'groupPassengerType' in contents;
    return (
        <div className="card" id={`${isGroup ? 'group-card' : 'passenger-card'}-${index}`}>
            <div className="card__body">
                {deleteActionHandler ? (
                    <div className="card__actions">
                        <ul className="actions__list">
                            <li className="actions__item">
                                <a
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular"
                                    href={`/managePassenger${isGroup ? `Group` : `Types`}?id=${id}`}
                                >
                                    Edit
                                </a>
                            </li>

                            <li className="actions__item">
                                <button
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular actions__delete"
                                    onClick={() => deleteActionHandler(id, name, isGroup)}
                                >
                                    Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="govuk-radios">
                        <div className="govuk-radios__item card__selector">
                            <input
                                className="govuk-radios__input"
                                id={`${name}-radio`}
                                name="passengerTypeId"
                                type="radio"
                                value={id}
                                defaultChecked={defaultChecked}
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor={`${name}-radio`}>
                                <span className="govuk-visually-hidden">{`${name}`}</span>
                            </label>
                        </div>
                    </div>
                )}

                {'groupPassengerType' in contents ? (
                    <>
                        <h4 className="govuk-heading-m govuk-!-padding-bottom-4">{name}</h4>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <span className="govuk-!-font-weight-bold">Max size:</span>{' '}
                            {contents.groupPassengerType.maxGroupSize}
                        </p>

                        {contents.groupPassengerType.companions.length
                            ? contents.groupPassengerType.companions.map((companion) => (
                                  <p key={companion.name} className="govuk-body-s govuk-!-margin-bottom-2">
                                      <span className="govuk-!-font-weight-bold">
                                          {companion.name || companion.passengerType}:
                                      </span>{' '}
                                      {`Min: ${companion.minNumber ? companion.minNumber : '0'}`} -{' '}
                                      {`Max: ${companion.maxNumber}`}
                                  </p>
                              ))
                            : ''}
                    </>
                ) : (
                    <>
                        <h4 className="govuk-heading-m govuk-!-padding-bottom-4">{name}</h4>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <span className="govuk-!-font-weight-bold">Passenger type:</span>{' '}
                            {sentenceCaseString(contents.passengerType.passengerType)}
                        </p>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <span className="govuk-!-font-weight-bold">Minimum age:</span>{' '}
                            {contents.passengerType.ageRangeMin ? contents.passengerType.ageRangeMin : 'N/A'}
                        </p>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <span className="govuk-!-font-weight-bold">Maximum age:</span>{' '}
                            {contents.passengerType.ageRangeMax ? contents.passengerType.ageRangeMax : 'N/A'}
                        </p>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <span className="govuk-!-font-weight-bold">Proof document(s):</span>{' '}
                            {contents.passengerType.proofDocuments
                                ? getProofDocumentsString(contents.passengerType.proofDocuments)
                                : 'N/A'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PassengerTypeCard;
