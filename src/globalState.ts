type GlobalStateSubscriber<T> = (state?: T) => void;
type GlobalStateUnsubscribe = () => void;

/*
 GlobalState allows to store some state and subscribe to state changes.

 Example usage:

 const myGlobalState = new GlobalState<number>(0);

 const mySubscriber = (state: number | undefined) => {
   console.log('State changed to:', state);
 };

 myGlobalState.next(1);

 console.log('Current state is:', myGlobalState.getValue());
*/

export class GlobalState<T> {
  private _state?: T;
  private readonly _subscribers: GlobalStateSubscriber<T>[] = [];

  constructor(state?: T) {
    this._state = state;
  }

  next(state?: T) {
    this._state = state;
    this._subscribers.forEach(subscriber => subscriber(this._state));
  }

  subscribe(subscriber: GlobalStateSubscriber<T>): GlobalStateUnsubscribe {
    this._subscribers.push(subscriber);
    subscriber(this._state);

    return () => {
      this._subscribers.splice(this._subscribers.indexOf(subscriber), 1);
    };
  }

  getValue(): T | undefined {
    return this._state;
  }
}
