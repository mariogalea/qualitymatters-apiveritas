export class SchemaStrictifier {

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