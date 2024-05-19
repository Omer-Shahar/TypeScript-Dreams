import { AsyncLocalStorage } from "async_hooks";
import { type ZodSchema } from "zod";

const asyncLocalStorage = new AsyncLocalStorage();

export function getContext() {
    const context = asyncLocalStorage.getStore();
    if (context instanceof Object) {
        return context;
    }
    return {};
}

export function getZodContext<T extends object>(schema: ZodSchema<T>) {
    const context = asyncLocalStorage.getStore();
    const res = schema.safeParse(context);
    if (res.success) {
        return res.data;
    }
    throw new Error(`Context does not match schema: ${res.error.message}`, {
        cause: res.error,
    });
}

export function runWithContext<T>(context: object, fn: () => T) {
    return asyncLocalStorage.run({ ...getContext(), ...context }, fn);
}
