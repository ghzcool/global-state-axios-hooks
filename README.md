# GlobalState and Axios Hooks

`GlobalState` is a class for managing the global state of an application. `globalStateHooks` is a set of functions and React hooks that allow you to manage global state, handle promises, and make `axios` requests within React components.

## Description

### GlobalState

`GlobalState` allows you to store some state and subscribe to changes in it.

#### Key Methods

- **`constructor(state?: T)`**: Initializes the global state with an initial value `state`.
- **`next(state?: T): void`**: Sets a new state value and notifies all subscribers of the change.
- **`subscribe(subscriber: GlobalStateSubscriber<T>): GlobalStateUnsubscribe`**: Adds a subscriber for state changes. Returns a function to unsubscribe.
- **`getValue(): T | undefined`**: Returns the current state value.

### Hooks for Using with GlobalState

These hooks allow you to use `GlobalState` in React components.

#### Key Hooks and Functions

- **`getGlobalStateHook<T>(globalState: GlobalState<T>): () => T | undefined`**: Creates a React hook to subscribe to changes in the global state.
- **`getPromiseStateLoadingHook(globalState: GlobalState<PromiseState<any>>): () => boolean`**: Returns a hook to get the loading state (`true`/`false`).
- **`getPromiseStateDataHook<T>(globalState: GlobalState<PromiseState<T>>): () => T | undefined`**: Returns a hook to get data from `PromiseState`.
- **`getPromiseStateErrorHook(globalState: GlobalState<PromiseState<any>>): () => Error | undefined`**: Returns a hook to get errors from `PromiseState`.
- **`promiseToGlobalState<T>(promise: Promise<T>, globalState: GlobalState<PromiseState<T>>): Promise<T>`**: Handles a promise and stores its state in `GlobalState`.
- **`axiosResponseToGlobalState<T>(promise: Promise<AxiosResponse<T>>, subject: GlobalState<PromiseState<T>>): Promise<T>`**: Handles an `axios` response and stores its state in `GlobalState`.
- **`getRequestHooks<T, K>(axiosCall: (args?: K) => Promise<AxiosResponse<T>>): RequestHooks<T, K>`**: Creates a set of hook functions for making `axios` requests and managing loading, data, and error states.
- **`getGlobalStateHookSetterGetter<T>(globalState: GlobalState<T>): [() => T | undefined, (value?: T) => void, () => T | undefined]`**: Creates a set of functions: hook, setter and getter for managing global state.

## Example Usage

### Using GlobalState with Axios in React

```typescript
import React, { useEffect } from 'react';
import { getRequestHooks } from 'global-state-axios-hooks';
import axios from 'axios';

// Define the request hook
export const [loadSomething, useSomethingLoading, useSomethingData, useSomethingError] =
  getRequestHooks(() => axios({ url: '/api/something', method: 'get' }));

// Using the hook in a component
const MyComponent = () => {
  const loading = useSomethingLoading();
  const data = useSomethingData();
  const error = useSomethingError();

  useEffect(() => {
    loadSomething();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Data: {JSON.stringify(data)}</div>;
};
```

### Using GlobalState in React

```typescript
import React from 'react';
import { GlobalState, getGlobalStateHookSetterGetter } from 'global-state-axios-hooks';

// Create GlobalState
const counterState = new GlobalState<number>(0);

// Define hook, setter and getter for counterState.
export const [useCounter, setCounter, getCounter] = getGlobalStateHookSetterGetter(counterState);

// Using the hook and functions in a component
const MyComponent = () => {
  const counter = useCounter();

  return (
    <div>
      <div>Counter: {counter}</div>
      <button type="button" onClick={() => setCounter(getCounter() + 1)}>Add 1</button>
    </div>
  );
};
```