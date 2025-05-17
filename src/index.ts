import { ApiCaller } from './ApiCaller';
import { ApiRequest } from './models/ApiRequest';

async function main() {
  const apis: ApiRequest[] = [
    {
      name: 'Get All Bookings',
      url: 'http://localhost:8080/bookings',
      auth: {
        username: 'admin',
        password: 'secret'
      }
    },
    {
      name: 'Get One Booking',
      url: 'http://localhost:8080/bookings/1',
      auth: {
        username: 'admin',
        password: 'secret'
      }
    },
    {
      name: 'CreateBooking',
      url: 'http://localhost:8080/bookings/new',
      method: 'POST',
      auth: { username: 'admin', password: 'secret' },
      body: {
        firstName: 'John',
        lastName: 'Galea'
      }
    },
    {
      name: 'UpdateBooking',
      url: 'http://localhost:8080/bookings/update/1',
      method: 'PUT',
      auth: { username: 'admin', password: 'secret' },
      body: {
        firstName: 'Mario',
        lastName: 'Borg'
      }
    },
    {
      name: 'DeleteBooking',
      url: 'http://localhost:8080/bookings/delete/6',
      method: 'DELETE',
      auth: { username: 'admin', password: 'secret' }
    }
    // Add more here as needed
  ];

  const caller = new ApiCaller(apis);
  await caller.callAll();
}

main();
