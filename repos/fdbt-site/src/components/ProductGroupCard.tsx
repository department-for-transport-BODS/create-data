import { ReactElement } from 'react';
import { GroupOfProducts } from '../interfaces';

interface ProductGroupCardProps {
    groupDetails: GroupOfProducts;
    index: number;
    deleteActionHandler?: (id: number, name: string) => void;
    defaultChecked: boolean;
}

const ProductGroupCard = ({
    groupDetails,
    index,
    deleteActionHandler,
    defaultChecked,
}: ProductGroupCardProps): ReactElement => {
    const { name, id } = groupDetails;

    return (
        <div className="card" id={`product-group-${index}`}>
            <div className="card__body">
                {deleteActionHandler ? (
                    <div className="card__actions">
                        <ul className="actions__list">
                            <li className="actions__item">
                                <a
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular"
                                    href={`/manageProductGroup?id=${id}`}
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
                                id={`product-group-${index}-radio`}
                                name="productGroupId"
                                type="radio"
                                value={id}
                                defaultChecked={defaultChecked}
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor={`product-group-${index}-radio`}>
                                <span className="govuk-visually-hidden">{`product-group-${index}`}</span>
                            </label>
                        </div>
                    </div>
                )}

                <h4 className="govuk-heading-m govuk-!-padding-bottom-4">{name}</h4>

                <p className="govuk-body-s govuk-!-margin-bottom-2">
                    {groupDetails.productIds.length} product{groupDetails.productIds.length > 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};

export default ProductGroupCard;
