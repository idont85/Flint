document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('searchInput');
    const playlist = document.getElementById('playlist');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.querySelector('.progressBar');
    const progressIndicator = document.querySelector('.progressIndicator');
    const songTitleElement = document.getElementById('songTitle');
    const shuffleAllOverlay = document.getElementById('shuffleAllOverlay');
    const shuffleAllBtn = document.getElementById('shuffleAllBtn');
    const albumArtContainer = document.getElementById('albumArtContainer');
    const albumArt = document.getElementById('albumArt');
    const currentTimeElement = document.getElementById('currentTime');
    const totalDurationElement = document.getElementById('totalDuration');

    let updateTimeInteval;
    let songsData = [];
    let currentIndex = 0;
    let isPlaying = false;
    let fadeInInterval;
    let fadeOutInterval;

    shuffleAllBtn.addEventListener('click', shuffleAll);

    function shuffleAll() {
        songsData = shuffleArray(songsData);
        displayPlaylist(songsData);
        playSong(0);
        hideShuffleOverlay();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showShuffleOverlay() {
        shuffleAllOverlay.style.display = 'flex';
    }

    function hideShuffleOverlay() {
        shuffleAllOverlay.style.display = 'none';
    }

    function fetchPlaylist() {
        fetch('songs.json')
            .then(response => response.json())
            .then(data => {
                songsData = data;
                displayPlaylist(data);
            });
    }

    function displayPlaylist(songs) {
        playlist.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song.title;
            li.setAttribute('data-src', song.src);
            li.setAttribute('data-album-art', song.albumArt);
            li.addEventListener('click', playSong.bind(null, index));
            playlist.appendChild(li);
        });
    }

    function playSong(index) {
        currentIndex = index;
        const selectedSong = playlist.children[index];
        const source = selectedSong.getAttribute('data-src');
        const albumArtPath = selectedSong.getAttribute('data-album-art');
    
        // Set volume to a low value initially
        audioPlayer.volume = 0.1;
    
        audioPlayer.src = source;
        albumArt.src = albumArtPath;
        setAlbumArtSize();
    
        const songTitle = document.getElementById('songTitle');
        songTitle.textContent = songsData[index].title;
    
        audioPlayer.play();
    
        fadeInInterval = setInterval(() => {
            if (audioPlayer.volume < 1.0) {
                audioPlayer.volume += 0.1;
            } else {
                clearInterval(fadeInInterval);
            }
        }, 300);
    
        isPlaying = true;
        updatePlayPauseButton();
        clearInterval(updateTimeInteval);
        updateTimeInteval = setInterval(updateTimestamps, 1000);

        // Set Media Session metadata for the current song
        setMediaSessionMetadata(songsData[index]);
        
        // Set Media Session action handlers
        setMediaSessionActions();
    }

    function togglePlayPause() {
        playPauseBtn.style.opacity = 0;

        setTimeout(() => {
            if (isPlaying) {
                audioPlayer.pause();
                // Gradually decrease the volume using a fade-out effect
                fadeOutInterval = setInterval(() => {
                    if (audioPlayer.volume > 0) {
                        audioPlayer.volume -= 0.1;
                    } else {
                        clearInterval(fadeOutInterval);
                    }
                }, 300);
            } else {
                audioPlayer.play();
                // Gradually increase the volume using a fade-in effect
                fadeInInterval = setInterval(() => {
                    if (audioPlayer.volume < 1.0) {
                        audioPlayer.volume += 0.1;
                    } else {
                        clearInterval(fadeInInterval);
                    }
                }, 300);
            }
            isPlaying = !isPlaying;
            updatePlayPauseButton();
            playPauseBtn.style.opacity = 1;
        }, 200);
    }

    function updatePlayPauseButton() {
        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayPauseButton();
        });

        audioPlayer.addEventListener('play', () => {
            isPlaying = true;
            updatePlayPauseButton();
        });
        playPauseBtn.innerHTML = isPlaying ? '<span class="material-symbols-outlined">pause</span>' : '<span class="material-symbols-outlined">play_arrow</span>';
    }

    function playPrevious() {
        currentIndex = (currentIndex - 1 + songsData.length) % songsData.length;
        playSong(currentIndex);
    }

    function playNext() {
        currentIndex = (currentIndex + 1) % songsData.length;
        setTimeout(() => {
            playSong(currentIndex);
        }, 1500);
    }

    function updateTimestamps() {
        if (!isNaN(audioPlayer.duration)) {
            currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
            totalDurationElement.textContent = formatTime(audioPlayer.duration);
        } else {
            currentTimeElement.textContent = '--:--';
            totalDurationElement.textContent = '--:--';
        }
    }

    function formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds)) {
            return '--:--';
        }

        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${padNumber(minutes)}:${padNumber(seconds)}`;
    }

    function padNumber(number) {
        return number.toString().padStart(2, '0');
    }

    function updateProgressBar() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressIndicator.style.width = `${progress}%`;
    }

    function setProgressBar(event) {
        const progressBarRect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - progressBarRect.left;
        const progress = (clickX / progressBarRect.width) * 100;
        audioPlayer.currentTime = (progress / 100) * audioPlayer.duration;
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const items = playlist.getElementsByTagName('li');

        for (let i = 0; i < items.length; i++) {
            const title = items[i].textContent.toLowerCase();
            const match = title.includes(searchTerm);
            items[i].style.display = match ? 'block' : 'none';
        }
    }

    function setAlbumArtSize() {
        const maxWidth = albumArtContainer.clientWidth;

        const img = new Image();
        img.src = albumArt.src;

        img.onload = function () {
            const aspectRatio = img.width / img.height;

            let width = Math.min(img.width, maxWidth);
            let height = width / aspectRatio

;

            albumArt.style.width = width + 'px';
            albumArt.style.height = height + 'px';
        };
    }

    function setMediaSessionMetadata(song) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album,
            artwork: [
                { src: song.albumArt, sizes: '96x96', type: 'image/jpeg' },
            ],
        });
    }

    function setMediaSessionActions() {
        navigator.mediaSession.setActionHandler('play', function() {
            togglePlayPause();
        });

        navigator.mediaSession.setActionHandler('pause', function() {
            togglePlayPause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', function() {
            playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', function() {
            playNext();
        });
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    progressBar.addEventListener('click', setProgressBar);
    searchInput.addEventListener('input', handleSearch);

    window.addEventListener('resize', setAlbumArtSize);
    audioPlayer.addEventListener('ended', playNext);
    audioPlayer.addEventListener('timeupdate', updateProgressBar);

    fetchPlaylist();
});
