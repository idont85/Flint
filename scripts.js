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


    shuffleAllBtn.addEventListener('click', shuffleAll);
    let songsData = [];
    let currentIndex = 0;
    let isPlaying = false;

    fetchPlaylist();

    function shuffleAll() {
        // Implement your logic to shuffle all songs
        // For example, you can shuffle the 'songsData' array and then update the playlist
        songsData = shuffleArray(songsData);
        displayPlaylist(songsData);
        playSong(0); // Start playing the first shuffled song
        hideShuffleOverlay();
    }

    function shuffleArray(array) {
        // Function to shuffle an array (Fisher-Yates algorithm)
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
        shuffleAllOverlay.style.display = 'block';
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
            li.setAttribute('data-album-art', song.albumArt); // Added album art data attribute
            li.addEventListener('click', playSong.bind(null, index));
            playlist.appendChild(li);
        });
    }

    function playSong(index) {
        currentIndex = index;
        const selectedSong = playlist.children[index];
        const source = selectedSong.getAttribute('data-src');
        const albumArtPath = selectedSong.getAttribute('data-album-art'); // Get album art path
    
        audioPlayer.src = source;
        albumArt.src = albumArtPath; // Set album art source
        setAlbumArtSize(); // Set initial size
    
        const songTitle = document.getElementById('songTitle');
        songTitle.textContent = songsData[index].title;
    
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
    }
    

    function togglePlayPause() {
        // Apply fade-out effect
        playPauseBtn.style.opacity = 0;

        setTimeout(() => {
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayPauseButton();

            // Apply fade-in effect
            playPauseBtn.style.opacity = 1;
        }, 200); // Adjust the timing to match the CSS transition duration
    }

    function updatePlayPauseButton() {
        playPauseBtn.innerHTML = isPlaying ? '<span class="material-symbols-outlined">pause</span>' : '<span class="material-symbols-outlined">play_arrow</span>';
    }

    function playPrevious() {
        currentIndex = (currentIndex - 1 + songsData.length) % songsData.length;
        playSong(currentIndex);
    }

    function playNext() {
        currentIndex = (currentIndex + 1) % songsData.length;
        playSong(currentIndex);
    }

    function updateProgressBar() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressIndicator.style.width = `${progress}%`;
    }

    function updateSongTitle(title) {
        songTitleElement.textContent = title;
    }

    function setProgressBar(event) {
        const progressBarRect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - progressBarRect.left;
        const progress = (clickX / progressBarRect.width) * 100;
        audioPlayer.currentTime = (progress / 100) * audioPlayer.duration;
    }

    // Event listeners for player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);

    // Event listener for updating progress bar
    audioPlayer.addEventListener('timeupdate', updateProgressBar);

    // Event listener for clicking on progress bar
    progressBar.addEventListener('click', setProgressBar);

    // Event listener for search input
    searchInput.addEventListener('input', handleSearch);

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
        const albumArtContainer = document.getElementById('albumArtContainer');
        const albumArt = document.getElementById('albumArt');
        const maxWidth = albumArtContainer.clientWidth; // Maximum width of the container
    
        const img = new Image();
        img.src = albumArt.src;
    
        img.onload = function () {
            const aspectRatio = img.width / img.height;
    
            let width = Math.min(img.width, maxWidth);
            let height = width / aspectRatio;
    
            albumArt.style.width = width + 'px';
            albumArt.style.height = height + 'px';
        };
    }

    // Call setAlbumArtSize on window resize to handle responsive sizing
    window.addEventListener('resize', setAlbumArtSize);
});