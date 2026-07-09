import { ReactElement } from 'react';

interface InsetTextProps {
    text: string;
    italic?: boolean;
}

const InsetText = ({ text, italic }: InsetTextProps): ReactElement => {
    if (italic) {
        return (
            <div className="govuk-inset-text">
                <i>{text}</i>
            </div>
        );
    }
    return <div className="govuk-inset-text">{text}</div>;
};

export default InsetText;
