
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

var count = 0;
var playedList = []

const app = {
    currentIndex: 2,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/nevada.mp3',
            image: './assets/img/nevada.jpg'
        },
        {
            name: 'Animals',
            singer: 'Maroon 5',
            path: './assets/music/animals.mp3',
            image: './assets/img/animals.jpg'
        },
        {
            name: 'At My Worst',
            singer: 'TIN, Pink Sweet',
            path: './assets/music/at_my_worst.mp3',
            image: './assets/img/at_my_worst.jpg'
        },
        {
            name: 'Attention',
            singer: 'Charlie Puth',
            path: './assets/music/attention.mp3',
            image: './assets/img/attention.jpg'
        },
        {
            name: 'Butter',
            singer: 'TIN',
            path: './assets/music/butter.mp3',
            image: './assets/img/butter.jpg'
        },
        {
            name: 'Dance Monkey',
            singer: 'TONES AND I',
            path: './assets/music/dance_monkey.mp3',
            image: './assets/img/dance_monkey.jpg'
        },
        {
            name: 'Memories',
            singer: 'Maroon 5',
            path: './assets/music/memories.mp3',
            image: './assets/img/memories.jpg'
        },
        {
            name: 'Monody',
            singer: 'Laura Brehm',
            path: './assets/music/monody.mp3',
            image: './assets/img/monody.jpg'
        },
        {
            name: 'Reality',
            singer: ' Lost Frequencies',
            path: './assets/music/reality.mp3',
            image: './assets/img/reality.jpg'
        },
        {
            name: 'Senorita',
            singer: 'Shawn Mendes, Camila Cabello',
            path: './assets/music/senorita.mp3',
            image: './assets/img/senorita.jpg'
        },
        {
            name: 'Sugar',
            singer: 'Maroon 5',
            path: './assets/music/sugar.mp3',
            image: './assets/img/sugar.jpg'
        },
        {
            name: 'Way Back Home',
            singer: 'Conor Maynard',
            path: './assets/music/way_back_home.mp3',
            image: './assets/img/way_back_home.jpg'
        }],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth

        // Handle rotate CD 
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Handle Scroll Screen
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth>0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Handle click button play
        playBtn.onclick = function() {
            if(app.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }

        // When the song is played
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // When the song is paused
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // When the time of song changed
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Handle seek audio
        progress.oninput = function(e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime
        }

        // When click next song 
        nextBtn.onclick = function() {
            if(app.isRandom){
                app.randomSong()
            }else{
                app.nextSong()
            }
            audio.play()
            app.scrollToActiveSong()
        }

        // When click prev song 
        prevBtn.onclick = function() {
            if(app.isRandom){
                app.randomSong()
            }else{
                app.prevSong()
            }
            audio.play()
            app.scrollToActiveSong()
        }

        // Handle click button random
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }
        
        // Handle repeat the song 
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Handle next song when ended
        audio.onended = function() {
            if(app.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        // Listen action click list 
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if(songNode || e.target.closest('.option')) {
                
                // Clicked song 
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    audio.play()
                }

                // Click option
                if(e.target.closest('.option')) {

                }
            }
        }


    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            if(this.currentIndex < 2) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
        }, 500)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        if ($('.song.active')) 
        {
            $('.song.active').classList.remove('active');
        }
        $$('.song')[app.currentIndex].classList.add('active')
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex
        
        newIndex = Math.floor(Math.random() * this.songs.length)
        if(count > 0 || newIndex === this.currentIndex){
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
                var isIterate = playedList.includes(newIndex);
            } while (isIterate)
        }

        playedList[count] = newIndex

        this.currentIndex = newIndex
        this.loadCurrentSong()
        if(count === this.songs.length-1){
            playedList = []
            count = -1
        }
        count++
    },
    start: function() {
        // Load config 
        this.loadConfig()

        // Define properties for object
        this.defineProperties()

        // Handle Dom Event  
        this.handleEvents()

        // Load first song into UI
        this.loadCurrentSong()

        // Render songs list into screen
        this.render()
    }
}

app.start()

var array = ['Javascript', 'PHP', 'C']

function loop(start, end, cb) {
    if(start >= end){
        return 0
    }
    cb(start)
    return loop(start+1, end, cb)

}

loop(0,array.length, function(index) {
    console.log('index: ' + array[index])
})

