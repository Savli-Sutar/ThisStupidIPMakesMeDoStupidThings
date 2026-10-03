const state = {
  tracks: [],
  view: "listen",
  genre: "All cuts",
  query: "",
  currentTrackId: 1,
  isPlaying: false,
  progress: 0,
  volume: 68,
  favorites: new Set([2, 6]),
  queue: [3, 4, 7],
  feedback: "Welcome to the greenroom"
};

const genres = ["All cuts", "Ambient", "Soul", "Jazz", "Electronic"];

let progressTimer;
let feedbackTimer;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = String(Math.floor(seconds % 60)).padStart(2, "0");

  return `${mins}:${secs}`;
};

const currentTrack = () =>
  state.tracks.find((track) => track.id === state.currentTrackId) ||
  state.tracks[0];

function notify(message) {
  state.feedback = message;

  window.clearTimeout(feedbackTimer);

  feedbackTimer = window.setTimeout(() => {
    state.feedback = "";
    render();
  }, 2300);

  render();
}

function filteredTracks() {
  const query = state.query.trim().toLowerCase();

  return state.tracks.filter((track) => {
    const matchesGenre =
      state.genre === "All cuts" || track.genre === state.genre;

    const matchesQuery =
      !query ||
      `${track.title} ${track.artist} ${track.album}`
        .toLowerCase()
        .includes(query);

    const matchesView =
      state.view === "listen" || state.favorites.has(track.id);

    return matchesGenre && matchesQuery && matchesView;
  });
}

function selectTrack(id) {
  state.currentTrackId = id;
  state.progress = 0;
  state.isPlaying = true;

  const track = state.tracks.find((item) => item.id === id);

  notify(`Now playing ${track ? track.title : "your selection"}`);
}

function togglePlayback() {
  const track = currentTrack();

  if (!track) return;

  if (!state.isPlaying && state.progress >= track.duration) {
    state.progress = 0;
  }

  state.isPlaying = !state.isPlaying;

  notify(
    state.isPlaying
      ? `Playing ${track.title}`
      : "Playback paused"
  );

  startProgressTimer();
}

function startProgressTimer() {
  window.clearInterval(progressTimer);

  if (!state.isPlaying) return;

  progressTimer = window.setInterval(() => {
    const track = currentTrack();

    if (!track) return;

    if (state.progress >= track.duration) {
      state.isPlaying = false;
      notify("That cut has come to a close");
      return;
    }

    state.progress += 1;
    render();
  }, 1000);
}

function stepTrack(direction) {
  const index = state.tracks.findIndex(
    (track) => track.id === state.currentTrackId
  );

  const next =
    state.tracks[
      (index + direction + state.tracks.length) %
        state.tracks.length
    ];

  if (next) {
    selectTrack(next.id);
  }
}

function toggleFavorite(id) {
  const track = state.tracks.find((item) => item.id === id);

  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    notify("Removed from your library");
  } else {
    state.favorites.add(id);
    notify("Saved to your library");
  }

  if (state.view === "library" && track) {
    render();
  }
}

function toggleQueue(id) {
  const index = state.queue.indexOf(id);

  if (index >= 0) {
    state.queue.splice(index, 1);
    notify("Removed from queue");
  } else {
    state.queue.push(id);
    notify("Added to queue");
  }
}

function trackArt(track, extra = "") {
  return `
    <div
      class="album-art ${extra}"
      style="background:${track.color}"
      aria-hidden="true"
    >
      <span>✦</span>
    </div>
  `;
}

function trackRow(track, index) {
  const isCurrent = track.id === state.currentTrackId;
  const playing = isCurrent && state.isPlaying;
  const liked = state.favorites.has(track.id);
  const queued = state.queue.includes(track.id);

  return `
    <div
      class="track-row ${isCurrent ? "current" : ""}"
      data-testid="row-track-${track.id}"
    >
      ${
        playing
          ? `
            <span
              class="playing-bars"
              data-testid="status-playing"
            >
              <i></i><i></i><i></i>
            </span>
          `
          : `
            <span class="track-number">
              ${String(index + 1).padStart(2, "0")}
            </span>
          `
      }

      <button
        class="track-main"
        data-action="select"
        data-id="${track.id}"
      >
        ${trackArt(track)}

        <span class="track-copy">
          <span class="track-title">${track.title}</span>
          <span class="track-artist">${track.artist}</span>
        </span>
      </button>

      <span class="track-tag">${track.genre}</span>
      <span class="track-time">${formatTime(track.duration)}</span>

      <button
        class="icon-button ${liked ? "liked" : ""}"
        aria-label="${
          liked ? "Remove" : "Save"
        } ${track.title} ${
          liked ? "from library" : "to library"
        }"
        data-action="favorite"
        data-id="${track.id}"
      >
        ${liked ? "♥" : "♡"}
      </button>

      <button
        class="icon-button ${queued ? "queued" : ""}"
        aria-label="${
          queued ? "Remove" : "Add"
        } ${track.title} ${
          queued ? "from" : "to"
        } queue"
        data-action="queue"
        data-id="${track.id}"
      >
        ${queued ? "−" : "+"}
      </button>
    </div>
  `;
}

function queueItem(track) {
  return `
    <div class="queue-item">
      <div
        class="queue-item-art"
        style="background:${track.color}"
      ></div>

      <button
        class="queue-item-copy"
        data-action="select"
        data-id="${track.id}"
      >
        <span class="queue-item-title">${track.title}</span>
        <span class="queue-item-artist">${track.artist}</span>
      </button>

      <button
        class="queue-remove"
        aria-label="Remove ${track.title} from queue"
        data-action="queue"
        data-id="${track.id}"
      >
        ×
      </button>
    </div>
  `;
}

function render() {
  const track = currentTrack();
  const visible = filteredTracks();

  const queued = state.queue
    .map((id) => state.tracks.find((item) => item.id === id))
    .filter(Boolean);

  if (!track) return;

  document.querySelector("#app").innerHTML = `
    <div class="app-grid">
      <aside class="sidebar">
        <div class="brand-mark">
          <span class="brand-symbol">−</span>

          <span>
            <span class="brand-name">greenroom</span>
            <span class="brand-kicker">playlist no. 04</span>
          </span>
        </div>

        <div class="nav-label">Your room</div>

        <nav aria-label="Playlist views">
          <button
            class="nav-button ${
              state.view === "listen" ? "active" : ""
            }"
            data-action="view"
            data-view="listen"
          >
            ◉ <span>Listen</span>
          </button>

          <button
            class="nav-button ${
              state.view === "library" ? "active" : ""
            }"
            data-action="view"
            data-view="library"
          >
            ▣ <span>Library</span>
            <span class="nav-count">${state.favorites.size}</span>
          </button>
        </nav>

        <div class="nav-label">Tonight's note</div>

        <div class="sidebar-note">
          <div class="eyebrow">Room 04 / 00:47</div>
          <p>
            Leave a little space between songs.
            The good ones know what to do with it.
          </p>
        </div>
      </aside>

      <main class="main-column">
        <header class="topbar">
          <div class="search-wrap">
            <span class="search-icon">⌕</span>

            <input
              id="search"
              class="search-input"
              type="search"
              placeholder="Search the room..."
              value="${state.query}"
              aria-label="Search tracks"
            />
          </div>

          <div class="profile-chip">
            <span>Listening as</span>
            <span class="profile-avatar">GR</span>
          </div>
        </header>

        ${
          state.view === "listen"
            ? `
              <section class="hero">
                <div class="hero-content">
                  <div class="eyebrow">
                    Greenroom playlist / 01
                  </div>

                  <h1>
                    After hours,<br />
                    <em>in good company.</em>
                  </h1>

                  <p class="hero-copy">
                    A hand-picked sequence for the part of the night
                    where conversation softens and the city turns its
                    volume down.
                  </p>

                  <div class="hero-meta">
                    <span>8 cuts</span>
                    <span>38 min</span>
                    <span>Late night</span>
                  </div>
                </div>

                <button
                  class="hero-play"
                  aria-label="Play playlist"
                  data-action="play"
                >
                  ${state.isPlaying ? "Ⅱ" : "▶"}
                </button>
              </section>
            `
            : `
              <section class="library-intro">
                <div class="eyebrow">Your saved room</div>

                <h1>
                  The ones you<br />
                  <em>kept close.</em>
                </h1>

                <p>
                  Tracks you circled back to. Keep them here
                  for the nights that need a familiar hand.
                </p>
              </section>
            `
        }

        <section class="sequence">
          <div class="section-head">
            <div>
              <div class="eyebrow">The sequence</div>
              <h2>Tonight's cuts</h2>
            </div>

            <div class="section-caption">
              ${
                state.view === "listen"
                  ? "A soft landing for a long night"
                  : `${state.favorites.size} saved cuts`
              }
              <br />
              selected by hand
            </div>
          </div>

          <div class="filter-row">
            ${genres
              .map(
                (item) => `
                  <button
                    class="filter-button ${
                      state.genre === item ? "active" : ""
                    }"
                    data-action="genre"
                    data-genre="${item}"
                  >
                    ${item}
                  </button>
                `
              )
              .join("")}
          </div>

          ${
            visible.length
              ? `
                <div class="track-list">
                  ${visible.map(trackRow).join("")}
                </div>
              `
              : `
                <div class="empty-state">
                  <strong>No cuts in this corner.</strong>
                  <p>
                    Try another search or let the room surprise you.
                  </p>
                </div>
              `
          }
        </section>
      </main>

      <aside class="aside-column">
        <div class="now-playing-card">
          <div class="aside-heading">
            <div>
              <div class="eyebrow">On the turntable</div>
              <h2>Now playing</h2>
            </div>

            <span class="mini-label">Live / local</span>
          </div>

          <div
            class="feature-art ${
              state.isPlaying ? "playing" : ""
            }"
            style="background:${track.color}"
          >
            ◌
          </div>

          <h3 class="now-title">${track.title}</h3>

          <p class="now-artist">
            ${track.artist}
            <span>·</span>
            ${track.album}
          </p>

          <input
            id="progress"
            class="range"
            type="range"
            min="0"
            max="${track.duration}"
            value="${Math.min(state.progress, track.duration)}"
            aria-label="Track progress"
          />

          <div class="time-line">
            <span>${formatTime(state.progress)}</span>
            <span>${formatTime(track.duration)}</span>
          </div>

          <div class="transport">
            <button
              aria-label="Previous track"
              data-action="previous"
            >
              |◀
            </button>

            <button
              class="play-button"
              aria-label="Play track"
              data-action="play"
            >
              ${state.isPlaying ? "Ⅱ" : "▶"}
            </button>

            <button
              aria-label="Next track"
              data-action="next"
            >
              ▶|
            </button>
          </div>

          <div class="volume-line">
            <button
              class="icon-button"
              aria-label="Toggle volume"
              data-action="mute"
            >
              ${state.volume > 0 ? "◖" : "◗"}
            </button>

            <input
              id="volume"
              class="range"
              type="range"
              min="0"
              max="100"
              value="${state.volume}"
              aria-label="Volume"
            />

            <span>${state.volume}</span>
          </div>

          <div class="queue-head">
            <h3>
              Up next
              <span class="mini-label">(${queued.length})</span>
            </h3>

            <button
              class="queue-clear"
              data-action="clear-queue"
            >
              Clear all
            </button>
          </div>

          ${
            queued.length
              ? queued.map(queueItem).join("")
              : `
                <div class="empty-state compact">
                  <strong>A quiet queue.</strong>
                  <p>Add a few cuts from the room.</p>
                </div>
              `
          }
        </div>
      </aside>
    </div>

    ${
      state.feedback
        ? `<div class="feedback" role="status">${state.feedback}</div>`
        : ""
    }
  `;

  bindEvents();
  startProgressTimer();
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.action;
      const id = Number(element.dataset.id);

      if (action === "select") selectTrack(id);
      if (action === "play") togglePlayback();
      if (action === "previous") stepTrack(-1);
      if (action === "next") stepTrack(1);
      if (action === "favorite") toggleFavorite(id);
      if (action === "queue") toggleQueue(id);

      if (action === "mute") {
        state.volume = state.volume > 0 ? 0 : 68;
        render();
      }

      if (action === "clear-queue") {
        state.queue = [];
        notify("Queue cleared");
      }

      if (action === "view") {
        state.view = element.dataset.view;
        render();
      }

      if (action === "genre") {
        state.genre = element.dataset.genre;
        render();
      }
    });
  });

  document.querySelector("#search")?.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();

    const input = document.querySelector("#search");

    input.focus();
    input.setSelectionRange(
      state.query.length,
      state.query.length
    );
  });

  document
    .querySelector("#progress")
    ?.addEventListener("input", (event) => {
      state.progress = Number(event.target.value);
      render();
    });

  document
    .querySelector("#volume")
    ?.addEventListener("input", (event) => {
      state.volume = Number(event.target.value);
      render();
    });
}

fetch("/greenroom-api/playlist")
  .then((response) => response.json())
  .then((playlist) => {
    state.tracks = playlist.tracks;
    render();
  })
  .catch(() => {
    document.querySelector("#app").innerHTML = `
      <div class="loading">
        The greenroom is taking a quiet moment.
        Refresh to try again.
      </div>
    `;
  });