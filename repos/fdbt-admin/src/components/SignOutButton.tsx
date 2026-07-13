import { Button } from 'govuk-react';
import { Auth } from 'aws-amplify';
import { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';

interface SignOutButtonProps {
    className?: string;
}

const SignOutButton = ({ className }: SignOutButtonProps): ReactElement => {
    const history = useHistory();

    const signOut = async (): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await Auth.signOut().then(
            () => history.go(0),
            () => history.push('/'),
        );
    };

    return (
        <Button className={className} onClick={async () => signOut()}>
            Sign Out
        </Button>
    );
};

SignOutButton.defaultProps = {
    className: '',
};

export default SignOutButton;
