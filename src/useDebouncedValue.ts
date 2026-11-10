import { useEffect, useState } from "react";

type UseDebouncedValueOptions = {
    value: string;
    delay?: number;
};

export const useDebouncedValue = ({ value, delay = 300 }: UseDebouncedValueOptions): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
