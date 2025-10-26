import { useEffect, useRef } from 'react';

interface UseDebugRendersOptions {
    componentName: string;
    enabled?: boolean;
}

export const useDebugRenders = ({
    componentName,
    enabled = process.env.NODE_ENV === 'development'
}: UseDebugRendersOptions) => {
    const renderCount = useRef(0);
    const prevProps = useRef<any>({});

    useEffect(() => {
        if (enabled) {
            renderCount.current += 1;
            console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
        }
    });

    const logPropsChange = (props: any) => {
        if (enabled) {
            const changedProps = Object.keys(props).filter(
                key => prevProps.current[key] !== props[key]
            );

            if (changedProps.length > 0) {
                console.log(`📊 ${componentName} props changed:`, changedProps);
                changedProps.forEach(key => {
                    console.log(`  ${key}:`, prevProps.current[key], '→', props[key]);
                });
            }

            prevProps.current = { ...props };
        }
    };

    return { renderCount: renderCount.current, logPropsChange };
};
