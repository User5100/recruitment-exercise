import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/Observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinct';

import { BASE_URL } from '../config';
import { CalendarItem } from '../models';

@Injectable()

export class DataService {

  from: string;
  to:string;

  constructor(private http: Http) {}

  getData(from: string = '2017-08-01', to: string = '2017-08-31'): Observable<Array<CalendarItem>> {

    this.from = from;
    this.to = to;

    let params: URLSearchParams = new URLSearchParams();
    params.set('from', from); //'from' format YYYY-MM-DD
    params.set('to', to);     //'to' format YYYY-MM-DD

    return this.http.get(BASE_URL, { params })
                    .map(res => res.json())
                    //Transform response to an array of calendar items
                    .map(res => res.calendar);

  }

  getLineChartData(from: string = '2017-08-01', to: string = '2017-08-31') {
    return this.getData(from, to)
               .switchMap((calendar: Array<CalendarItem>) => {
                 let dates = ['x'];
                 let clients = [];

                 calendar.map((item: CalendarItem, i) => {

                   var clientFound: boolean = false;
                   //Push each date in response to dates array
                   dates.push(item.date);

                   //Loop through clients array
                   clients.map((client: Array<any>) => {

                     //
                     if(client[0] === item.source) {
                       //Set clientFound to true
                       clientFound = true;
                       //Push price to client array if client found
                       client.push(item.gbp_price);

                     } else {
                       //Else push a price of zero, representing
                       //zero income for this particular date
                       client.push(0);
                     }
                   })

                   if(!clientFound) {
                     //Create new array for newly found client
                     let newClient: Array<any> = [item.source || 'Blocked'];

                     //Push 0's to align the array indices with
                     //the dates array indices
                     for(let _i = 0; _i < i; _i++) {
                       newClient.push(0);
                     }
                     //Them push the price to newClient
                     newClient.push(item.gbp_price || 0);
                     //Finally push the newClient to the clients array
                     clients.push(newClient);
                   }
                 }) //End calendar

                 //Push dates array to clients array to achieve
                 //desired output
                 clients.push(dates);

                 return Observable.of(clients); //clients now contains dates
               }); //End switchMap

          /*
          Desired output

          [['x',       'YYYY-MM-DD', 'YYYY-MM-DD'],
           ['Airbnb',   30,          40],
           ['Homeaway', 23,          54]
          ]
          */
  } //End getLineChartData

  getDonutChartData(from: string = '2017-08-01', to: string = '2017-08-31'): Observable<Array<Array<any>>> {
    return this.getData(from, to)
               .switchMap((calendar: Array<CalendarItem>) => {

                 let output = [];

                 calendar.map((item: CalendarItem) => {

                   var clientFound = false


                   output.map((client: Array<any>) => {


                     //If client is found in output array add
                     //price to current value
                     if(client[0] === item.source) { //client[0] = client name
                       clientFound = true; //
                       client[1] = client[1] + item.gbp_price;
                     }
                   })

                   if(!clientFound) {
                     //If client not found in output array
                     //then push new client array to output array
                     //1st element is the client name
                     //2nd element is the starting price

                     //Does 'blocked' doesn't exist, if so return true?
                     if(output.filter(client => client[0] === 'Blocked') === []) {
                       console.log(item.source)
                       if(item.source) {
                         output.push([item.source, item.gbp_price])
                       } else {
                         output.push(['Blocked', 0])
                       }

                     } else {
                       //If 'Blocked' does exist in output
                       if(item.source) {
                         output.push([item.source, item.gbp_price])
                       }
                       //Ignore item.source = undefined if 'Blocked' exists in output
                     }
                   }
                 })

                 return Observable.of(output);
               });

    /*
    Desired output
      [
        ['Airbnb', 50],
        ['Homeaway', 20],
        ['Booking.com', 15],
        ['Blocked', 5]
      ]
    */
  }

  getTotalForSelectedPeriod(from: string = '2017-08-01', to: string = '2017-08-31'): Observable<number> {
    return this.getDonutChartData(from, to)
               .switchMap((donutData: Array<Array<any>>) => {

                 let total;

                 total = donutData.reduce((acc, curr) => {
                     return acc += curr[1];
                   }, 0)

                 return Observable.of(total);
               })
    /*
    Desired output
      number representing total
    */
  }
}
