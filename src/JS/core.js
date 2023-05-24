import { PageContext } from "../state/context/PageContext.react";
import { TypeManager } from './tools';

const defConfig = {method: 'POST', headers: {'Content-Type': 'application/json'}}

export class Core {
  static async API_Fetch(fetchData, response) { // await App.API_Fetch({url: `/example/test`})
    const {url, conv} = fetchData;

    if (!PageContext.internetConnection) {
      // N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'error', 'text':'Unable to send request: No Internet Connection', 'displayDelay':100, 'displayTime':3000});
    }
  
    try {
      let req = await fetch(`https://drive.nanode.one${url[0] !== '/' ? '/' : ''}${url}${url.includes('?') ? '&host=true' : '?host=true'}`);
      if (!req.ok) throw new Error(req.statusText);
      if (conv === 'blob') { req = await req.blob() }
      else if (conv === 'text') { req = await req.text() }
      else { req = await req.json() }
      
      return req.Error ? false : req;
    } catch(err) { console.log(err) }
  }
  
  static async API_Post(sendData) { // await App.API_Post({url: `drive.nanode.one/`})
    const {url, body, skipErr=false} = sendData;

    // if (!App.InternetConnection) {
    //   N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'error', 'text':'Unable to send request: No Internet Connection', 'displayDelay':100, 'displayTime':3000});
    // }

    try {
      let res = await fetch(`https://drive.nanode.one${url[0] !== '/' ? '/' : ''}${url}?host=true`, {
        ...defConfig,
        body: new Blob( [ JSON.stringify(body) ], { type: 'text/plain' })
      })
      if (!res.ok && !skipErr) throw new Error(res.statusText);
      // N_.ClientStatus(3, "True", 500);
      return res.json();
    } catch(err) { console.log(err); }
  }
}
new Core();


// Generate Node ==========
export class Node {
  constructor(data, id, parent) {
    this.data = data;
    this.data.id = this.data.id || id;
    this.data.parent = this.data.parent || parent;
    this.data.type = TypeManager(data.mime || data.type.mime);
  }
}