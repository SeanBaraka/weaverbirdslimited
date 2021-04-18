// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://178.32.191.159:3055/',
  socketUrl: 'http://178.32.191.159:3055/',
  // apiBaseUrl: 'https://pourtapapi.weaverbirdsupplies.co.ke/',
  // socketUrl: 'https://pourtapapi.weaverbirdsupplies.co.ke/',
  recipients: ['+254727275739']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
