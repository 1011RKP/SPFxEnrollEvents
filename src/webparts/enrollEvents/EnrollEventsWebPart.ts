import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'EnrollEventsWebPartStrings';
import EnrollEvents from './components/EnrollEvents';
import { IEnrollEventsProps } from './components/IEnrollEventsProps';

export interface IEnrollEventsWebPartProps {
  description: string;
  siteurl:string;
  spHttpClient:string;
  user:string;
  sucessMessage:string;
}

export default class EnrollEventsWebPart extends BaseClientSideWebPart<IEnrollEventsWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IEnrollEventsProps > = React.createElement(
      EnrollEvents,
      {
        description: this.properties.description,
        siteurl: this.context.pageContext.web.absoluteUrl,
        spHttpClient:this.context.spHttpClient,
        user:this.context.pageContext.user.displayName,
        sucessMessage:this.properties.sucessMessage
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
