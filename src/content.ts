const BUTTON_CLASS = 'ytp-pip-button';
const CONTROL_SELECTOR = '.ytp-right-controls';
const LEFT_CONTROL_SELECTOR = '.ytp-right-controls-left';
const VIDEO_SELECTOR = 'video.html5-main-video, video';

const buttonVideos = new WeakMap<HTMLButtonElement, HTMLVideoElement>();

const PIP_ICON = `
  <svg
    class="ytp-pip-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 5.5h16v13H4z" fill="none" stroke="currentColor" stroke-width="1.7" rx="1.2"/>
    <path d="M13.2 13h5v3.5h-5z" fill="currentColor"/>
  </svg>
`;

const PIP_STYLE = `
  .${BUTTON_CLASS} {
    position: relative;
  }

  .${BUTTON_CLASS} .ytp-pip-icon {
    width: 24px;
    height: 24px;
    display: block;
  }

  .${BUTTON_CLASS}[aria-pressed="true"] {
    color: #fff;
  }

  .${BUTTON_CLASS}[aria-pressed="true"] .ytp-pip-icon {
    filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.35));
  }
`;

function injectStyle(): void {
  if (document.getElementById(`${BUTTON_CLASS}-style`)) {
    return;
  }

  const style = document.createElement('style');
  style.id = `${BUTTON_CLASS}-style`;
  style.textContent = PIP_STYLE;
  document.head.appendChild(style);
}

function getVideo(): HTMLVideoElement | null {
  const video = document.querySelector<HTMLVideoElement>(VIDEO_SELECTOR);
  return video;
}

function setPressed(button: HTMLButtonElement, pressed: boolean): void {
  button.setAttribute('aria-pressed', String(pressed));
  button.title = pressed ? 'Exit Picture-in-Picture' : 'Picture-in-Picture';
}

async function togglePictureInPicture(button: HTMLButtonElement): Promise<void> {
  const video = getVideo();
  if (!video) {
    return;
  }

  try {
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture();
      return;
    }

    if (!document.pictureInPictureEnabled || typeof video.requestPictureInPicture !== 'function') {
      button.title = 'Picture-in-Picture is not supported in this browser';
      return;
    }

    await video.requestPictureInPicture();
  } catch (error) {
    console.debug('[YouTube PiP] Unable to toggle Picture-in-Picture.', error);
  }
}

function createButton(video: HTMLVideoElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `ytp-button ${BUTTON_CLASS}`;
  button.setAttribute('aria-label', 'Picture-in-Picture');
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Picture-in-Picture';
  button.innerHTML = PIP_ICON;

  buttonVideos.set(button, video);
  button.addEventListener('click', () => {
    void togglePictureInPicture(button);
  });

  setPressed(button, document.pictureInPictureElement === video);
  return button;
}

function syncButtonStates(): void {
  document.querySelectorAll<HTMLButtonElement>(`.${BUTTON_CLASS}`).forEach((button) => {
    const video = buttonVideos.get(button);
    setPressed(button, document.pictureInPictureElement === video);
  });
}

function findInsertionTarget(container: HTMLElement): {
  parent: HTMLElement;
  before: Element | null;
} {
  const leftControls = container.querySelector<HTMLElement>(LEFT_CONTROL_SELECTOR);
  if (leftControls) {
    const settingsButton = leftControls.querySelector('.ytp-settings-button');
    if (settingsButton) {
      return { parent: leftControls, before: settingsButton.nextElementSibling };
    }

    return { parent: leftControls, before: null };
  }

  const sizeButton = container.querySelector('.ytp-size-button');
  return { parent: container, before: sizeButton };
}

function ensureButton(): void {
  if (!location.pathname.startsWith('/watch')) {
    return;
  }

  const container = document.querySelector<HTMLElement>(CONTROL_SELECTOR);
  if (!container) {
    return;
  }

  const video = getVideo();
  if (!video) {
    return;
  }

  const existingButton = container.querySelector<HTMLButtonElement>(`.${BUTTON_CLASS}`);
  if (existingButton) {
    const boundVideo = buttonVideos.get(existingButton);
    if (boundVideo === video) {
      syncButtonStates();
      return;
    }

    existingButton.remove();
  }

  const button = createButton(video);
  const insertionTarget = findInsertionTarget(container);

  if (insertionTarget.before) {
    insertionTarget.parent.insertBefore(button, insertionTarget.before);
  } else {
    insertionTarget.parent.appendChild(button);
  }
}

function observeYouTubePlayer(): void {
  injectStyle();
  ensureButton();

  const observer = new MutationObserver(() => {
    ensureButton();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });

  document.addEventListener('enterpictureinpicture', syncButtonStates);
  document.addEventListener('leavepictureinpicture', syncButtonStates);
  document.addEventListener('yt-navigate-finish', ensureButton);
  document.addEventListener('yt-page-data-updated', ensureButton);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeYouTubePlayer, { once: true });
} else {
  observeYouTubePlayer();
}
