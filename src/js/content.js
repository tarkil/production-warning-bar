import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import WarningBar from './components/warningBar.jsx';
import WarningModal from './components/warningModal.jsx'
import injectTapEventPlugin from 'react-tap-event-plugin';

import Url from './model/Url'
import PreferencesManager from './utils/preferences.js';
import ShadowDOM from 'react-shadow';
import 'semantic-ui-css/semantic.min.css';

injectTapEventPlugin();

let instance = null;

class Content {

    constructor() {
        if (!instance) {
            instance = this;
            this.find = false;
        }
        return instance;
    }

    execute() {
        //Get the stored values
        PreferencesManager.INSTANCE().loadPreferences((items) => {
            for (let key in items.environments) {
                var environment = items.environments[key];
                if (!this.found) {
                    PreferencesManager.INSTANCE().loadEnvironment(environment, (elements) => {
                        this.loadWarningComponents(elements);
                    });
                }
            }
        });
    }


    loadWarningComponents(value) {
        let items = value[Object.keys(value)[0]];
        var noMatch = true;

        //loop through domains and see if current domain is part of list
        for (var key in items.domainList) {
            let domain = items.domainList[key];
            const url = new Url(document.location);
            if (url.isFromDomain(domain) && noMatch) {
                if (items.enableWarningBar) {
                    let blankSpace = Content.createHTMLElement('<div id="production-warning-blank-space"/>');
                    document.body.insertBefore(blankSpace, document.body.firstChild);
                    //create warning bar
                    let html = '<div id="production-warning-all" style="position: fixed !important; ' +
                        'left: 0 !important; width: 100% !important; top: 0 !important; z-index: 2147483647 !important"/>';
                    let container = Content.createHTMLElement(html);
                    document.body.insertBefore(container, document.body.firstChild);

                    let productionWarningBar = document.getElementById('production-warning-all');
                    const barStyle = {
                        'backgroundColor': items.barColor,
                        'filter': 'none !important'
                    };

                    ReactDOM.render(
                        <MuiThemeProvider>
                            <WarningBar title={items.barText} style={barStyle} onClose={() => {
                                document.getElementById('production-warning-blank-space').setAttribute('style', `height: 0px`);
                            }} />
                        </MuiThemeProvider>, productionWarningBar);
                    document.getElementById('production-warning-blank-space').setAttribute('style', `height: ${productionWarningBar.clientHeight}px`);
                }

                if (items.enableWarningModal) {
                    //Workaround to load icons and fonts http://robdodson.me/at-font-face-doesnt-work-in-shadow-dom/
                    const eotFont = chrome.extension.getURL('build/js/icons.eot');
                    const ttfFont = chrome.extension.getURL('build/js/icons.ttf');
                    const svgFont = chrome.extension.getURL('build/js/icons.svg');

                    var newStyle = document.createElement('style');
                    newStyle.appendChild(document.createTextNode(`
                    @font-face {
                        font-family: 'Icons';
                        src: url("${eotFont}");
                        src: url("${eotFont}?#iefix") format('embedded-opentype'), url("${ttfFont}") format('truetype'), url("${svgFont}#icons") format('svg');
                        font-style: normal;
                        font-weight: normal;
                        font-variant: normal;
                        text-decoration: inherit;
                        text-transform: none;
                      }
                    `));

                    document.head.appendChild(newStyle);
                    //--
                    let container = Content.createHTMLElement('<div id="warning-modal-container"/>');
                    document.body.appendChild(container);
                    container = document.getElementById('warning-modal-container');
                    ReactDOM.render(
                        <ShadowDOM include={[chrome.extension.getURL('build/js/styles.css')]}>
                            <div id="warning-modal">
                                <WarningModal />
                            </div>
                        </ShadowDOM>, container);
                }

                if (items.filter !== "none") {
                    document.getElementsByTagName('body')[0].style.filter = items.filter;
                }
                //make sure only one bar is made
                noMatch = false;
            }
            this.found = !noMatch;
        }
    }

    /* Creates a new html edit form a string. Got this from stackoverflow
     * @link http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
     * @param {string} htmlStr the string to make into html element
     * @returns {DocumentFragment} DOM element
     */
    static createHTMLElement(htmlStr) {
        let frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    }
}

let content = new Content();
content.execute();