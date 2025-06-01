/**
 * @file SchemaValidator.ts
 * @author Mario Galea
 * @description
 * A wrapper around the Ajv JSON Schema validator. Provides functionality to validate
 * data against a given schema and retrieve detailed error messages.
 */

import Ajv, { ErrorObject } from 'ajv';

/**
 * Class responsible for validating JSON data against a provided JSON Schema using Ajv.
 */
export class SchemaValidator {
  private ajv: Ajv;
  private lastErrors: ErrorObject[] = [];

  /**
   * Initializes the Ajv validator with options to collect all errors
   * and to allow loose schema rules (strict mode disabled).
   */
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  /**
   * Validates the provided data against the given JSON Schema.
   *
   * @param schema - The JSON Schema object to validate against.
   * @param data - The data to be validated.
   * @returns `true` if validation passes, `false` otherwise.
   */
  validate(schema: object, data: any): boolean {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    this.lastErrors = validate.errors || [];
    return valid;
  }

  /**
   * Returns an array of human-readable validation error messages.
   *
   * @returns An array of strings describing where and why validation failed.
   */
  getErrors(): string[] {
    return this.lastErrors.map((err) => {
      const instancePath = err.instancePath || '#';
      const keyword = err.keyword;
      const message = err.message ?? 'Unknown error';
      const prop = (err.params as any).additionalProperty;

      if (keyword === 'additionalProperties' && prop) {
        return `Unexpected property "${prop}" at ${instancePath}. Schema does not allow additional properties.`;
      }

      return `Schema validation error at ${instancePath}: ${message}`;
    });
  }
}
