import { ReactElement, ReactNode } from 'react';

interface CsrfFormProps {
    action: string;
    method: string;
    csrfToken: string;
    children: ReactNode;
    [props: string]: unknown;
}

const CsrfForm = ({ action, method, csrfToken, children, ...props }: CsrfFormProps): ReactElement => (
    <form action={`${action}?_csrf=${csrfToken}`} method={method} {...props}>
        {children}
    </form>
);

export default CsrfForm;
