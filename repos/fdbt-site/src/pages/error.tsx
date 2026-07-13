import { ReactElement } from 'react';
import { NextPageContext } from 'next';
import Error from './_error';

interface ErrorProps {
    statusCode: number;
}

const ErrorPage = ({ statusCode }: ErrorProps): ReactElement => <Error statusCode={statusCode} />;

export const getServerSideProps = (ctx: NextPageContext): object => {
    return { props: { statusCode: ctx?.res?.statusCode } };
};

export default ErrorPage;
