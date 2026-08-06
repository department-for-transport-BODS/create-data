import React, { ReactElement } from 'react';
import Trap from './Trap';

interface PopUpProps {
    title: string;
    text: string;
    okActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    isOpen: boolean;
}

const InfoPopup = ({ title, text, okActionHandler, isOpen }: PopUpProps): ReactElement | null => (
    <Trap active={isOpen}>
        <div className="popup">
            <div className="popup__content">
                <h1 className="govuk-heading-m">{title}</h1>

                <span className="govuk-hint" id="info-hint">
                    {text}
                </span>

                <button className="govuk-button" type="button" onClick={okActionHandler}>
                    Ok
                </button>
            </div>
        </div>
    </Trap>
);

export default InfoPopup;
