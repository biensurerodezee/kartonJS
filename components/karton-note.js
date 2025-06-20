import { KartonElement, html } from '../KartonElement.js';

/*
<!-- Example KartonNote Configuration --> 
<template>
  <note>
    <to>Tove</to>
    <from>Jani</from>
    <heading>Reminder</heading>
    <body>Don't forget me this weekend!</body>
  </note>
</template>
*/

customElements.define('karton-note', class extends KartonElement {

  parseXmlConfig() {
    const template = this.querySelector('script[type="text/xml"]');
    if (template) {
      try {
        return this.parseXml(template.textContent.trim());
      } catch (e) {
        logdev(`Failed to parse XML template config within element <${this.tagName.toLowerCase()}>`, e);
      }
    } else {
      return;
    }
  }

  parseXml(xml, arrayTags) {
      let dom = null;
      if (window.DOMParser) dom = (new DOMParser()).parseFromString(xml, "text/xml");
      else if (window.ActiveXObject) {
          dom = new ActiveXObject('Microsoft.XMLDOM');
          dom.async = false;
          if (!dom.loadXML(xml)) throw dom.parseError.reason + " " + dom.parseError.srcText;
      }
      else throw new Error("cannot parse xml string!");

      function parseNode(xmlNode, result) {
          if (xmlNode.nodeName == "#text") {
              let v = xmlNode.nodeValue;
              if (v.trim()) result['#text'] = v;
              return;
          }

          let jsonNode = {},
              existing = result[xmlNode.nodeName];
          if (existing) {
              if (!Array.isArray(existing)) result[xmlNode.nodeName] = [existing, jsonNode];
              else result[xmlNode.nodeName].push(jsonNode);
          }
          else {
              if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) result[xmlNode.nodeName] = [jsonNode];
              else result[xmlNode.nodeName] = jsonNode;
          }

          if (xmlNode.attributes) for (let attribute of xmlNode.attributes) jsonNode[attribute.nodeName] = attribute.nodeValue;

          for (let node of xmlNode.childNodes) parseNode(node, jsonNode);
      }

      let result = {};
      for (let node of dom.childNodes) parseNode(node, result);

      return result;
  }

  init() {
  
    const xmlString = `
      <Order>
        <Customer>Jack</Customer>
        <Rating>6.0</Rating>
      </Order>
    `;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const customer = xmlDoc.querySelector("Customer").textContent;

    console.log("Customer:", customer);
  
    // Default content
    this.content = {
      note: {
        to: 'Someone',
        from: 'Me',
        heading: 'comment',
        body: 'Let us walk this week!'
      }
    };

    // Apply template-based config
    const parsed = this.parseXmlConfig();
    this.content = {
      //...this.content,
      ...parsed,
    };
  
    console.log("content", this.content);
  }

  template() {
    return html`
      <div class="card">
        <header>${this.content.note.from} -> ${this.content.note.to}</header>
        <main>
          <b>${this.content.note.body}</b>
        </main>
        <footer>${this.content.note.heading}</footer>
      </div>
    `;
  }

});
