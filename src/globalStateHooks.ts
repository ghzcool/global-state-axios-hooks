import {useSyncExternalStore} from 'react';
import {GlobalState} from './globalState';
import {AxiosResponse} from 'axios';

/*
 Functions for using GlobalState changes with React hooks.
 These functions allow to handle simple value, Promise or AxiosResponse and turn them to React hooks.

 Example usage:

 // in hooks

 export const [loadSomething, useSomethingLoading, useSomethingData] =
  getRequestHooks<ResponseModel>(() => axios({url: '/api/something', method: 'get'}));

 // in component

 const loading = useSomethingLoading();
 const data = useSomethingData();

 useEffect({
  loadSomething();
 }, []);

 if (loading) {
   return <div>Loading...</div>;
 }

 return <div>{data}</div>;
*/

export class PromiseState<T> {
  constructor(public loading?: boolean, public data?: T, public error?: Error) {
    this.loading = !!loading;
    this.data = data;
    this.error = error;
  }
}

type UnsubscribeFunction = () => void;

type SubscriberFunction = (onStoreChange: () => void) => UnsubscribeFunction;

export const getGlobalStateSubscriber = (globalState: GlobalState<any>): SubscriberFunction => (subscriber): UnsubscribeFunction => {
  return globalState.subscribe(subscriber);
};

export function getGlobalStateSnapshotGetter<T>(globalState: GlobalState<T>): () => T | undefined {
  return () => globalState.getValue();
}

export function getGlobalStateHook<T>(globalState: GlobalState<T>): () => T | undefined {
  const subscribe = getGlobalStateSubscriber(globalState);
  const getSnapshot = getGlobalStateSnapshotGetter(globalState);

  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export function getPromiseStateLoadingHook(globalState: GlobalState<PromiseState<any>>): () => boolean {
  const subscribe = getGlobalStateSubscriber(globalState);
  const getSnapshot = () => !!globalState.getValue()?.loading;

  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export function getPromiseStateDataHook<T>(globalState: GlobalState<PromiseState<any>>): () => T | undefined {
  const subscribe = getGlobalStateSubscriber(globalState);
  const getSnapshot = () => globalState.getValue()?.data;

  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export function getPromiseStateErrorHook(globalState: GlobalState<PromiseState<any>>): () => Error | undefined {
  const subscribe = getGlobalStateSubscriber(globalState);
  const getSnapshot = () => globalState.getValue()?.error;

  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export function promiseToGlobalState<T>(promise: Promise<T>, globalState: GlobalState<PromiseState<T>>): Promise<T> {
  globalState.next(new PromiseState<T>(true));
  promise.then((data: T) => {
    globalState.next(new PromiseState<T>(false, data));
  }, error => {
    globalState.next(new PromiseState<T>(false, undefined, error));
  });

  return promise;
}

export function structurePromiseState<T>(state: PromiseState<T>): [boolean, T | undefined, Error | undefined] {
  return [!!state.loading, state.data, state.error];
}

export function axiosResponseToGlobalState<T>(promise: Promise<AxiosResponse<T>>, subject: GlobalState<PromiseState<T>>): Promise<T> {
  subject.next(new PromiseState<T>(true));

  promise.then((props: AxiosResponse<T>) => {
    const {data, status} = props || {};
    if (status === 200) {
      subject.next(new PromiseState<T>(false, data));
    } else {
      subject.next(new PromiseState<T>(false, undefined, new Error(String(status))));
    }
  }, error => {
    subject.next(new PromiseState<T>(false, undefined, error));
  });

  return promise.then(response => response?.data);
}

type RequestHooks<T, K> = [(args?: K) => Promise<T>, () => boolean, () => T | undefined, () => Error | undefined, GlobalState<PromiseState<T>>];

export function getRequestHooks<T, K>(axiosCall: (args?: K) => Promise<AxiosResponse<T>>): RequestHooks<T, K> {
  const responseGlobalState: GlobalState<PromiseState<T>> = new GlobalState(new PromiseState());
  const sendRequest = (args: K) => axiosResponseToGlobalState<T>(axiosCall(args), responseGlobalState);
  const useLoading = getPromiseStateLoadingHook(responseGlobalState);
  const useData = getPromiseStateDataHook<T>(responseGlobalState);
  const useError = getPromiseStateErrorHook(responseGlobalState);

  return [sendRequest, useLoading, useData, useError, responseGlobalState];
}

export function getGlobalStateHookSetterGetter<T>(globalState: GlobalState<T>): [() => T | undefined, (value?: T) => void, () => T | undefined] {
  const useValue = getGlobalStateHook<T>(globalState);
  const setValue = (value?: T) => {
    if (value !== globalState.getValue()) {
      globalState.next(value);
    }
  };
  const getValue = (): T | undefined => globalState.getValue();

  return [useValue, setValue, getValue];
}
