/*jshint esversion: 6 */
/*jshint browser: true */
/*jslint devel: true */
'use strict';

// Data
const AJAX_WORKOUT_DATA = [
  {type: 0, name: "Dead lift", duration: 28, reps: 6},
  {type: 1, duration: 30},
  {type: 0, name: "Dead lift", duration: 28, reps: 6},
  {type: 1, duration: 30},
  {type: 0, name: "Dead lift", duration: 28, reps: 6},
  {type: 1, duration: 30},
  {type: 0, name: "Barbell push press", duration: 30, reps: 8},
  {type: 1, duration: 30},
  {type: 0, name: "Barbell push press", duration: 30, reps: 8},
  {type: 1, duration: 30},
  {type: 0, name: "Underhand pull-ups", duration: 30, reps: 12},
  {type: 1, duration: 30},
  {type: 0, name: "Underhand pull-ups", duration: 30, reps: 12},
  {type: 1, duration: 30},
  {type: 0, name: "Underhand pull-ups", duration: 30, reps: 12},
  {type: 1, duration: 30},
  {type: 0, name: "Split jumps", duration: 30, reps: 30},
  {type: 1, duration: 30},
  {type: 0, name: "Split jumps", duration: 30, reps: 30},
  {type: 1, duration: 30},
  {type: 0, name: "Split jumps", duration: 30, reps: 30},
  {type: 1, duration: 30},
  {type: 0, name: "Bench press", duration: 30, reps: 5},
  {type: 1, duration: 30},
  {type: 0, name: "Bench press", duration: 30, reps: 5},
  {type: 1, duration: 30},
  {type: 0, name: "Bench press", duration: 30, reps: 5},
  {type: 1, duration: 30},
  {type: 0, name: "Bench press", duration: 30, reps: 5},
  {type: 1, duration: 120}
];

// Selectors
const S_WORKOUT = '.js-workout';
const S_WORKOUT_ITEMS = '.js-workout-items';
const S_WORKOUT_PLAY_PAUSE = '.js-workout-play-pause';
const S_WORKOUT_PLAY_PAUSE_ICON = '.js-workout-play-pause-icon';
const S_WORKOUT_NEXT = '.js-workout-next';
const S_WORKOUT_PREVIOUS = '.js-workout-previous';
const S_WORKOUT_TOTAL_TIME = '.js-workout-total-time';
const S_WORKOUT_ITEMS_DONE = '.js-workout-items-done';
const S_ITEM = '.js-item';
const S_ITEM_NAME = '.js-item-name';
const S_ITEM_DESCRIPTION = '.js-item-description';
const S_ITEM_TIME = '.js-item-time';
const S_ITEM_REP_COUNT = '.js-item-rep-count';

// Modifier classes
const M_HIDDEN = '--hidden';
const M_SELECTED = '--selected';

// Classes
const C_PLAY_ICON = 'fa-play';
const C_PAUSE_ICON = 'fa-pause';

// Enum
const WORKOUT_ITEM_TYPES = {
  EXERCISE: 0,
  REST: 1
};

const secondsToHourStamp = (seconds) => {
  const secondsPerHour = 60 * 60;
  const secondsPerMinute = 60;

  const hours = Math.floor(seconds / secondsPerHour);
  const minutesRemainder =  Math.floor((seconds % secondsPerHour) / secondsPerMinute);
  const secondsRemainder = (seconds % secondsPerMinute);

  const prefixZero = (number) => {
    const prefix = (number < 10) ? '0' : '';
    return prefix + number;
  };

  return `${prefixZero(hours)}:${prefixZero(minutesRemainder)}:${prefixZero(secondsRemainder)}`;
};

const createWorkoutItemElements = (workoutData) => {

  const workoutItemsEle = document.querySelector(S_WORKOUT_ITEMS);
  const hiddenItemEls = workoutItemsEle.querySelectorAll(S_ITEM);
  const hiddenExerciseItemEle = hiddenItemEls[0];
  const hiddenRestItemEle = hiddenItemEls[1];

  workoutData.forEach((item, i) => {

    if (item.type === WORKOUT_ITEM_TYPES.REST) {
       // Create rest item
       const itemEle = hiddenRestItemEle.cloneNode(true);
       const itemDescriptionEle = itemEle.querySelector(S_ITEM_DESCRIPTION);
       const itemDurationEle = itemEle.querySelector(S_ITEM_TIME);

       // Set data
       itemEle.dataset.index = i+1;
       itemDescriptionEle.innerText =  item.duration + 's';
       itemDurationEle.innerText = item.duration;

       // Remove hidden modifier
       itemEle.classList.remove(M_HIDDEN);

       // Add to workoutItems
       workoutItemsEle.appendChild(itemEle);
     }

    else if (item.type === WORKOUT_ITEM_TYPES.EXERCISE) {
      // Create exercise item
      const itemEle = hiddenExerciseItemEle.cloneNode(true);
      const itemNameEle = itemEle.querySelector(S_ITEM_NAME);
      const itemDescriptionEle = itemEle.querySelector(S_ITEM_DESCRIPTION);
      const itemRepCountEle = itemEle.querySelector(S_ITEM_REP_COUNT);
      const itemDurationEle = itemEle.querySelector(S_ITEM_TIME);

      // Set data
      itemEle.dataset.index = i+1;
      itemNameEle.innerText = item.name;
      itemDescriptionEle.innerText = item.reps + ' reps';
      itemRepCountEle.innerText = 1;
      itemDurationEle.innerText = item.duration;

      // Remove hidden modifier
      itemEle.classList.remove(M_HIDDEN);

      // Add to workoutItems
      workoutItemsEle.appendChild(itemEle);
    }

  });
};

const createWorkoutItem = (itemEle, itemData, callback) => {
  const _type = itemData.type;
  let _intervalId;
  let _active = false;
  let _selected = false;
  let _duration = itemData.duration;
  let _passedSeconds = 0;

  // Exercise item type variables
  let _reps;
  let _repCount;
  let _singleRepDuration;

  if (_type === WORKOUT_ITEM_TYPES.EXERCISE) {
    _reps = itemData.reps;
    _repCount = 0;
    _singleRepDuration = _duration / _reps;
  }

  const _startTimer = () => {
    _intervalId = setInterval(_secondPassed, 1000);
  };

  const _stopTimer = () => {
    clearInterval(_intervalId);
  };

  const _secondPassed = () => {
    setPassedSeconds(_passedSeconds + 1);
  };

  const _updateElements = () => {
    // Update item timer
    const timerDurationEle = itemEle.querySelector(S_ITEM_TIME);
    const pendingSeconds = _duration - _passedSeconds;
    timerDurationEle.innerText = pendingSeconds;

    // Update item rep count
    if (_type === WORKOUT_ITEM_TYPES.EXERCISE) {
      const repCountEle = itemEle.querySelector(S_ITEM_REP_COUNT);
      repCountEle.innerText =_repCount;
    }
  };

  const getElementHeight = () => {
    return itemEle.offsetHeight;
  };

  const setPassedSeconds = (seconds) => {
    _passedSeconds = seconds;

    // Update repcount
    if (_type === WORKOUT_ITEM_TYPES.EXERCISE) {
      if (_passedSeconds > (_singleRepDuration * _repCount)) {
        _repCount++;
      }
    }

    _updateElements();

    // If the item timer is done, reset and invoke callback.
    if (_passedSeconds >= _duration) {
      reset();
      callback();
    }
  };

  const start = () => {
    if (!_active) {
      _active = true;
      _startTimer();
    }
  };

  const stop = () => {
    if (_active) {
      _active = false;
      _stopTimer();
    }
  };

  const select = () => {
    if (!_selected) {
      _selected = true;
      itemEle.classList.add(M_SELECTED);
    }
  };

  const unselect = () => {
    if (_selected) {
      _selected = false;
      itemEle.classList.remove(M_SELECTED);
    }
  };

  const reset = () => {
    stop();
    unselect();
    setPassedSeconds(0);
  };

  const getDuration = () => _duration;

  const getPassedSeconds = () => _passedSeconds;

  const getRepCount = () => _repCount;

  //--- Return object ---//
  const item = {
    start: start,
    stop: stop,
    select: select,
    unselect: unselect,
    reset: reset,
    setPassedSeconds: setPassedSeconds,
    getDuration: getDuration,
    getPassedSeconds: getPassedSeconds,
    getElementHeight: getElementHeight
  };

  if (_type === WORKOUT_ITEM_TYPES.EXERCISE) {
    item.getRepCount = getRepCount;
  }

  return item;
};

const createWorkoutTimer = (workoutTimerEle, workoutData) => {
  let _intervalId; // The interval id is needed to clear the inverval later.
  let _active = false;
  let _passedSeconds = 0;
  let _items;
  let _currentItem = 1;

  const _startTimer = () => {
    _intervalId = setInterval(_secondPassed, 1000);
  };

  const _stopTimer = () => {
    clearInterval(_intervalId);
  };

  const _secondPassed = () => {
    _passedSeconds++;

    // Update the total time
    const totalTimeEle = workoutTimerEle.querySelector(S_WORKOUT_TOTAL_TIME);
    totalTimeEle.innerText = secondsToHourStamp(_passedSeconds);
  };

  const _scrollToItem = (index = _currentItem) => {
    let scrollTopDistance = 0;

    // Iterate items and add each element height to scrollTopDistance.
    // Stop before current item is reached.
    for (let i = 1; i < _currentItem; i++) {
      scrollTopDistance += getCurrentItem().getElementHeight();
    }

    const workoutItemList = workoutTimerEle.querySelector(S_WORKOUT_ITEMS);
    workoutItemList.scrollTop = scrollTopDistance;
  };

  const start = () => {
    if (!_active) {
      // Timer is not running, start timer.
      _active = true;
      _startTimer();

      // Start current item
      getCurrentItem().start();

      // Change icon to pause icon
      const playPauseIcon = workoutTimerEle.querySelector(S_WORKOUT_PLAY_PAUSE_ICON);
      playPauseIcon.classList.remove(C_PLAY_ICON);
      playPauseIcon.classList.add(C_PAUSE_ICON);
    }
  };

  const stop = () => {
    if (_active) {
      // Timer is running, stop timer.
      _active = false;
      _stopTimer();

      // Pause current item
      getCurrentItem().stop();

      // Change icon to play icon
      const playPauseIcon = workoutTimerEle.querySelector(S_WORKOUT_PLAY_PAUSE_ICON);
      playPauseIcon.classList.remove(C_PAUSE_ICON);
      playPauseIcon.classList.add(C_PLAY_ICON);
    }
  };

  const setCurrentItem = (itemPos) => {
    // Check if index is valid
    if (itemPos >= 1 && itemPos <= _items.length) {

      // Set new item as current item.
      getCurrentItem().reset();
      _currentItem = itemPos;
      getCurrentItem().select();

      // If timer is active, start current item.
      if (_active) {
        getCurrentItem().start();
      }

      // Update the workout item count
      const itemsDoneCountEle = workoutTimerEle.querySelector(S_WORKOUT_ITEMS_DONE);
      itemsDoneCountEle.innerText = _currentItem + ' / ' + _items.length;
    }
  };

  const nextItem = () => {
    if (_currentItem < _items.length) {
      // There is a next item, set it as current item.
      setCurrentItem(_currentItem + 1);
      _scrollToItem();
    }
  };

  const previousItem = () =>  {
    if (_currentItem > 0) {
      // There is a previous item, set it as current item.
      setCurrentItem(_currentItem - 1);
      _scrollToItem();
    }
  };

  const getItems = () => _items;

  const getItem = (position) => _items[position-1];

  const getCurrentItem = () => _items[_currentItem-1];

  const getCurrentItemPosition = () => _currentItem;

  const getPassedSeconds = () =>  _passedSeconds;

  const isActive = () => _active;

  //-- Create workoutTimer items --//
  _items = (() => {
    let items = [];
    const itemEls = workoutTimerEle.querySelectorAll(S_ITEM+':not(.'+M_HIDDEN+')');

    workoutData.forEach((item, i) => {
      items.push(
        createWorkoutItem(itemEls[i], workoutData[i], nextItem)
      );
    });

    return items;
  })();

  // Set the first item as current
  setCurrentItem(1);

  //--- Return object ---//
  const workoutTimer = {
    start: start,
    stop: stop,
    setCurrentItem: setCurrentItem,
    nextItem: nextItem,
    previousItem: previousItem,
    getItem: getItem,
    getItems: getItems,
    getCurrentItem: getCurrentItem,
    getCurrentItemPosition: getCurrentItemPosition,
    getPassedSeconds: getPassedSeconds,
    isActive: isActive
  };

  //--- Event listeners ---//
  const playPauseButton = workoutTimerEle.querySelector(S_WORKOUT_PLAY_PAUSE);
  playPauseButton.addEventListener('click', () => {
    if (!_active) {
      workoutTimer.start();
    } else {
      workoutTimer.stop();
    }
  });

  const nextButton = workoutTimerEle.querySelector(S_WORKOUT_NEXT);
  nextButton.addEventListener('click', () => {
    workoutTimer.nextItem();
  });

  const previousButton = workoutTimerEle.querySelector(S_WORKOUT_PREVIOUS);
  previousButton.addEventListener('click', () => {
    workoutTimer.previousItem();
  });

  const workoutItemList = workoutTimerEle.querySelector(S_WORKOUT_ITEMS);
  workoutItemList.addEventListener('click', (e) => {
    const item = e.target.closest(S_ITEM);
    workoutTimer.setCurrentItem(Number(item.dataset.index));
  });

  return workoutTimer;
};

// On DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  createWorkoutItemElements(AJAX_WORKOUT_DATA);

  const workoutTimerEle = document.querySelector(S_WORKOUT);
  const workoutTimer = createWorkoutTimer(workoutTimerEle, AJAX_WORKOUT_DATA);
  workoutTimer.start();
});
