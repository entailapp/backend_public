import {Ok, Err, Result, ConvOp} from './result.type';
import {None, Some} from './option.type';

type OkValue = {value: string};
type AltValue = {alt: string};
type ErrValue = {error: string};

describe('Ok', () => {
  let result: Result<OkValue, ErrValue>;
  const ok: OkValue = {value: 'value'};
  beforeEach(() => {
    result = new Ok(ok);
  });
  it('should return res when calling .and()', () => {
    const param: Result<AltValue, ErrValue> = new Ok({alt: 'alt'});
    expect(result.and(param)).toStrictEqual(param);
  });
  it('should run a closure on the value when calling .andThen()', () => {
    const param: Result<AltValue, ErrValue> = new Ok({alt: 'value'});
    const closure: ConvOp<OkValue, Result<AltValue, ErrValue>> = jest.fn(
      (v: OkValue) => new Ok({alt: v.value})
    );
    expect(result.andThen(closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(ok);
  });
  it.each([
    [true, 'matches', ok],
    [false, "doesn't match", {value: 'values'}],
  ])(
    'should return %s if the value %s the input when calling .contains()',
    (output: boolean, _text: string, value: OkValue) => {
      expect(result.contains(value)).toStrictEqual(output);
    }
  );
  it('should return false when calling .containsErr()', () => {
    expect(result.containsErr({error: 'error'})).toStrictEqual(false);
  });
  it('should return None when calling .err()', () => {
    expect(result.err()).toStrictEqual(new None());
  });
  it('should return its value when calling .expect()', () => {
    expect(result.expect('This expect should be fine')).toStrictEqual(ok);
  });
  it('should panic when calling .expectErr()', () => {
    const msg = 'This expect should panic';
    expect(() => result.expectErr(msg)).toThrowError(msg);
  });
  it('should return false when calling .isErr()', () => {
    expect(result.isErr()).toStrictEqual(false);
  });
  it('should return true when calling .isOk()', () => {
    expect(result.isOk()).toStrictEqual(true);
  });
  it('should run the closure on its value when calling .map()', () => {
    const param: Result<OkValue, ErrValue> = new Ok({value: 'values'});
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    expect(result.map(closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(ok);
  });
  it('should return itself when calling .mapErr()', () => {
    const closure: ConvOp<ErrValue, ErrValue> = jest.fn((v: ErrValue) => {
      return {error: v.error + 's'};
    });
    expect(result.mapErr(closure)).toStrictEqual(result);
    expect(closure).not.toHaveBeenCalledWith(ok);
  });
  it('should run the closure on its value when calling .mapOr()', () => {
    const param: OkValue = {value: 'values'};
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    expect(result.mapOr({value: 'valued'}, closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(ok);
  });
  it('should run the closure on its value when calling .mapOrElse()', () => {
    const param: OkValue = {value: 'values'};
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    const errClosure: ConvOp<ErrValue, OkValue> = jest.fn((v: ErrValue) => {
      return {value: v.error + 's'};
    });
    expect(result.mapOrElse(errClosure, closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(ok);
  });
  it('should return an option with its value when calling .ok()', () => {
    expect(result.ok()).toStrictEqual(new Some(ok));
  });
  it('should return itself when calling .or()', () => {
    const param: Result<OkValue, ErrValue> = new Err({error: 'error'});
    expect(result.or(param)).toStrictEqual(result);
  });
  it('should return itself when calling .orElse()', () => {
    const closure: ConvOp<ErrValue, Result<OkValue, ErrValue>> = jest.fn(
      (v: ErrValue) => {
        return new Ok({value: v.error + 's'});
      }
    );
    expect(result.orElse(closure)).toStrictEqual(result);
    expect(closure).not.toHaveBeenCalledWith(ok);
  });
  it('should return its value when calling .unwrap()', () => {
    expect(result.unwrap()).toStrictEqual(ok);
  });
  it('should panic when calling .unwrapErr()', () => {
    const msg = 'Unable to unwrap Ok() as Err() value';
    expect(() => result.unwrapErr()).toThrowError(msg);
  });
  it('should return its value when calling .unwrapOr()', () => {
    const param: OkValue = {value: 'values'};
    expect(result.unwrapOr(param)).toStrictEqual(ok);
  });
  it('should return its value when calling .unwrapOrDefault()', () => {
    expect(result.unwrapOrDefault()).toStrictEqual(ok);
  });
  it('should return its value when calling .unwrapOrElse()', () => {
    const closure: ConvOp<ErrValue, OkValue> = jest.fn((v: ErrValue) => {
      return {value: v.error + 's'};
    });
    expect(result.unwrapOrElse(closure)).toStrictEqual(ok);
    expect(closure).not.toHaveBeenCalledWith(ok);
  });
});

describe('Err', () => {
  let result: Result<OkValue, ErrValue>;
  const ok: OkValue = {value: 'value'};
  const err: ErrValue = {error: 'error'};
  beforeEach(() => {
    result = new Err(err);
  });
  it('should return itself when calling .and()', () => {
    const param: Result<AltValue, ErrValue> = new Ok({alt: 'alt'});
    expect(result.and(param)).toStrictEqual(result);
  });
  it('should return itself when calling .andThen()', () => {
    const closure: ConvOp<OkValue, Result<AltValue, ErrValue>> = jest.fn(
      (v: OkValue) => new Ok({alt: v.value})
    );
    expect(result.andThen(closure)).toStrictEqual(result);
    expect(closure).not.toHaveBeenCalledWith(ok);
  });
  it('should return false when calling .contains()', () => {
    expect(result.contains(ok)).toStrictEqual(false);
  });
  it.each([
    [true, 'matches', err],
    [false, "doesn't match", {error: 'errors'}],
  ])(
    'should return %s if the value %s the input when calling .containsErr()',
    (output: boolean, _text: string, value: ErrValue) => {
      expect(result.containsErr(value)).toStrictEqual(output);
    }
  );
  it('should return an option with its value when calling .err()', () => {
    expect(result.err()).toStrictEqual(new Some(err));
  });
  it('should panic when calling .expect()', () => {
    const msg = 'This expect should panic';
    expect(() => result.expect(msg)).toThrowError(msg);
  });
  it('should return its value when calling .expectErr()', () => {
    const msg = 'This expect should be fine';
    expect(result.expectErr(msg)).toEqual(err);
  });
  it('should return true when calling .isErr()', () => {
    expect(result.isErr()).toStrictEqual(true);
  });
  it('should return false when calling .isOk()', () => {
    expect(result.isOk()).toStrictEqual(false);
  });
  it('should return itself when calling .map()', () => {
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    expect(result.map(closure)).toStrictEqual(result);
    expect(closure).not.toHaveBeenCalledWith(ok);
  });
  it('should run the closure on its value when calling .mapErr()', () => {
    const param: Result<OkValue, ErrValue> = new Err({error: 'errors'});
    const closure: ConvOp<ErrValue, ErrValue> = jest.fn((v: ErrValue) => {
      return {error: v.error + 's'};
    });
    expect(result.mapErr(closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(err);
  });
  it('should return the given default when calling .mapOr()', () => {
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    expect(result.mapOr({value: 'valued'}, closure)).toStrictEqual({
      value: 'valued',
    });
    expect(closure).not.toHaveBeenCalledWith(err);
  });
  it('should run the closure on its value when calling .mapOrElse()', () => {
    const param: OkValue = {value: 'errors'};
    const closure: ConvOp<OkValue, OkValue> = jest.fn((v: OkValue) => {
      return {value: v.value + 's'};
    });
    const errClosure: ConvOp<ErrValue, OkValue> = jest.fn((v: ErrValue) => {
      return {value: v.error + 's'};
    });
    expect(result.mapOrElse(errClosure, closure)).toStrictEqual(param);
    expect(errClosure).toHaveBeenCalledWith(err);
  });
  it('should return None when calling .ok()', () => {
    expect(result.ok()).toStrictEqual(new None());
  });
  it('should return res when calling .or()', () => {
    const param: Result<OkValue, ErrValue> = new Err({error: 'errored'});
    expect(result.or(param)).toStrictEqual(param);
  });
  it('should run the closure on its value when calling .orElse()', () => {
    const param: Result<OkValue, ErrValue> = new Ok({value: 'errors'});
    const closure: ConvOp<ErrValue, Result<OkValue, ErrValue>> = jest.fn(
      (v: ErrValue) => {
        return new Ok({value: v.error + 's'});
      }
    );
    expect(result.orElse(closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(err);
  });
  it('should panic when calling .unwrap()', () => {
    const msg = 'Unable to unwrap Err() as Ok() value';
    expect(() => result.unwrap()).toThrowError(msg);
  });
  it('should return its value when calling .unwrapErr()', () => {
    expect(result.unwrapErr()).toStrictEqual(err);
  });
  it('should return the given default when calling .unwrapOr()', () => {
    const param: OkValue = {value: 'values'};
    expect(result.unwrapOr(param)).toStrictEqual(param);
  });
  it('should return undefined when calling .unwrapOrDefault()', () => {
    expect(result.unwrapOrDefault()).toBeUndefined();
  });
  it('should run the closure on its value when calling .unwrapOrElse()', () => {
    const param: OkValue = {value: 'errors'};
    const closure: ConvOp<ErrValue, OkValue> = jest.fn((v: ErrValue) => {
      return {value: v.error + 's'};
    });
    expect(result.unwrapOrElse(closure)).toStrictEqual(param);
    expect(closure).toHaveBeenCalledWith(err);
  });
});
