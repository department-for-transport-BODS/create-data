import { ReactElement } from 'react';

interface BackButtonProps {
    href: string;
}

const BackButton = ({ href }: BackButtonProps): ReactElement => (
    <a href={href} className="govuk-back-link">
        Back
    </a>
);

export default BackButton;
