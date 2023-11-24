const content = document.querySelector('.content');

function getTasksFromStorage() {
  chrome.storage.sync.get(['tasks'], function (result) {
    if (result.tasks.length > 0) {
      const newFormattedTasks = convertDateTimeFormat(result.tasks);
      renderTasks(newFormattedTasks);
    }
  });
}
getTasksFromStorage();

function renderTasks(tasks) {
  tasks.map((task, id) => {
    renderTasksCard(task.name, task.week, task.month, task.year, task.time, task.timeIsUp, id);
  });
}

function convertDateTimeFormat(tasks) {
  const currentTime = new Date().getTime();
  return tasks.map((task) => {
    const date = new Date(task.date);
    const taskTime = new Date(task.date).getTime();

    const isTimeIsUp = currentTime >= taskTime;

    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };

    const formattedDate = date.toLocaleDateString('en-US', options);
    const splitDate = formattedDate.split(', ');

    return {
      week: splitDate[0],
      month: splitDate[1],
      year: splitDate[2].split(' at ')[0],
      time: splitDate[2].split(' at ')[1],
      name: task.name,
      timeIsUp: isTimeIsUp,
    };
  });
}

function deleteTask(index) {
  chrome.storage.sync.get({ tasks: [] }, (data) => {
    const tasks = data.tasks;

    if (index >= 0 && index < tasks.length) {
      tasks.splice(index, 1);
      chrome.storage.sync.set({ tasks: tasks }, () => {
        reloadTab();
      });
    }
  });
}

function reloadTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (currentTab) {
      chrome.tabs.reload(currentTab.id);
    }
  });
}

function renderTasksCard(name, week, month, year, timeNumb, timeIsUp, id) {
  const frame = document.createElement('div');
  frame.classList.add('frame');

  const list = document.createElement('div');
  list.classList.add('list');

  const head = document.createElement('div');
  head.classList.add('head');

  const title = document.createElement('div');
  title.classList.add('title');
  title.textContent = week;

  const subtitle = document.createElement('div');
  subtitle.classList.add('subtitle');
  subtitle.textContent = `${month}, ${year}`;

  const time = document.createElement('div');
  time.classList.add('time');
  if (timeIsUp) {
    time.classList.add('time_is_up');
  }
  time.textContent = timeNumb;

  const ul = document.createElement('ul');
  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', `item-${id}`);
  checkbox.setAttribute('name', 'item-1');

  const labelForCheckbox = document.createElement('label');
  labelForCheckbox.setAttribute('for', `item-${id}`);
  labelForCheckbox.classList.add('text');
  labelForCheckbox.textContent = name;

  const labelForButton = document.createElement('label');
  labelForButton.setAttribute('for', `item-${id}`);
  labelForButton.classList.add('button');

  const wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('version', '1.1');
  svg.setAttribute('id', 'Layer_1');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');
  svg.setAttribute('viewBox', '0 0 98.5 98.5');
  svg.setAttribute('enable-background', 'new 0 0 98.5 98.5');
  svg.setAttribute('xml:space', 'preserve');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'checkmark');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-width', '8');
  path.setAttribute('stroke-miterlimit', '10');
  path.setAttribute(
    'd',
    'M81.7,17.8C73.5,9.3,62,4,49.2,4 C24.3,4,4,24.3,4,49.2s20.3,45.2,45.2,45.2s45.2-20.3,45.2-45.2c0-8.6-2.4-16.6-6.5-23.4l0,0L45.6,68.2L24.7,47.3',
  );

  const timeTrackerWrapper = document.createElement('div');
  timeTrackerWrapper.classList.add('timeTreker_wrapper');
  const timeTrackerBtns = document.createElement('div');
  timeTrackerBtns.classList.add('timeTracker_btns');

  const timeTracker = document.createElement('p');
  timeTracker.classList.add('timeTreker');
  timeTracker.textContent = '00:00';

  const timeTrackerBtn = document.createElement('button');
  timeTrackerBtn.classList.add('timeTreker_btn');
  timeTrackerBtn.textContent = 'Start';

  const timeTrackerBtnReset = document.createElement('button');
  timeTrackerBtnReset.classList.add('timeTracker_btnReset');
  timeTrackerBtnReset.textContent = 'Reset';

  const basketWrapper = document.createElement('div');
  basketWrapper.classList.add('basket_wrapper');

  const basket = document.createElement('img');
  basket.src = '../assets/basket.png';
  basket.alt = 'basket';
  basket.classList.add('basket');

  basketWrapper.appendChild(basket);
  list.appendChild(basketWrapper);
  timeTrackerBtns.append(timeTrackerBtn, timeTrackerBtnReset);
  svg.appendChild(path);
  frame.appendChild(list);
  list.appendChild(head);
  head.appendChild(title);
  head.appendChild(subtitle);
  head.appendChild(time);
  list.appendChild(ul);
  ul.appendChild(li);
  li.appendChild(checkbox);
  li.appendChild(labelForCheckbox);
  li.appendChild(labelForButton);
  wrapper.appendChild(svg);
  li.appendChild(wrapper);
  list.appendChild(timeTrackerWrapper);
  timeTrackerWrapper.appendChild(timeTracker);
  timeTrackerWrapper.appendChild(timeTrackerBtns);
  content.append(frame);

  let stopwatchInterval;
  let secondsCounter = 0;
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      timeTrackerBtn.disabled = true;
      timeTrackerBtnReset.disabled = true;
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      timeTrackerBtn.textContent = 'Start';
      timeTrackerBtn.style.background = 'rgba(100, 58, 122, 0.5)';
      timeTrackerBtnReset.style.background = 'rgba(100, 58, 122, 0.5)';
    } else {
      timeTrackerBtn.disabled = false;
      timeTrackerBtnReset.disabled = false;
      timeTrackerBtn.style.background = '#643A7A';
      timeTrackerBtnReset.style.background = '#643A7A';
    }
  });

  timeTrackerBtn.addEventListener('click', () => {
    if (!stopwatchInterval) {
      stopwatchInterval = setInterval(() => updateStopwatch(timeTracker), 1000);
      timeTrackerBtn.textContent = 'Stop';
    } else {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      timeTrackerBtn.textContent = 'Start';
    }
  });

  function updateStopwatch(timeTracker) {
    secondsCounter++;
    const minutes = Math.floor(secondsCounter / 60);
    const seconds = secondsCounter % 60;
    timeTracker.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  }

  timeTrackerBtnReset.addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    secondsCounter = 0;
    timeTracker.textContent = '00:00';
    timeTrackerBtn.textContent = 'Start';
  });

  basket.addEventListener('click', () => {
    deleteTask(id);
  });
}
