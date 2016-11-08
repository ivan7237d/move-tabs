'use strict';

let setState = state => {
  if (state === null) {
    sessionStorage.removeItem('state');
    chrome.browserAction.setBadgeText({ text: '' });
  } else {
    sessionStorage.setItem('state', JSON.stringify(state));
    chrome.browserAction.setBadgeText({ text: '?' });
  }
};

let getState = () => JSON.parse(sessionStorage.getItem('state'));

chrome.browserAction.onClicked.addListener(currentTab => {
  let state = getState();
  if (state) {
    setState(null);
  } else {
    chrome.tabs.query({ currentWindow: true, highlighted: true },
      highlightedTabs => {
        setState({
          tabs: highlightedTabs.map(tab => tab.id),
          currentTab: currentTab.id,
          window: currentTab.windowId
        });
      });
  }
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId != chrome.windows.WINDOW_ID_NONE) {
    let state = getState();
    if (state) {
      if (windowId != state.window) {
        setState(null);
        chrome.tabs.move(state.tabs, { windowId: windowId, index: -1 }, () => {
          chrome.tabs.update(state.currentTab, { active: true });
        });
      }
    }
  }
}, { windowTypes: ['normal'] });
