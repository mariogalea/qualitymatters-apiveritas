import { ApiRequest } from './models/ApiRequest';

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
      },
      {
        name: 'GetOneBooking',
        url: 'http://localhost:8080/bookings/1',
        auth: {
          username: 'admin',
          password: 'secret',
        },
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
      },
      {
        name: 'UpdateBooking',
        url: 'http://localhost:8080/bookings/update/1',
        method: 'PUT',
        auth: { username: 'admin', password: 'secret' },
        body: {
          firstName: 'Mario',
          lastName: 'Borg',
        },
      },
      {
        name: 'DeleteBooking',
        url: 'http://localhost:8080/bookings/delete/6',
        method: 'DELETE',
        auth: { username: 'admin', password: 'secret' },
      },
    ];
  }

  getApis(): ApiRequest[] {
    return this.apis;
  }
}