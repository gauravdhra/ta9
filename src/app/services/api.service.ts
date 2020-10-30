import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import * as config from '../app.config.json';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  options: {
    headers?: HttpHeaders | { [header: string]: string | string[] },
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams | { [param: string]: string | string[] },
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text',
    withCredentials?: boolean,
  };

  appBaseURL = '';

  getLookups(lookups: any[], token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Token: token
      })
    };
    const options = {
      headers: httpOptions.headers
    };
    return this.http.post(
      this.appBaseURL + '/MetadataService/GetGenericLookups',
      {
        lookupNames: lookups
      },
      options);
  }

  insertBulk(data: any, loginToken: string) {
    let payloadValues = this.preparePayload(data);
    let payload = {
      "dataModelID": config.shiftDMID,
      "values": payloadValues,
      "insertFields": [{}]
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Token: loginToken
      })
    };
    const options = {
      headers: httpOptions.headers
    };
    return this.http.post(
      this.appBaseURL + '/ReportServices/InsertBulkData',
      payload,
      options);
  }


    preparePayload(data: any) {
      const headers = ['division','npc', 'teamName', 'driverName', 'patrolMan',
        'sector', 'callSign', 'shiftTime', 'SRNo', 'startTime', 'endTime', 'location', 'locationLat', 'locationLon',
        'purpose', 'reasonDeviation', 'signature', 'rank'];
      const shiftGUID = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      let results = [];

      data.schedules.forEach((s: any, index: any) => {
        let values = {
          "ShiftPlanID": shiftGUID
        };
        for (let i = 0; i < headers.length; ++i) {
          if (headers[i] == 'SRNo') {
            values[headers[i]] = index + 1;
            continue;
          } else if (headers[i] == 'LocationLat' || headers[i] == 'LocationLon') {
            values[headers[i]] = 0;
          } else if (headers[i] == 'startTime' || headers[i] == 'endTime') {
            let time = s[headers[i]];
            let hourNum = parseInt(time.split(':')[0]);
            let minuteNum = parseInt(time.split(':')[1]);
            let m = moment().utcOffset(0);
            m.set({hour:hourNum, minute:minuteNum, second:0});
            m.toISOString();
            let final = m.format('D/M/YYYY H:mm:ss');
            values[headers[i]] = final;
            continue;

          } else if (headers[i] == 'purpose') {
            values[headers[i]] = s[headers[i]].Key;
            continue;
          } else if (!data[headers[i]]) {
            values[headers[i]] = s[headers[i]];
            continue;
          }
          values[headers[i]] = data[headers[i]];
        }
        results.push(values);
      });
      return results;
    }
}
