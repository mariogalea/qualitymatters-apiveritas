export interface ApiRequest {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // default to GET if not provided
  auth?: {
    username: string;
    password: string;
  };
  body?: any;
  expectedStatus?: number;

  /**
   * Optional name of the test suite this request belongs to.
   * Used to organize saved responses under payloads/{testSuite}/
   */
  testSuite?: string;
}
