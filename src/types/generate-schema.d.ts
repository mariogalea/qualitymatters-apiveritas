declare module 'generate-schema' {
  const generateSchema: {
    json: (name: string, data: any) => any;
  };
  export default generateSchema;
}