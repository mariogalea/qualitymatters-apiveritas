import Ajv, { ErrorObject } from 'ajv';

export class SchemaValidator {
  private ajv: Ajv;
  private lastErrors: ErrorObject[] = [];

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  validate(schema: object, data: any): boolean {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    this.lastErrors = validate.errors || [];
    return valid;
  }

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
