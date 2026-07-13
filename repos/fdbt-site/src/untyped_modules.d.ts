declare module 'set-cookie';

declare module 'clamscan' {
    export default class NodeClam {
        constructor();

        init: (config: object) => Promise<{ is_infected: (path: string) => { is_infected: boolean } }>;
    }
}

declare module '*.jpeg' {
    const value: string;
    export = value;
}

declare module '*.jpg' {
    const value: string;
    export = value;
}

declare module '*.png' {
    const value: string;
    export = value;
}

declare module '*.svg' {
    const value: string;
    export = value;
}

declare module '*.ico' {
    const value: string;
    export = value;
}

declare module '*.pdf' {
    const value: string;
    export = value;
}

declare module '*.csv' {
    const value: string;
    export = value;
}
