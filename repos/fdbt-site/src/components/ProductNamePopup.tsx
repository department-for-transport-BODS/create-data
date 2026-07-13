import React, { ReactElement, useEffect, useState } from 'react';
import { checkProductOrCapNameIsValid, removeExcessWhiteSpace } from '../utils/apiUtils/validator';
import Trap from './Trap';

interface ProductNamePopupProps {
    defaultValue: string;
    productId: string;
    serviceId?: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    csrfToken: string;
    isOpen: boolean;
}

export const buildEditUrl = (
    idToEdit: string,
    csrfToken: string,
    productName: string,
    serviceId: string | undefined,
): string => {
    return `/api/editProductName?id=${idToEdit}&productName=${productName}&_csrf=${csrfToken}${
        serviceId ? `&serviceId=${serviceId}` : ''
    }`;
};

const ProductNamePopup = ({
    cancelActionHandler,
    defaultValue,
    csrfToken,
    productId,
    serviceId,
    isOpen,
}: ProductNamePopupProps): ReactElement | null => {
    const [popupError, setPopupError] = useState('');
    const [productName, updateProductName] = useState('');
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    useEffect(() => {
        if (productName) {
            const withoutExcess = removeExcessWhiteSpace(productName);
            const error = checkProductOrCapNameIsValid(withoutExcess, 'product');

            if (error || productName === defaultValue) {
                setPopupError(error);
                setShowSubmitButton(false);
            } else {
                setShowSubmitButton(true);
                setPopupError('');
            }
        }
    }, [productName]);

    return (
        <Trap active={isOpen}>
            <div className="popup">
                <div className="popup__content">
                    <form>
                        <h1 className="govuk-heading-m">Rename product</h1>

                        {popupError && <span className="govuk-error-message">{popupError}</span>}

                        <div className={`govuk-form-group ${popupError ? 'govuk-form-group--error' : ''}`}>
                            <input
                                className="govuk-input"
                                id="product-name"
                                type="text"
                                defaultValue={defaultValue}
                                onChange={(e) => {
                                    updateProductName(e.target.value);
                                }}
                            />
                        </div>

                        <span className="govuk-hint" id="edit-product-hint">
                            You can enter up to 50 characters
                        </span>

                        <button className="govuk-button govuk-button--secondary" onClick={cancelActionHandler}>
                            Cancel
                        </button>

                        {showSubmitButton && (
                            <button
                                className="govuk-button"
                                formAction={buildEditUrl(
                                    productId,
                                    csrfToken,
                                    removeExcessWhiteSpace(productName),
                                    serviceId,
                                )}
                                formMethod="post"
                                type="submit"
                                id="popup-edit-product-name-button"
                            >
                                Save
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </Trap>
    );
};

export default ProductNamePopup;
