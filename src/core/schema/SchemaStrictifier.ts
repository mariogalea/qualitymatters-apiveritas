/**
 * @file SchemaStrictifier.ts
 * @author Mario Galea
 * @description
 * Utility class for modifying JSON Schemas to strictly disallow additional properties
 * beyond those explicitly defined. Useful in contract testing to enforce tighter validation rules.
 */

export class SchemaStrictifier {
  /**
   * Recursively modifies a JSON Schema to disallow additional properties in all object definitions.
   *
   * @param schema - The JSON Schema object (or array of schemas) to process.
   *
   * @remarks
   * - For every object-type schema found, sets `additionalProperties = false`.
   * - Traverses deeply into nested schemas and arrays of schemas.
   */
  public static enforceNoAdditionalProperties(schema: any): void {
    if (Array.isArray(schema)) {
      schema.forEach(SchemaStrictifier.enforceNoAdditionalProperties);
    } else if (schema && typeof schema === 'object') {
      if (schema.type === 'object') {
        schema.additionalProperties = false;
      }

      for (const key of Object.keys(schema)) {
        SchemaStrictifier.enforceNoAdditionalProperties(schema[key]);
      }
    }
  }
}
