import {
  getRulesEnabledState,
  enableRulesForCurrentPage,
  disableRulesForCurrentPage,
} from '../scripts/service_worker.js';

('use strict');

//open options
const openOptionsButton = document.querySelector('#openOptions');

openOptionsButton.addEventListener('click', openOptions);

function openOptions() {
  chrome.tabs.create({ url: chrome.runtime.getURL('../options/option.html') });
}

//create task treker
const loginBtn = document.getElementById('login');
const signupBtn = document.getElementById('signup');
const login = document.querySelector('.login');
const signup = document.querySelector('.signup');
const taskName = document.querySelector('#taskName');
const taskDate = document.querySelector('#taskDate');
const createBtn = document.querySelector('.submit-btn');

loginBtn.addEventListener('click', loginBtnClick);
signupBtn.addEventListener('click', signupBtnClick);
createBtn.addEventListener('click', createTask);

function loginBtnClick(e) {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      parent.classList.add('slide-up');
    } else {
      signupBtn.parentNode.classList.add('slide-up');
      parent.classList.remove('slide-up');
    }
  });
}

function signupBtnClick(e) {
  let parent = e.target.parentNode;
  Array.from(e.target.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      parent.classList.add('slide-up');
    } else {
      loginBtn.parentNode.parentNode.classList.add('slide-up');
      parent.classList.remove('slide-up');
    }
  });
}

function createTask() {
  if (taskDate.value && taskName.value) {
    const nowDate = new Date();
    const newDate = new Date(taskDate.value);
    const futureDate = new Date(nowDate.getTime() + 60000);
    const delayInMilliseconds = newDate.getTime() - nowDate;

    if (newDate.getTime() > futureDate.getTime()) {
      saveTaskToStorage({ name: taskName.value, date: taskDate.value });
      notificationTaskDone();
      if (delayInMilliseconds > 0) {
        chrome.alarms.create('myAlarm', { delayInMinutes: delayInMilliseconds / (1000 * 60) });

        chrome.alarms.onAlarm.addListener(function (alarm) {
          if (alarm.name === 'myAlarm') {
            notificationTimeIsUp();
          }
        });
      }
      taskDate.value = '';
      taskName.value = '';
    } else {
      notificationTaskInvalid();
    }
  } else {
    console.log('Fill in all fields to create a Assignment ');
  }
}

function saveTaskToStorage(newDate) {
  chrome.storage.sync.get(['tasks'], function (result) {
    const existingData = result.tasks || [];
    existingData.push(newDate);

    chrome.storage.sync.set({ tasks: existingData }, function () {
      console.log('The data was successfully saved to chrome.storage.');
    });
  });
}

function notificationTimeIsUp() {
  chrome.notifications.create('done', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Time is up assignment ',
    message: `Time is up assignment`,
    buttons: [{ title: 'Open assignment List' }],
  });
}

function notificationTaskDone() {
  chrome.notifications.create('done', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Done assignment',
    message: `assignment done`,
    buttons: [{ title: 'Open assignment List' }],
  });
}

function notificationTaskInvalid() {
  chrome.notifications.create('invalid', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Invalid assignment',
    message: `The date must be 1 minute or more in the future tense`,
  });
}

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'done' && buttonIndex === 0) {
    openOptions();
  }
});

// remove the "Cookie" header from requests
const checkboxCookie = document.querySelector('#cbx-43');

async function updateCheckboxState() {
  const isEnabled = await getRulesEnabledState();
  if (!isEnabled) {
    checkboxCookie.checked = false;
  } else {
    checkboxCookie.checked = true;
  }
}
updateCheckboxState();

checkboxCookie.addEventListener('click', async () => {
  const isEnabled = await getRulesEnabledState();
  if (isEnabled) {
    await disableRulesForCurrentPage(checkboxCookie.checked ? true : false);
  } else {
    await enableRulesForCurrentPage(checkboxCookie.checked ? true : false);
  }
  updateCheckboxState();
});

//render cookies list
const list = document.querySelector('.cookies_list');
const urlAddress = document.querySelector('#url_address');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.cookies.getAll({ url: tabs[0].url }, function (cookies) {
    const ul = document.createElement('ul');
    list.appendChild(ul);
    if (cookies.length > 0) {
      cookies.map((cookie) => {
        const li = document.createElement('li');
        li.innerText = cookie.domain;
        ul.append(li);
      });
    } else {
      ul.innerHTML = `There are no cookies on this page`;
    }
  });
});

async function getUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      urlAddress.innerHTML = `List of cookies on this page "${url.hostname}"`;
    } catch {}
  }
}
getUrl();

// permissions cuurent extension
const permissionsWrapper = document.querySelector('.permissions');
const extensionId = chrome.runtime.id;
chrome.management.getPermissionWarningsById(extensionId, function (permissions) {
  const ol = document.createElement('ol');
  permissionsWrapper.append(ol);
  permissions.map((permission) => {
    const li = document.createElement('li');
    li.innerText = permission;
    ol.append(li);
  });
});

//adaptive size
chrome.system.display.getInfo(function (displays) {
  const widthDisplay = displays[0].bounds.width;
  const heightDisplay = displays[0].bounds.height;
  if (widthDisplay < 1000 || heightDisplay < 700) {
    document.querySelector('.form-structor').style.width = '310px';
    document.querySelector('.form-structor').style.height = '480px';
    document.querySelector('.center').style.top = '45%';
  }
});
