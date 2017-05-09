import { Component, ViewChild, ElementRef, OnInit, OnChanges } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import * as c3 from 'c3';
import * as moment from 'moment';

import { DataService } from '../../services';
import { convertMonthInTwoDigitForm } from '../../helpers';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})

export class Dashboard implements OnInit {

  @ViewChild('donutChart') donutChart: ElementRef;
  @ViewChild('lineChart') lineChart: ElementRef;
  months: Array<string> = ['January',
                           'Febuary',
                           'March',
                           'April',
                           'May',
                           'June',
                           'July',
                           'August',
                           'September',
                           'October',
                           'November',
                           'December'];
  donutData: Array<any>;
  total: number;
  from: string;
  to: string;
  setFromDate: string;
  setToDate: string;
  donutData$: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public dataService: DataService) {}

  //TODO - Create presentation/dumb components for each dashboard
  //Then use input decorator in dumb component to consume
  //data passed in via async pipe
  //Use ngOnChanges hook inside dumb component
  //Structuring the components this way will avoid multiple
  //calls to the REST API given that each 'subscribe'
  //make a call.
  //Refactor code. DRY

  ngOnInit() {
    this.dataService.getTotalForSelectedPeriod()
                    .subscribe(total => this.total = total);
    this.from = this.dataService.from;
    this.to = this.dataService.to;
    this.donutData$ = this.dataService.getDonutChartData()
  }

  ionViewDidLoad() {

    let donutChartArea = this.donutChart.nativeElement;
    let lineChartArea = this.lineChart.nativeElement;

    this.dataService.getDonutChartData().subscribe((donutData: any) => {

      this.donutData = donutData;

      c3.generate({
        bindto: donutChartArea,
        size: {
          width: 110
        },
        padding: {
          top: 0
        },
        legend: {
          hide: true
        },
        data: {
            type: 'donut',
            columns: donutData,
            colors: {
              'Airbnb': '#9062AA',
              'Homeaway': '#57C5B8',
              'Booking.com': '#1875BA',
              'Blocked': '#ACACAC'
            }
        },
        donut: {
          width: 12,
          label: {
            show: false
          }
        }
      }); //End c3.generate
    }); //End getDonutChartData()

    this.dataService.getLineChartData().subscribe(lineData => {
      c3.generate({
        bindto: lineChartArea,
        padding: {
          top: 0
        },
        size: {
          height: 280,
          width: 420
        },
        data: {
          x: 'x',
          columns: lineData,
          colors: {
            'Airbnb': '#9062AA',
            'Homeaway': '#57C5B8',
            'Booking.com': '#1875BA'
          }
        },
        axis: {
          y: {
            show: false
          },
          x: {
            show: true,
            type: 'timeseries',
            tick: {
              count: 6,
              outer: false,
              format: '%m'
            }
          }
        },
        legend: {
          hide: true
        },
        point: {
          show: false
        }
      }) //End c3.generate LineChart
    }) //End getLineChartData()
  } //End ionViewDidLoad

  selectMonthFrom(month: string): void {

    let donutChartArea = this.donutChart.nativeElement;
    let lineChartArea = this.lineChart.nativeElement;

    //monthNumber is a number representation of the month
    //i.e January is 1, Febuary is 2 etc...
    let monthNumber: number = this.months.indexOf(month) + 1;

    //fromDate format YYYY-MM-DD
    //convertMonthInTwoDigitForm is a helper that converts
    //a month number for example 5 into '05'
    this.setFromDate = `2017-${convertMonthInTwoDigitForm(monthNumber)}-01`;

    //Get new Total
    this.dataService
        .getTotalForSelectedPeriod(this.setFromDate, this.to)
        .subscribe(total => this.total = total);

    //Fetch data
    this.dataService
        .getLineChartData(this.setFromDate, this.to)
        .subscribe(lineData => {
          this.from = this.dataService.from;
          this.to = this.dataService.to;

          c3.generate({
            bindto: lineChartArea,
            padding: {
              top: 0
            },
            size: {
              height: 280,
              width: 420
            },
            data: {
              x: 'x',
              columns: lineData,
              colors: {
                'Airbnb': '#9062AA',
                'Homeaway': '#57C5B8',
                'Booking.com': '#1875BA'
              }
            },
            transition: {
              duration: 100
            },
            axis: {
              y: {
                show: false
              },
              x: {
                show: true,
                type: 'timeseries',
                tick: {
                  count: 6,
                  outer: false,
                  format: '%m'
                }
              }
            },
            legend: {
              hide: true
            },
            point: {
              show: false
            }
          }) //End c3.generate LineChart
        });
    this.dataService
        .getDonutChartData(this.setFromDate, this.to)
        .subscribe(donutData => {

          this.donutData = donutData;

          c3.generate({
            bindto: donutChartArea,
            size: {
              width: 110
            },
            padding: {
              top: 0
            },
            legend: {
              hide: true
            },
            data: {
                type: 'donut',
                columns: donutData,
                colors: {
                  'Airbnb': '#9062AA',
                  'Homeaway': '#57C5B8',
                  'Booking.com': '#1875BA',
                  'Blocked': '#ACACAC'
                }
            },
            transition: {
              duration: 100
            },
            donut: {
              width: 12,
              label: {
                show: false
              }
            }
          }); //End c3.generate
        });
  }

  selectMonthTo(month: string): void {

     let donutChartArea = this.donutChart.nativeElement;
     let lineChartArea = this.lineChart.nativeElement;
     let monthNumber: number = this.months.indexOf(month);

     //toDate represents last date of the month selected
     let toDate = moment().set({ 'year': 2017, 'month': monthNumber, 'date': 1 })
                          .add(1, 'M') //Add one month
                          .subtract(1, 'd') // Subtract 1 day
                          .format('YYYY-MM-DD');

     //Get new Total
     this.dataService
         .getTotalForSelectedPeriod(this.setFromDate, toDate)
         .subscribe(total => this.total = total);

     this.dataService
         .getLineChartData(this.setFromDate, toDate)
         .subscribe(lineData => {
           this.from = this.dataService.from;
           this.to = this.dataService.to;

           c3.generate({
             bindto: lineChartArea,
             padding: {
               top: 0
             },
             size: {
               height: 280,
               width: 420
             },
             data: {
               x: 'x',
               columns: lineData,
               colors: {
                 'Airbnb': '#9062AA',
                 'Homeaway': '#57C5B8',
                 'Booking.com': '#1875BA'
               }
             },
             transition: {
               duration: 100
             },
             axis: {
               y: {
                 show: false
               },
               x: {
                 show: true,
                 type: 'timeseries',
                 tick: {
                   count: 6,
                   outer: false,
                   format: '%m'
                 }
               }
             },
             legend: {
               hide: true
             },
             point: {
               show: false
             }
           }) //End c3.generate LineChart
         });

     this.dataService
         .getDonutChartData(this.setFromDate, toDate)
         .subscribe(donutData => {
            this.donutData = donutData;

            c3.generate({
              bindto: donutChartArea,
              size: {
                width: 110
              },
              padding: {
                top: 0
              },
              legend: {
                hide: true
              },
              data: {
                  type: 'donut',
                  columns: donutData,
                  colors: {
                    'Airbnb': '#9062AA',
                    'Homeaway': '#57C5B8',
                    'Booking.com': '#1875BA',
                    'Blocked': '#ACACAC'
                  }
              },
              transition: {
                  duration: 100
              },
              donut: {
                width: 12,
                label: {
                  show: false
                }
              }
            }); //End c3.generate

         });
  }
}
