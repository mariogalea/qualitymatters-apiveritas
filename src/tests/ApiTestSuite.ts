import { ApiRequest } from '../interfaces/IApiRequest';

export class ApiTestSuite {
  private apis: ApiRequest[];

  constructor() {
    this.apis = [
      {
        name: 'GetAllBookings',
        url: 'http://localhost:8080/bookings',
        auth: {
          username: 'admin',
          password: 'secret',
        },
        expectedStatus: 200,
      },
      {
        name: 'GetOneBooking',
        url: 'http://localhost:8080/bookings/3',
        auth: {
          username: 'admin',
          password: 'secret',
        },
        expectedStatus: 200,
      },
      {
        name: 'CreateBooking',
        url: 'http://localhost:8080/bookings/new',
        method: 'POST',
        auth: { username: 'admin', password: 'secret' },
        body: {
          firstName: 'John',
          lastName: 'Galea',
        },
        expectedStatus: 200,
      },
      {
        name: 'UpdateBooking',
        url: 'http://localhost:8080/bookings/update/3',
        method: 'PUT',
        auth: { username: 'admin', password: 'secret' },
        body: {
          firstName: 'Mario',
          lastName: 'Borg',
        },
        expectedStatus: 200,
      },
      {
        name: 'DeleteBooking',
        url: 'http://localhost:8080/bookings/delete/1',
        method: 'DELETE',
        auth: { username: 'admin', password: 'secret' },
        expectedStatus: 200, 
      },
    ];
  }

  getApis(): ApiRequest[] {
    return this.apis;
  }
}
