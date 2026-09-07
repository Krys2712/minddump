```javascript
let tasks = [];

let currentTaskIndex = 0;
let timerInterval = null;

let remainingSeconds = 0;
let totalSeconds = 0;

let isPaused = false;
let audioContext = null;

let breakDuration = 10;
let startTime = "09:00";

let flowItems = [];
let currentFlowIndex = 0;

let isBreak = false;


/* =========================
   EXAMPLES
========================= */

const examples = {

  school:
    "I have a computer science assignment due tomorrow, study for my networking test on Friday, finish my portfolio project this week and start learning Python.",

  work:
    "Finish the report by tomorrow, reply to the team email, prepare for Monday's meeting, organize my files and send the client update.",

  life:
    "Buy groceries, clean my room, call Mum tonight, reply to Sarah, do laundry and plan my weekend.",

  everything:
    "I have a computer science assignment due tomorrow, I need to study for my networking test on Friday, finish my portfolio project this week, reply to Sarah, buy groceries, clean my room, call Mum tonight and start learning Python."

};


/* =========================
   SCREEN CONTROL
========================= */

function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  window.scrollTo(0, 0);

}


/* =========================
   EXAMPLE BUTTONS
========================= */

document.querySelectorAll(".example-btn").forEach(button => {

  button.addEventListener("click", () => {

    const type = button.dataset.example;

    document.getElementById("brain-dump").value =
      examples[type];

  });

});


/* =========================
   ORGANIZE
========================= */

document
  .getElementById("organize-btn")
  .addEventListener("click", organizeThoughts);


function organizeThoughts() {

  const input =
    document.getElementById("brain-dump").value.trim();

  if (!input) {

    alert(
      "Dump something first — your brain deserves the unload."
    );

    return;

  }

  tasks = extractTasks(input);

  if (!tasks.length) {

    alert(
      "I couldn't identify any tasks. Try adding a few things you need to do."
    );

    return;

  }

  showScreen("processing-screen");

  runProcessing();

}


/* =========================
   PROCESSING ANIMATION
========================= */

function runProcessing() {

  const steps = [
    "step-1",
    "step-2",
    "step-3",
    "step-4"
  ];

  const messages = [
    "Reading your thoughts...",
    "Finding what needs to be done...",
    "Figuring out what matters most...",
    "Building your personal plan..."
  ];

  let index = 0;

  const interval = setInterval(() => {

    if (index > 0) {

      document
        .getElementById(steps[index - 1])
        .classList.add("done");

    }

    document.getElementById("processing-text").textContent =
      messages[index];

    index++;

    if (index === steps.length) {

      clearInterval(interval);

      document
        .getElementById(steps[3])
        .classList.add("done");

      setTimeout(() => {

        renderDashboard();

        showScreen("dashboard-screen");

      }, 700);

    }

  }, 650);

}


/* =========================
   TASK EXTRACTION
========================= */

function extractTasks(text) {

  let cleaned = text
    .replace(/\n+/g, ",")
    .replace(/[•●]/g, "")
    .replace(/\s+/g, " ")
    .trim();


  cleaned = cleaned.replace(
    /\s+(?:and\s+)?(?=(?:start|finish|complete|reply|respond|buy|clean|call|study|learn|send|prepare|submit|do|work|organize|plan)\b)/gi,
    ", "
  );


  let pieces = cleaned
    .split(/[,;]+/)
    .map(item => item.trim())
    .filter(Boolean);


  pieces = pieces.flatMap(piece => {

    const split = piece.split(
      /\s+(?=and\s+(?:start|finish|complete|reply|respond|buy|clean|call|study|learn|send|prepare|submit|do|work|organize|plan)\b)/i
    );

    return split.map(item =>
      item.replace(/^and\s+/i, "").trim()
    );

  });


  return pieces

    .map(title => {

      title = title.replace(/^[\s,.-]+/, "");

      if (!title) return null;

      return {

        title:
          title.charAt(0).toUpperCase() +
          title.slice(1),

        priority: detectPriority(title),

        category: detectCategory(title),

        duration: estimateDuration(title),

        completed: false

      };

    })

    .filter(Boolean);

}


/* =========================
   PRIORITY
========================= */

function detectPriority(text) {

  const highKeywords = [
    "tomorrow",
    "today",
    "tonight",
    "urgent",
    "asap",
    "deadline",
    "due",
    "immediately",
    "submit",
    "exam",
    "test"
  ];

  const mediumKeywords = [
    "this week",
    "assignment",
    "project",
    "report",
    "presentation",
    "meeting",
    "study",
    "portfolio",
    "prepare",
    "important"
  ];

  const lower = text.toLowerCase();

  if (
    highKeywords.some(word =>
      lower.includes(word)
    )
  ) {
    return "high";
  }

  if (
    mediumKeywords.some(word =>
      lower.includes(word)
    )
  ) {
    return "medium";
  }

  return "low";

}


/* =========================
   CATEGORY
========================= */

function detectCategory(text) {

  const lower = text.toLowerCase();

  if (
    /assignment|school|class|study|exam|test|portfolio|python|networking|computer science|learn/.test(lower)
  ) {
    return "School";
  }

  if (
    /work|meeting|client|report|office|team|project/.test(lower)
  ) {
    return "Work";
  }

  if (
    /groceries|clean|laundry|mum|room|call|reply|weekend/.test(lower)
  ) {
    return "Life";
  }

  return "Personal";

}


/* =========================
   DURATION ESTIMATION
========================= */

function estimateDuration(text) {

  const lower = text.toLowerCase();

  if (
    /assignment|project|portfolio|report|presentation/.test(lower)
  ) {
    return 60;
  }

  if (
    /study|exam|test|learn|learning/.test(lower)
  ) {
    return 45;
  }

  if (
    /clean|groceries|laundry|organize/.test(lower)
  ) {
    return 30;
  }

  if (
    /call|reply|message|email|send/.test(lower)
  ) {
    return 10;
  }

  return 20;

}


/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

  const totalMinutes = tasks.reduce(
    (sum, task) => sum + task.duration,
    0
  );

  const urgent = tasks.filter(
    task => task.priority === "high"
  ).length;


  document.getElementById("total-tasks").textContent =
    tasks.length;


  document.getElementById("total-time").textContent =
    formatTotalTime(totalMinutes);


  document.getElementById("urgent-tasks").textContent =
    urgent;


  const brainLoad = Math.min(
    100,
    Math.round((totalMinutes / 360) * 100)
  );


  document.getElementById("brain-load-value").textContent =
    `${brainLoad}%`;


  renderTaskGroup("high");
  renderTaskGroup("medium");
  renderTaskGroup("low");


  updatePlan();

}


/* =========================
   FORMAT TOTAL TIME
========================= */

function formatTotalTime(minutes) {

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${mins}m`;

}


/* =========================
   TASK GROUPS
========================= */

function renderTaskGroup(priority) {

  const container =
    document.getElementById(`${priority}-tasks`);

  container.innerHTML = "";


  const matchingTasks = tasks.filter(
    task => task.priority === priority
  );


  if (!matchingTasks.length) {

    container.innerHTML =
      `<p style="color:#96919b;font-size:13px;">No tasks here.</p>`;

    return;

  }


  matchingTasks.forEach(task => {

    const item = document.createElement("div");

    item.className = "task-item";

    item.innerHTML = `

      <strong>
        ${escapeHTML(task.title)}
      </strong>

      <div class="task-meta">

        <span>
          ${escapeHTML(task.category)}
        </span>

        <span>
          ${task.duration} min
        </span>

      </div>

    `;

    container.appendChild(item);

  });

}


/* =========================
   PLAN SETTINGS
========================= */

document
  .getElementById("break-duration")
  .addEventListener("change", updatePlan);


document
  .getElementById("start-time")
  .addEventListener("change", updatePlan);


function updatePlan() {

  breakDuration = Number(
    document.getElementById("break-duration").value
  );

  startTime =
    document.getElementById("start-time").value ||
    "09:00";


  buildFlowItems();

  renderPlan();

}


/* =========================
   BUILD MINDFLOW
========================= */

function buildFlowItems() {

  const sortedTasks = [...tasks].sort(
    (a, b) =>
      priorityValue(a.priority) -
      priorityValue(b.priority)
  );


  flowItems = [];


  sortedTasks.forEach((task, index) => {

    flowItems.push({

      type: "task",

      title: task.title,

      category: task.category,

      duration: task.duration,

      taskReference: task

    });


    /*
      Add breaks only BETWEEN tasks.
      No break is added after the final task.
    */

    if (
      breakDuration > 0 &&
      index < sortedTasks.length - 1
    ) {

      flowItems.push({

        type: "break",

        title: "Take a break",

        category: "BREAK",

        duration: breakDuration,

        taskReference: null

      });

    }

  });

}


function priorityValue(priority) {

  if (priority === "high") return 1;

  if (priority === "medium") return 2;

  return 3;

}


/* =========================
   RENDER AUTO PLAN
========================= */

function renderPlan() {

  const container =
    document.getElementById("mindflow-plan");

  container.innerHTML = "";


  const startMinutes =
    timeToMinutes(startTime);

  let currentMinutes =
    startMinutes;


  flowItems.forEach(item => {

    const row =
      document.createElement("div");


    row.className =
      `plan-item ${
        item.type === "break"
          ? "break-item"
          : ""
      }`;


    const timeLabel =
      formatTime(currentMinutes);


    row.innerHTML = `

      <div class="plan-time">
        ${timeLabel}
      </div>

      <div>

        <strong>

          ${
            item.type === "break"
              ? "☕ "
              : ""
          }

          ${escapeHTML(item.title)}

        </strong>

        <small>

          ${
            item.type === "break"
              ? "Rest and recharge"
              : escapeHTML(item.category)
          }

        </small>

      </div>

      <div class="plan-duration">
        ${item.duration} min
      </div>

    `;


    container.appendChild(row);


    currentMinutes +=
      item.duration;

  });


  document.getElementById("plan-start-label").textContent =
    `Starting at ${formatTime(startMinutes)}`;


  document.getElementById("break-label").textContent =
    breakDuration === 0
      ? "No breaks"
      : `${breakDuration} min breaks`;

}


/* =========================
   TIME HELPERS
========================= */

function timeToMinutes(time) {

  const [hours, minutes] =
    time.split(":").map(Number);

  return (
    hours * 60 +
    minutes
  );

}


function formatTime(totalMinutes) {

  totalMinutes =
    totalMinutes % (24 * 60);


  let hours =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;


  const period =
    hours >= 12 ? "PM" : "AM";


  hours =
    hours % 12;


  if (hours === 0) {
    hours = 12;
  }


  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;

}


/* =========================
   START MINDFLOW
========================= */

document
  .getElementById("start-flow-btn")
  .addEventListener("click", startFlow);


function startFlow() {

  if (!flowItems.length) {
    buildFlowItems();
  }


  initializeAudio();


  currentFlowIndex = 0;

  currentTaskIndex = 0;


  showScreen("flow-screen");

  startCurrentFlowItem();

}


/* =========================
   START CURRENT ITEM
========================= */

function startCurrentFlowItem() {

  clearInterval(timerInterval);

  isPaused = false;


  const item =
    flowItems[currentFlowIndex];


  if (!item) {

    finishFlow();

    return;

  }


  isBreak =
    item.type === "break";


  totalSeconds =
    item.duration * 60;


  remainingSeconds =
    totalSeconds;


  /*
    IMPORTANT:
    The timer only displays the CURRENT
    task or break. It never displays the
    original brain dump.
  */

  document.getElementById("flow-task").textContent =
    item.title;


  document.getElementById("flow-category").textContent =
    isBreak
      ? "☕ BREAK"
      : item.category.toUpperCase();


  document.getElementById("flow-description").textContent =
    isBreak

      ? "Step away, breathe, and recharge. Your next task is waiting."

      : "Focus on this one thing. Nothing else.";


  document.getElementById("flow-mode-label").textContent =
    isBreak
      ? "MINDFLOW • BREAK"
      : "MINDFLOW • FOCUS";


  const timer =
    document.getElementById("timer");


  timer.classList.toggle(
    "break-mode",
    isBreak
  );


  document.getElementById("timer-message").textContent =
    isBreak
      ? "Take a moment. You've earned it."
      : "Stay focused.";


  document.getElementById("pause-btn").textContent =
    "Pause";


  updateTimerDisplay();

  updateFlowProgress();

  updateNextFlowItem();


  timerInterval =
    setInterval(() => {

      if (isPaused) return;


      remainingSeconds--;

      updateTimerDisplay();


      if (remainingSeconds <= 0) {

        clearInterval(timerInterval);

        completeCurrentFlowItem();

      }

    }, 1000);

}


/* =========================
   TIMER DISPLAY
========================= */

function updateTimerDisplay() {

  const minutes =
    Math.floor(
      remainingSeconds / 60
    );


  const seconds =
    remainingSeconds % 60;


  document.getElementById("timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =========================
   FLOW PROGRESS
========================= */

function updateFlowProgress() {

  const taskCount =
    flowItems.filter(
      item => item.type === "task"
    ).length;


  const completedTasks =
    flowItems
      .slice(0, currentFlowIndex)
      .filter(
        item => item.type === "task"
      )
      .length;


  let currentTaskNumber =
    completedTasks + 1;


  if (currentTaskNumber > taskCount) {
    currentTaskNumber = taskCount;
  }


  /*
    During a break, show the task that
    has just been completed rather than
    pretending the break is another task.
  */

  const displayTaskNumber =
    isBreak
      ? Math.max(1, completedTasks)
      : currentTaskNumber;


  document.getElementById("flow-progress-text").textContent =
    `Task ${displayTaskNumber} of ${taskCount}`;


  let percent =
    taskCount
      ? (completedTasks / taskCount) * 100
      : 0;


  document.getElementById("progress-fill").style.width =
    `${percent}%`;

}


/* =========================
   NEXT ITEM
========================= */

function updateNextFlowItem() {

  let next =
    flowItems[currentFlowIndex + 1];


  if (!next) {

    document.getElementById("next-task-title").textContent =
      "You're almost done.";

    return;

  }


  /*
    If the current item is a task and the
    next item is a break, show the break.
  */

  if (next.type === "break") {

    document.getElementById("next-task-title").textContent =
      `☕ Break • ${next.duration} min`;

    return;

  }


  document.getElementById("next-task-title").textContent =
    next.title;

}


/* =========================
   PAUSE / RESUME
========================= */

document
  .getElementById("pause-btn")
  .addEventListener(
    "click",
    toggleTimer
  );


function toggleTimer() {

  isPaused =
    !isPaused;


  document.getElementById("pause-btn").textContent =
    isPaused
      ? "Resume"
      : "Pause";


  document.getElementById("timer-message").textContent =
    isPaused

      ? "Timer paused."

      : isBreak
        ? "Take a moment. You've earned it."

        : "Stay focused.";

}


/* =========================
   SKIP
========================= */

document
  .getElementById("skip-btn")
  .addEventListener(
    "click",
    skipCurrentItem
  );


function skipCurrentItem() {

  clearInterval(timerInterval);

  currentFlowIndex++;

  startCurrentFlowItem();

}


/* =========================
   END TASK
========================= */

document
  .getElementById("end-task-btn")
  .addEventListener(
    "click",
    endCurrentItem
  );


function endCurrentItem() {

  clearInterval(timerInterval);


  document.getElementById("timer-message").textContent =
    isBreak
      ? "Break ended."
      : "Task ended. Moving on...";


  setTimeout(() => {

    currentFlowIndex++;

    startCurrentFlowItem();

  }, 1000);

}


/* =========================
   TIMER FINISHED
========================= */

function completeCurrentFlowItem() {

  playBeep();


  document.getElementById("timer-message").textContent =
    isBreak

      ? "Break over. Let's get back to it!"

      : "Task complete!";


  /*
    Automatically move to the next item.
    This means:

    TASK → BREAK → TASK → BREAK → TASK

    until the final task is complete.
  */

  setTimeout(() => {

    currentFlowIndex++;

    startCurrentFlowItem();

  }, 1800);

}


/* =========================
   AUDIO / BEEP
========================= */

function initializeAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();

  }

}


function playBeep() {

  if (!audioContext) return;


  const frequencies = [
    880,
    880,
    1046
  ];


  frequencies.forEach(
    (frequency, index) => {

      const oscillator =
        audioContext.createOscillator();


      const gain =
        audioContext.createGain();


      oscillator.frequency.value =
        frequency;


      oscillator.type =
        "sine";


      oscillator.connect(gain);

      gain.connect(
        audioContext.destination
      );


      const start =
        audioContext.currentTime +
        index * 0.18;


      gain.gain.setValueAtTime(
        0.001,
        start
      );


      gain.gain.exponentialRampToValueAtTime(
        0.3,
        start + 0.02
      );


      gain.gain.exponentialRampToValueAtTime(
        0.001,
        start + 0.14
      );


      oscillator.start(start);

      oscillator.stop(
        start + 0.15
      );

    }
  );

}


/* =========================
   COMPLETE FLOW
========================= */

function finishFlow() {

  clearInterval(timerInterval);


  document.getElementById("progress-fill").style.width =
    "100%";


  document.getElementById("flow-progress-text").textContent =
    `Task ${tasks.length} of ${tasks.length}`;


  document.getElementById("completion-message").textContent =
    "You turned mental clutter into progress. Take a breath — you've earned it.";


  showScreen("complete-screen");

}


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================
   RESET PROCESSING STATE
========================= */

function resetProcessingSteps() {

  [
    "step-1",
    "step-2",
    "step-3",
    "step-4"
  ].forEach(id => {

    document
      .getElementById(id)
      .classList.remove("done");

  });

}


/* =========================
   RESTART
========================= */

document
  .getElementById("restart-btn")
  .addEventListener(
    "click",
    restartMindDump
  );


function restartMindDump() {

  clearInterval(timerInterval);


  tasks = [];

  flowItems = [];

  currentFlowIndex = 0;

  currentTaskIndex = 0;

  remainingSeconds = 0;

  totalSeconds = 0;

  isPaused = false;

  isBreak = false;


  document.getElementById("brain-dump").value = "";


  document.getElementById("timer").textContent =
    "00:00";


  document.getElementById("progress-fill").style.width =
    "0%";


  resetProcessingSteps();


  showScreen("home-screen");

}
```
