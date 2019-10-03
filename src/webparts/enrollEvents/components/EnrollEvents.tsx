import * as React from 'react';
import styles from './EnrollEvents.module.scss';
import { IEnrollEventsProps } from './IEnrollEventsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IEnrollEventsState, EventInfo } from './IEnrollEventsState';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import Moment from 'react-moment';
import 'moment-timezone';

export default class EnrollEvents extends React.Component<IEnrollEventsProps, any> {

  public constructor(props: IEnrollEventsProps, state: IEnrollEventsState) {
    super(props);
    this.getEventDetails = this.getEventDetails.bind(this);
    this.checkUser = this.checkUser.bind(this);
    this.state = {
      items: [],
      checkEnrollement: false,
      enrolledSuccessfully: false,
      error: false,
      errorMessgae: ''
    };
  }

  public postUserData(event): void {
    var items = event[0];
    const body: string = JSON.stringify({
      'Title': items.Title,
      "EventDescription": items.Description,
      "Location": items.Location,
      "StartDate": items.EventDate,
      "EndDate": items.EndDate,
      "UserName": this.props.user,
      "EventID": (items.ID).toString()
    });

    this.props.spHttpClient.post(`${this.props.siteurl}/_api/web/lists/getbytitle('Enrolls')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': ''
        },
        body: body
      })
      .then((response: SPHttpClientResponse): Promise<any> => {
        return response.json();
      })
      .then((item: any): void => {
        if (item) {
          console.log("Enrolled Sucssfully");
          this.setState({
            items: event,
            checkEnrollement: true,
            enrolledSuccessfully: true
          });
        }
      }, (error: any): void => {
        console.log('Error while creating the item: ' + error);
      });
  }

  public componentDidMount() {
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/bootstrapV3.3.7.css");
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/bootstrap-custom.css");
    SPComponentLoader.loadCss("/sites/common/SiteAssets/CustomShell/CSS/incyte-custom-style.css");
    SPComponentLoader.loadCss("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    this.getEventDetails();
  }

  public getEventDetails() {
    console.log(this.props.user);
    var queryParameters = new UrlQueryParameterCollection(window.location.href);
    const restFullURL = this.props.siteurl + "/_api/lists/GetByTitle('Calendar')/items?$select=ID,Title,Location,EventDate,EndDate,Description&$filter=(ID eq " + queryParameters.getValue("ID") + ")";
    console.log(restFullURL);
    this.props.spHttpClient.get(restFullURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((responseJSON: any) => {
          this.checkUser(responseJSON.value);
        });
      });
  }

  public checkUser(info) {
    const restFullURL = this.props.siteurl + "/_api/lists/GetByTitle('Enrolls')/items?$select=ID,Title,UserName,EventID&$filter=(EventID eq " + info[0].ID + ") and (UserName eq '" + this.props.user + "')";
    console.log(restFullURL);
    this.props.spHttpClient.get(restFullURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((responseJSON: any) => {
          if (!responseJSON.error) {
            if (responseJSON.value.length !== 0) {
              this.setState({
                items: info,
                checkEnrollement: true,
                error: false
              });
            }
            else {
              this.setState({
                items: info,
                error: false
              });
            }
            console.log(this.state);
          }
          else {
            this.setState({
              error: true,
              errorMessgae: responseJSON.error.message
            });
          }
        });
      });
    console.log(this.state.items.length);
  }

  public render(): React.ReactElement<IEnrollEventsProps> {

    const enrolledSuccessfully = this.state.enrolledSuccessfully;
    let ele;
    if (enrolledSuccessfully !== true) {
      ele = <div className="alert alert-danger">
        <strong><i className="fa fa-exclamation-triangle" aria-hidden="true"> </i> Note: </strong>
        {this.props.user} already Enrolled for this event.
    </div>;
    }
    else {
      ele = <div className="alert alert-success">
        <strong><i className="fa fa-check-circle" aria-hidden="true"> </i> Success: </strong>
        {this.props.user} Enrolled Successfully.
    </div>;
    }
    if (this.state.items.length !== 0) {
      if (this.state.checkEnrollement !== false) {
        return (
          <div className={styles.enrollEvents}>
            <div className={`${styles.borderRow} row`}>
              <div className={`${styles.panelUpdate} panel panel-primary`}>
                <div className="panel-heading">
                  <h3 className={styles.mainTitle}><i className="fa fa-bullhorn" aria-hidden="true"> </i> Enroll Events</h3>
          </div>
              </div>
              <div className="panel-body">
                <div className="row-fluid">
                  {ele}
                </div>
                {
                  this.state.items.map(item =>
                    <div className="row">
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>User Name:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>{this.props.user}</h5>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>Event Title:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>{item.Title}</h5>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>Event Description:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>{item.Description}</h5>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>Event Date:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>
                            <Moment format="MMMM Do YYYY">{item.EventDate}</Moment>
                          </h5>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>Location:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>{item.Location}</h5>
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3">
                          <label className={styles.eventlable}>Event Timings:</label>
                        </div>
                        <div className="col-sm-8">
                          <h5 className={styles.eventInfo}>
                            <Moment format="h:mm A">{item.EventDate}</Moment> - <Moment format="h:mm A">{item.EndDate}</Moment>
                          </h5>
                        </div>
                      </div>
                    </div>
                  )
                }
                <div className="row">
                  <div className="form-group row">
                    <div className="col-sm-offset-2 col-sm-6">
                      <button disabled className="btn btn-primary" type="button" onClick={() => this.postUserData(this.state.items)}>
                        <i className="fa fa-plus-square" aria-hidden="true"> </i> Enroll
                  </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      }
      else {
        if (this.state.error === true) {
          return (
            <div className={styles.enrollEvents}>
              <div className={`${styles.borderRow} row`}>
                <div className={`${styles.panelUpdate} panel panel-primary`}>
                  <div className="panel-heading">
                  <h3 className={styles.mainTitle}><i className="fa fa-bullhorn" aria-hidden="true"> </i> Enroll Events</h3>
                </div>
                </div>
                <div className="panel-body">
                  <div className="alert alert-danger">
                    <strong><i className="fa fa-exclamation-triangle" aria-hidden="true"> </i> Note: </strong>
                    {this.state.errorMessgae} Please Contact IT.
                </div>
                </div>
              </div>
            </div>
          );
        }
        else {
          return (
            <div className={styles.enrollEvents}>
              <div className={`${styles.borderRow} row`}>
                <div className={`${styles.panelUpdate} panel panel-primary`}>
                  <div className="panel-heading">
                  <h3 className={styles.mainTitle}><i className="fa fa-bullhorn" aria-hidden="true"> </i> Enroll Events</h3>
          </div>
                </div>
                <div className="panel-body">
                  {
                    this.state.items.map(item =>
                      <div className="row">
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>User Name:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>{this.props.user}</h5>
                          </div>
                        </div>
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>Event Title:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>{item.Title}</h5>
                          </div>
                        </div>
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>Event Description:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>{item.Description}</h5>
                          </div>
                        </div>
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>Event Date:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>
                              <Moment format="MMMM Do YYYY">{item.EventDate}</Moment>
                            </h5>
                          </div>
                        </div>
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>Location:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>{item.Location}</h5>
                          </div>
                        </div>
                        <div className="form-group row">
                          <div className="col-sm-3">
                            <label className={styles.eventlable}>Event Timings:</label>
                          </div>
                          <div className="col-sm-8">
                            <h5 className={styles.eventInfo}>
                              <Moment format="h:mm A">{item.EventDate}</Moment> - <Moment format="h:mm A">{item.EndDate}</Moment>
                            </h5>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  <div className="row">
                    <div className="form-group row">
                      <div className="col-sm-offset-2 col-sm-6">
                        <button className="btn btn-primary" type="button" onClick={() => this.postUserData(this.state.items)}>
                          <i className="fa fa-plus-square" aria-hidden="true"> </i> Enroll
                  </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      }
    }
    else{
      return(
        <div className={styles.enrollEvents}>
            <img className="img-responsive" src={this.props.siteurl+"/SiteAssets/Enroll-Events/loading.gif"}/>
        </div>
      );
    }
  }

}

    // console.log(this.props.user);
    // var queryParameters = new UrlQueryParameterCollection(window.location.href);
    // const restFullURL = this.props.siteurl + "/_api/lists/GetByTitle('Calendar')/items?$select=ID,Title,Location,EventDate,EndDate,Description&$filter=(ID eq " + queryParameters.getValue("ID") + ")";
    // console.log(restFullURL);
    // this.props.spHttpClient.get(restFullURL, SPHttpClient.configurations.v1)
//   .then((response: SPHttpClientResponse) => {
//     response.json().then((responseJSON: any) => {
//       console.log(responseJSON);          
//       this.setState({
//         items: responseJSON.value
//       });
//       console.log(this.state);
//     });
//   });
// {
//   this.state.items.map(item =>
//     <div className={`${styles.rowSpan} row`}>
//       <div className="col-sm-2">
//         <b className={`${styles.calendarIcon} fa-stack fa-2x`}>
//           <i className="fa fa-calendar-o fa-stack-2x"></i>
//           <i className={`${styles.month} fa-stack-1x calendar-text`}>
//             <Moment format="MMM">{item.EventDate}</Moment>
//           </i>
//           <i className={`${styles.day} fa-stack-1x calendar-text `}>
//             <Moment format="DD">{item.EventDate}</Moment>
//           </i>
//         </b>
//       </div>
//       <div className="col-sm-10">
//         <div className="row">
//           <p className={styles.eventsDate}>
//             <Moment format="MMMM Do YYYY">{item.EventDate}</Moment>, <Moment format="h A">{item.EventDate}</Moment> to <Moment format="h A">{item.EndDate}</Moment>
//           </p>
//         </div>
//         <div className="row">
//           <h4 className={styles.eventsSubTitle}>
//             {item.Title}  &nbsp;
//                     <a target="_blank" href={"/sites/ratnadev/pages/Events?ID=".concat(item.ID)}>
//               | Enroll
//                     </a>
//           </h4>
//         </div>
//       </div>
//     </div>
//   )
// }

// return (
//   <div className={styles.enrollEvents}>
//     <div className={styles.container}>
//       <div className={styles.row}>
//         <div className={styles.column}>
//           <span className={styles.title}>Welcome to SharePoint!</span>
//           <p className={styles.subTitle}>Customize SharePoint experiences using Web Parts.</p>
//           <p className={styles.description}>{escape(this.props.description)}</p>
//           <a href="https://aka.ms/spfx" className={styles.button}>
//             <span className={styles.label}>Learn more</span>
//           </a>
//         </div>
//       </div>
//     </div>
//   </div>
// );