type Func<Return> = (...args: unknown[]) => Promise<Return>;

type MethodDesc<Return> = TypedPropertyDescriptor<Func<Return>>;

export type MethodDecorator = <Return>(
    target: object,
    methodName: string | symbol,
    descriptor: MethodDesc<Return>
) => void | MethodDesc<Return>;

export type ClassDecorator = (target: { prototype: object }) => void;

export type MethodDescValueGetter = <Return>(
    descriptor: MethodDesc<Return>,
    originalMethod: Func<Return>
) => Func<Return>;

type ExistingMethodDesc = MethodDesc<unknown> & { value: NonNullable<unknown> };

export function getMethodsDescriptors(prototype: object) {
    const propertyNames = Object.getOwnPropertyNames(prototype);

    const methodNames = propertyNames.filter((propName) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, propName);
        return descriptor?.value instanceof Function;
    });

    return methodNames.reduce((arr, methodName) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
        if (!descriptor) return arr;
        if (!descriptor.value) return arr;
        return [...arr, descriptor as ExistingMethodDesc];
    }, [] as ExistingMethodDesc[]);
}

export function getClassName(prototype: object) {
    return prototype.constructor.name;
}
