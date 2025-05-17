export interface ApiRequest {

  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // default to GET if not provided
  auth?: {
    username: string;
    password: string;
  };
  
  body?: any; // for POST/PUT payloads

}
