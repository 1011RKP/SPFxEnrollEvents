import { SPHttpClient } from '@microsoft/sp-http'; 

export interface IEnrollEventsProps {
  description: string;
  siteurl:string;
  spHttpClient:SPHttpClient;
  user:string;
  sucessMessage:string;
}
