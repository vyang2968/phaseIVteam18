export const idsFor: Record<string, string[]> = {
  airline: ['airlineid'],
  airplane: ['airlineid', 'tail_num'],
  airport: ['airportid'],
  flight: ['flightid'],
  leg: ['legid'],
  location: ['locationid'],
  passenger: ['personid'],
  passenger_vacations: ['personid', 'sequence'],
  person: ['personid'],
  pilot: ['personid'],
  pilot_licenses: ['personid', 'license'],
  route: ['routeid'],
  route_path: ['routeid', 'sequence']
}