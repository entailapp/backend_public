/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {Option, Some, None} from './option.type';
import {ResultPanic} from './result.error';

/**
 * Type used to describe a closure
 */
export type ConvOp<T, U> = (v: T) => U;

export interface Result<T, E> {
  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   * @param res
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   * This function can be used for control flow based on Result values.
   * @param op
   */
  andThen<U>(op: ConvOp<T, Result<U, E>>): Result<U, E>;

  /**
   * Returns true if the result is an Ok value containing the given value.
   * @param v
   */
  contains(v: any): boolean;

  /**
   * Returns true if the result is an Err value containing the given value.
   * @param v
   */
  containsErr(v: any): boolean;

  /**
   * Converts from Result<T, E> to Option<E>.
   * Converts self into an Option<E>, consuming self, and discarding the success value, if any.
   */
  err(): Option<E>;

  /**
   * Returns the contained Ok value, consuming the self value.
   * @param msg
   */
  expect(msg: string): T;

  /**
   * Returns the contained Err value, consuming the self value.
   * @param msg
   */
  expectErr(msg: string): E;

  /**
   * Returns true if the result is Err.
   */
  isErr(): boolean;

  /**
   * Returns true if the result is Ok.
   */
  isOk(): boolean;

  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched.
   * @param op
   */
  map<U>(op: ConvOp<T, U>): Result<U, E>;

  /**
   * Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched.
   * @param op
   */
  mapErr<F>(op: ConvOp<E, F>): Result<T, F>;

  /**
   * Applies a function to the contained value (if Ok), or returns the provided default (if Err).
   * @param def
   * @param op
   */
  mapOr<U>(def: U, op: ConvOp<T, U>): U;

  /**
   * Maps a Result<T, E> to U by applying a function to a contained Ok value, or a fallback function to a contained Err value.
   * This function can be used to unpack a successful result while handling an error.
   * @param def
   * @param op
   */
  mapOrElse<U>(def: ConvOp<E, U>, op: ConvOp<T, U>): U;

  /**
   * Converts from Result<T, E> to Option<T>.
   * Converts self into an Option<T>, consuming self, and discarding the error, if any.
   */
  ok(): Option<T>;

  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   * @param res
   */
  or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * Calls op if the result is Err, otherwise returns the Ok value of self.
   * This function can be used for control flow based on result values.
   * @param op
   */
  orElse<F>(op: ConvOp<E, Result<T, F>>): Result<T, F>;

  /**
   * Returns the contained Ok value, consuming the self value.
   * Because this function may panic, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly,
   * or call unwrapOr, unwrapOrElse, or unwrapOrDefault.
   */
  unwrap(): T;

  /**
   * Returns the contained Err value, consuming the self value.
   */
  unwrapErr(): E;

  /**
   * Returns the contained Ok value or a provided default.
   * @param def
   */
  unwrapOr(def: T): T;

  /**
   * Returns the contained Ok value or a default (in JS, always undefined)
   */
  unwrapOrDefault(): T | undefined;

  /**
   * Returns the contained Ok value or computes it from a closure.
   * @param op
   */
  unwrapOrElse(op: ConvOp<E, T>): T;
}

export class Ok<T, E> implements Result<T, E> {
  constructor(private value: T) {}

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U>(op: ConvOp<T, Result<U, E>>): Result<U, E> {
    return op(this.value);
  }

  contains(v: any): boolean {
    return this.value === v;
  }

  containsErr(_v: any): boolean {
    return false;
  }

  err(): Option<E> {
    return new None();
  }

  expect(_msg: string): T {
    return this.value;
  }

  expectErr(msg: string): E {
    throw new ResultPanic(msg);
  }

  isErr(): boolean {
    return false;
  }

  isOk(): boolean {
    return true;
  }

  map<U>(op: ConvOp<T, U>): Result<U, E> {
    return new Ok(op(this.value));
  }

  mapErr<F>(_op: ConvOp<E, F>): Result<T, F> {
    return new Ok(this.value);
  }

  mapOr<U>(_def: U, op: ConvOp<T, U>): U {
    return op(this.value);
  }

  mapOrElse<U>(_def: ConvOp<E, U>, op: ConvOp<T, U>): U {
    return op(this.value);
  }

  ok(): Option<T> {
    return new Some(this.value);
  }

  or<F>(_res: Result<T, F>): Result<T, F> {
    return new Ok(this.value);
  }

  orElse<F>(_op: ConvOp<E, Result<T, F>>): Result<T, F> {
    return new Ok(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): E {
    throw new ResultPanic('Unable to unwrap Ok() as Err() value');
  }

  unwrapOr(_def: T): T {
    return this.value;
  }

  unwrapOrDefault(): T | undefined {
    return this.value;
  }

  unwrapOrElse(_op: ConvOp<E, T>): T {
    return this.value;
  }
}

export class Err<T, E> implements Result<T, E> {
  constructor(private value: E) {}

  and<U>(_res: Result<U, E>): Result<U, E> {
    return new Err(this.value);
  }

  andThen<U>(_op: ConvOp<T, Result<U, E>>): Result<U, E> {
    return new Err(this.value);
  }

  contains(_v: any): boolean {
    return false;
  }

  containsErr(v: any): boolean {
    return v === this.value;
  }

  err(): Option<E> {
    return new Some(this.value);
  }

  expect(msg: string): T {
    throw new ResultPanic(msg);
  }

  expectErr(_msg: string): E {
    return this.value;
  }

  isErr(): boolean {
    return true;
  }

  isOk(): boolean {
    return false;
  }

  map<U>(_op: ConvOp<T, U>): Result<U, E> {
    return new Err(this.value);
  }

  mapErr<F>(op: ConvOp<E, F>): Result<T, F> {
    return new Err(op(this.value));
  }

  mapOr<U>(def: U, _op: ConvOp<T, U>): U {
    return def;
  }

  mapOrElse<U>(def: ConvOp<E, U>, _op: ConvOp<T, U>): U {
    return def(this.value);
  }

  ok(): Option<T> {
    return new None();
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  orElse<F>(op: ConvOp<E, Result<T, F>>): Result<T, F> {
    return op(this.value);
  }

  unwrap(): T {
    throw new ResultPanic('Unable to unwrap Err() as Ok() value');
  }

  unwrapErr(): E {
    return this.value;
  }

  unwrapOr(def: T): T {
    return def;
  }

  unwrapOrDefault(): T | undefined {
    return undefined;
  }

  unwrapOrElse(op: ConvOp<E, T>): T {
    return op(this.value);
  }
}
