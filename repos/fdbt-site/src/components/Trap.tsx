import FocusTrap from 'focus-trap-react';
import { ReactElement, ReactNode } from 'react';

interface TrapProps {
    active: boolean;
    children: ReactNode;
}
const Trap = ({ active, children }: TrapProps): ReactElement | null => {
    return active ? (
        <FocusTrap
            focusTrapOptions={{
                tabbableOptions: { displayCheck: 'none' },
            }}
        >
            <div className="trap">{children}</div>
        </FocusTrap>
    ) : null;
};
export default Trap;
