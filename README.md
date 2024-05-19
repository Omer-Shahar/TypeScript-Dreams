# TypeScript Dreams

This is a collection of TypeScript utilities and examples for use cases, including:

-   [`context.ts`](context.ts) - context using `AsyncLocalStorage`.
-   [`decorators.ts`](decorators.ts) - types and functions for creating decorators.

## Installation

In order to use [`context.ts`](context.ts), run [`npm install zod`](https://github.com/colinhacks/zod).
In order to use [`decorators.ts`](decorators.ts), enable decorators in your `tsconfig.json` file:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true
    }
}
```

## Behind the Scenes

### [`context.ts`](context.ts)

#### Functions

-   `getContext` - returns the current context.
-   `getZodContext` - returns the current context if it fits the received schema, otherwise throws an error.
-   `runWithContext` - runs a function with a new context.

### [`decorators.ts`](decorators.ts)

#### Types

-   `Func<Return>` - a function that returns `Return`.
-   `MethodDesc<Return>` - a descriptor for a method that returns `Return`.
-   `MethodDecorator` - a decorator for a method.
-   `ClassDecorator` - a decorator for a class.
-   `MethodDescValueGetter` - a function that receives a method descriptor and the original method, and returns a new method.
-   `ExistingMethodDesc` - a method descriptor with an existing method.

#### Functions

-   `getMethodsDescriptors` - receives a class prototype and returns an array of existing method descriptors.
-   `getClassName` - receives a class prototype and returns the class name.

## Disclaimer

The code in this repository serves as a proof of concept and might not work in all cases. It is recommended to test it thoroughly before using it in a production environment. I encourage you to experiment with it and adjust it to your needs. If you find any issues or have suggestions for improvements, please let me know.
