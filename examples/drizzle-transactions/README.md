# TypeScript Dreams - Drizzle Transactions

In this example, a decorator is created to automatically handle transactions in Drizzle.

## Without Decorators

When calling a Drizzle transaction, you receive as an argument a DB object that you should use to interact with the database as part of the transaction:

```ts
async function createPostAndRollback() {
    await db.transaction(async (db) => {
        await db.insert(posts).values({
            name: "post to be rolled back",
        });
        db.rollback();
    });
}
```

### Drawbacks

This approach has quite a few drawbacks:

When calling a function inside a transaction, you need to pass the `db` object as an argument.
This requires changing all related functions to receive an additional argument (saving the new `db` object in a global variable might cause issues with concurrent transactions).
Doing so is very verbose and makes the code harder to read and maintain.
Forgetting to do so might not be caught by the TypeScript compiler, as `db` also refers to the global `db` object.

## With Decorators

The file [`@transaction.ts`](@transaction.ts) was written to address these issues.

### Usage

0. Run [`npm install zod`](https://github.com/colinhacks/zod) and enable decorators in your `tsconfig.json` file:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true
    }
}
```

1. Copy [`context.ts`](/context.ts), [`decorators.ts`](/decorators.ts) and [`@transaction.ts`](@transaction.ts) to your project and adjust the import paths as needed.
2. In your `db.ts` file (where your Drizzle database is defined), change the name of the global DB object to `baseDB`, and create a new `db` object imported from [`@transaction.ts`](@transaction.ts):

```ts
export const baseDB = drizzle(conn, { schema });
export const db = transactionalDB;
```

3. Use the `@transactionalMethod` decorator for specific methods or the `@transactionalClass` decorator for all methods in a class:

```ts
// @transactionalClass - applies @transactionalMethod to all methods instead
class DBMethods {
    @transactionalMethod
    async createPostAndRollback() {
        if (!db.isTransacting) throw new Error("Not in transaction");
        await db.insert(posts).values({
            name: "post to be rolled back",
        });
        db.rollback(); // available when isTransacting is true
    }
}
```

This code will also work when moving some of the logic to another method - without the need to pass the `db` object as an argument.
The `db` object imported from `db.ts` will automatically use the correct object for the transaction.
Notice the new `db.isTransacting` property, which is `true` only when running inside a transaction.
If you want to use the global `db` object even when inside a transaction, you can use the `db.baseDB` property.

### Behind the Scenes

#### Types

-   `BaseDB` - the global `baseDB` object.
-   `BaseDBExt` - `BaseDB` with our custom additional properties.
-   `TransDB` - a transactional database object.
-   `TransDBExt` - `TransDB` with our custom additional properties.
-   `DB` - the new `db` object used in the codebase.

#### Variables

-   `dbMap` - a map that stores the correct `db` object for each active transaction.
-   `transactionalDB` - the `db` object that should be used in the codebase. Uses proxy to return the correct `db` object for the current transaction.

#### Functions

-   `getDB` - returns the correct `db` object for the current transaction.
-   `transactionalClass` - a decorator that wraps each method in a class with a transaction.
-   `transactionalMethod` - a decorator that wraps a method with a transaction.
-   `runInTransition` - a helper function used by the decorators to manage transactions.
