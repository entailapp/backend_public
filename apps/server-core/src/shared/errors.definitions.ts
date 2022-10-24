import {HttpException} from '@nestjs/common';

export class EntityNotFoundError extends HttpException {
  constructor(multiple: boolean) {
    super(`Unable to find the requested ${multiple ? 'entities' : 'entity'}`, 500);
  }
}

export class EntityExistsError extends HttpException {
  constructor() {
    super('Entity already exists', 500);
  }
}

export class EntitySearchError<T extends Error> extends HttpException {
  constructor(subError?: T) {
    super(
      `Unable to find entity/entities in the database ${
        subError !== undefined ? 'with child error: {error: ' + subError + '}' : ''
      }`,
      500
    );
  }
}

export class EntityCreateError<T extends Error> extends HttpException {
  constructor(subError?: T) {
    super(
      `Unable to create entity in the database ${
        subError !== undefined ? 'with child error: {error: ' + subError + '}' : ''
      }`,
      500
    );
  }
}

export class EntityUpdateError<T extends Error> extends HttpException {
  constructor(subError?: T) {
    super(
      `Unable to update entity in the database ${
        subError !== undefined ? 'with child error: {error: ' + subError + '}' : ''
      }`,
      500
    );
  }
}

export class EntityDeleteError<T extends Error> extends HttpException {
  constructor(subError?: T) {
    super(
      `Unable to delete entity in the database ${
        subError !== undefined ? 'with child error: {error: ' + subError + '}' : ''
      }`,
      500
    );
  }
}
