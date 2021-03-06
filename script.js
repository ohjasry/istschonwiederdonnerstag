const announcementElement = document.getElementById('announcement')
const esIstDoElement = document.getElementById('esistdo')
const heroElement = document.getElementById('hero')
const wrapperElement = document.getElementById('wrapper')

function updateText(title) {
  announcementElement.innerHTML = title
}

function countdown(daysLeft, title) {
  if (daysLeft === 0) return 'HEUTE'
  if (daysLeft === 1) return 'morgen'
  if (daysLeft === 2) return title ? 'übermorgen' : 'über&#8203;morgen'
  return `in ${daysLeft} Tagen`
}

function show(element) {
  element.classList.remove('hidden')
}

function hide(element) {
  element.classList.add('hidden')
}

const getPixelNumber = value => Number(value.slice(0, -2))

function rescale() {
  const style = getComputedStyle(heroElement)
  const availableWidth =
    heroElement.clientWidth -
    getPixelNumber(style.paddingLeft) -
    getPixelNumber(style.paddingRight)
  const availableHeight =
    heroElement.clientHeight -
    getPixelNumber(style.paddingTop) -
    getPixelNumber(style.paddingBottom)
  const scale = Math.min(
    availableWidth / announcementElement.offsetWidth,
    availableHeight / announcementElement.offsetHeight
  )

  announcementElement.style.transform = `scale(${scale})`
}

function updateIcon(link, days, originalUrl) {
  if (days < 7 && days > 0) {
    link.href = `countdown/${days}.png`
  } else {
    link.href = originalUrl
  }
}

const replaceClassNames = (classOld, classNew) => element => {
  element.classList.remove(classOld)
  element.classList.add(classNew)
}

const makeBlock = (line, classes = '') =>
  `<span class="block ${classes}">${line}</span>`

const donnerstag = 4
const millisecondsPerDay = 86400000
const link =
  document.querySelector("link[rel='shortcut icon']") ||
  document.createElement('link')
const originalUrl = link.href

function update(date) {
  const today = date.getDay()
  const daysTilDonnerstag = (donnerstag + 7 - today) % 7
  updateIcon(link, daysTilDonnerstag, originalUrl)

  if (today === donnerstag) {
    // ES IST WIEDER DONNERSTAG
    document.title = 'Es ist wieder Donnerstag!'
    show(esIstDoElement)
    hide(announcementElement)

    const jetztZam = Array.from(document.querySelectorAll('svg.jetztzam'))
    const wiederDo = Array.from(document.querySelectorAll('svg.wiederdo'))

    const [hoverOnly, noHoverOnly] =
      date.getHours() >= 18 ? [wiederDo, jetztZam] : [jetztZam, wiederDo]

    // WIR SIND JETZT ZUSAMMEN
    hoverOnly.forEach(replaceClassNames('nohoveronly', 'hoveronly'))
    noHoverOnly.forEach(replaceClassNames('hoveronly', 'nohoveronly'))
  } else {
    // BALD IST WIEDER DONNERSTAG
    show(announcementElement)
    hide(esIstDoElement)
    const nextDonnerstag = new Date(
      Date.now() + daysTilDonnerstag * millisecondsPerDay
    )
    const dateString = nextDonnerstag.toLocaleDateString('de-AT', {
      month: 'long',
      day: 'numeric'
    })
    const plural = daysTilDonnerstag > 1

    document.title = countdown(daysTilDonnerstag, true)

    updateText(
      [
        makeBlock(countdown(daysTilDonnerstag), 'nohoveronly'),
        makeBlock(`Am ${dateString}`, 'hoveronly'),
        makeBlock(`ist wieder`),
        makeBlock(`Donners&#8203;tag!`)
      ].join('\n')
    )

    rescale()
    window.addEventListener('load', rescale)
    window.addEventListener('resize', rescale)
    window.addEventListener('orientationchange', rescale)
  }
}

wrapperElement.addEventListener('dblclick', wrapperElement.requestFullscreen)


let inverse = false
let preventClick = false

const addTouched = () =>
  inverse
    ? wrapperElement.classList.remove('touched')
    : wrapperElement.classList.add('touched')
const removeTouched = () =>
  inverse
    ? wrapperElement.classList.add('touched')
    : wrapperElement.classList.remove('touched')

const makeTouchSwitch = value => event => {
  if (value) {
    addTouched()
  } else {
    // timeout gives buffer because css :active triggers
    removeTouched()
  }
}

const makeTouchHandler = value => {
  let timeout
  return event => {
    if (timeout) clearTimeout(timeout)
    preventClick = true
    timeout = setTimeout(() => preventClick = false, 100)
    makeTouchSwitch(value)(event)
  }
}

wrapperElement.addEventListener('click', event => {
  if (preventClick) return
  wrapperElement.classList.toggle('touched')
  inverse = !inverse
})

wrapperElement.addEventListener('touchstart', makeTouchHandler(true), true)
wrapperElement.addEventListener('touchend', makeTouchHandler(false), true)
wrapperElement.addEventListener('touchcancel', makeTouchSwitch(false), true)

function run() {
  update(new Date())
}

hero.classList.remove('hidden')

run()
let interval = setInterval(run, 1000)
