import { ReactElement } from 'react';
import { PurchaseMethodCardBody } from '../pages/viewPurchaseMethods';
import { SalesOfferPackage } from '../interfaces/matchingJsonTypes';

interface PurchaseMethodCardProps {
    sop: SalesOfferPackage;
    isCapped: boolean;
    index: number;
    deleteActionHandler?: (id: number, name: string) => void;
}

const PurchaseMethodCard = ({ sop, isCapped, index, deleteActionHandler }: PurchaseMethodCardProps): ReactElement => {
    const { name, id } = sop;

    return (
        <div className="card" key={id} id={`purchase-method-${isCapped ? 'cap' : ''}-${index}`}>
            <div className="card__body">
                {deleteActionHandler ? (
                    <div className="card__actions">
                        <ul className="actions__list">
                            <li className="actions__item">
                                <a
                                    className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-regular"
                                    href={`/managePurchaseMethod?id=${id}${isCapped ? `&isCapped=true` : ''}`}
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
                ) : null}

                <PurchaseMethodCardBody entity={sop} />
            </div>
        </div>
    );
};

export default PurchaseMethodCard;
