import { ReactElement } from 'react';
import { OperatorGroup } from '../interfaces';

interface OperatorGroupCardProps {
    operatorGroup: OperatorGroup;
    index: number;
    deleteActionHandler?: (id: number, name: string) => void;
    defaultChecked: boolean;
}

const OperatorGroupCard = ({
    operatorGroup,
    index,
    deleteActionHandler,
    defaultChecked,
}: OperatorGroupCardProps): ReactElement => {
    const { name, id } = operatorGroup;

    return (
        <div className="card" id={`operator-group-${index}`}>
            <div className="card__body">
                {deleteActionHandler ? (
                    <div className="card__actions">
                        <ul className="actions__list">
                            <li className="actions__item">
                                <a
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular"
                                    href={`/searchOperators?id=${id}`}
                                >
                                    Edit
                                </a>
                            </li>

                            <li className="actions__item">
                                <button
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular actions__delete"
                                    onClick={() => deleteActionHandler(id, name)}
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
                                id={`operator-group-${index}-radio`}
                                name="operatorGroupId"
                                type="radio"
                                value={id}
                                defaultChecked={defaultChecked}
                            />
                            <label
                                className="govuk-label govuk-radios__label"
                                htmlFor={`operator-group-${index}-radio`}
                            >
                                <span className="govuk-visually-hidden">{`operator-group-${index}`}</span>
                            </label>
                        </div>
                    </div>
                )}

                <h4 className="govuk-heading-m govuk-!-padding-bottom-4">{name}</h4>

                {operatorGroup.operators.map(
                    (operator, idx) =>
                        idx < 5 && (
                            <p
                                key={`operator-${idx}`}
                                id={`operator-${idx}`}
                                className="govuk-body-s govuk-!-margin-bottom-2"
                            >
                                {operator.name} - {operator.nocCode}
                            </p>
                        ),
                )}
                {operatorGroup.operators.length > 5 && (
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                        and {operatorGroup.operators.length - 5} other operators
                    </p>
                )}
            </div>
        </div>
    );
};

export default OperatorGroupCard;
