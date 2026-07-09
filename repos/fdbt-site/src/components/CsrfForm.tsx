import { ReactElement, ReactNode } from 'react';

interface CsrfFormProps {
    action: string;
    method: string;
    csrfToken: string;
    children: ReactNode;
    [props: string]: unknown;
}

const CsrfForm = ({ action, method, csrfToken, children, ...props }: CsrfFormProps): ReactElement => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <form action={`${action}?_csrf=${csrfToken}`} method={method} {...props}>
        {children}
    </form>
);

export default CsrfForm;
