import { baseDB } from "./../index";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getContext, runWithContext } from "~/utils/context";
import {
    type MethodDescValueGetter,
    getMethodsDescriptors,
    type ClassDecorator,
    type MethodDecorator,
} from "~/utils/decorators";

type BaseDB = typeof baseDB;
type BaseDBExt = BaseDB & { isTransacting: false; baseDB: BaseDB };
type TransDB = Parameters<Parameters<BaseDB["transaction"]>[0]>[0];
type TransDBExt = TransDB & { isTransacting: true; baseDB: BaseDB };
type DB = ReturnType<typeof getDB>;

const dbMap = new Map<string, TransDB>();

function getDB() {
    const context = z.object({ dbId: z.string() }).safeParse(getContext());
    if (!context.success) {
        const db = baseDB as BaseDBExt;
        db.isTransacting = false;
        db.baseDB = baseDB;
        return db;
    }

    const db = dbMap.get(context.data.dbId) as TransDBExt;
    if (db) {
        db.isTransacting = true;
        db.baseDB = baseDB;
        return db;
    }
    throw new Error("No db found inside transaction");
}

export const transactionalDB = new Proxy(
    {},
    {
        get(_, prop) {
            return getDB()[prop as keyof DB];
        },
    }
) as DB;

/**
 * Decorator to run each method of a class in a transaction
 */
export const transactionalClass = ((target) => {
    const prototype = target.prototype;
    for (const methodDesc of getMethodsDescriptors(prototype)) {
        const originalMethod = methodDesc.value;
        methodDesc.value = runInTransition(methodDesc, originalMethod);
        Object.defineProperty(prototype, originalMethod.name, methodDesc);
    }
}) satisfies ClassDecorator;

/**
 * Decorator to run a method in a transaction
 */
export const transactionalMethod = ((target, methodName, descriptor) => {
    const originalMethod = descriptor.value;
    if (!originalMethod) return;
    descriptor.value = runInTransition(descriptor, originalMethod);
}) satisfies MethodDecorator;

const runInTransition: MethodDescValueGetter = (descriptor, originalMethod) => {
    return async function (...args) {
        if (getDB() !== baseDB) {
            return originalMethod.apply(descriptor, args);
        }
        return baseDB.transaction(async (db) => {
            const id = randomUUID();
            dbMap.set(id, db);
            const result = await runWithContext({ dbId: id }, () => {
                return originalMethod.apply(descriptor, args);
            });
            dbMap.delete(id);
            return result;
        });
    };
};
