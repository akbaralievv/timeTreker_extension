'use strict';

//open options
const openOptionsButton = document.querySelector('.openOptions');

openOptionsButton.addEventListener('click', openOptions);

function openOptions() {
  chrome.tabs.create({ url: chrome.runtime.getURL('../options/option.html') });
}

//create treker
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
    console.log('Заполните все поля для создания задачи');
  }
}

function saveTaskToStorage(newDate) {
  chrome.storage.sync.get(['tasks'], function (result) {
    const existingData = result.tasks || [];
    existingData.push(newDate);

    chrome.storage.sync.set({ tasks: existingData }, function () {
      console.log('Данные успешно сохранены в chrome.storage.');
    });
  });
}

function notificationTimeIsUp() {
  chrome.notifications.create('done', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Time is up Task',
    message: `Time is up Task`,
    buttons: [{ title: 'Open Task List' }],
  });
}

function notificationTaskDone() {
  chrome.notifications.create('done', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Done Task',
    message: `Task done`,
    buttons: [{ title: 'Open Task List' }],
  });
}

function notificationTaskInvalid() {
  chrome.notifications.create('invalid', {
    type: 'basic',
    iconUrl: '../assets/logo.png',
    title: 'Invalid Task',
    message: `Дата должна быть в будущем времени на 1 минуту или более`,
  });
}

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'done' && buttonIndex === 0) {
    openOptions();
  }
});
