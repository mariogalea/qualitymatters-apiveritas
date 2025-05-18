import { ApiCaller } from './ApiCaller';
import { ApiRequest } from './models/ApiRequest';
import { PayloadComparer } from './PayloadComparer';
import { ConfigLoader } from './ConfigLoader'; // 🔧 Add this line

async function main() {
  const apis: ApiRequest[] = [
    {
      name: 'GetAllBookings',
      url: 'http://localhost:8080/bookings',
      auth: {
        username: 'admin',
        password: 'secret'
      }
    },
    {
      name: 'GetOneBooking',
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
  ];

  const caller = new ApiCaller(apis);
  await caller.callAll();

  // 🛠️ Load config from file
  const config = ConfigLoader.loadConfig(); // assumes config.json returns { strictSchema: true }

  // 🔍 Pass config to comparer
  const comparer = new PayloadComparer(config);
  const latestFolders = comparer.getLatestTwoPayloadFolders();
  if (!latestFolders) return;

  const [previous, latest] = latestFolders;
  comparer.compareFolders(previous, latest);
}

main();
