function Throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number,
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
export default Throttle;
