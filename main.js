const form = document.getElementById('get-models')
const prevPg = document.getElementById('prevPage')
const nextPg = document.getElementById('nextPage')
const page = document.getElementById('page')
const submit = document.getElementById('submit')
const content = document.getElementById('content')
const dlImageBtn = document.getElementById('dl-image')
const imagesGalleryModal = document.getElementById('imagesGalleryModal')

prevPg.addEventListener('click', pagesChanges, false)
nextPg.addEventListener('click', pagesChanges, false)
form.addEventListener('submit', getModels, false)
form.addEventListener('change', formChanged, false)
dlImageBtn.addEventListener('click', dlImage, false)
imagesGalleryModal.addEventListener('show.bs.modal', modalFunc, false)

function modalFunc({ relatedTarget }) {
    const clickedBtn = relatedTarget
    const fullModels = clickedBtn.closest('.full-model')
    let active = 0
    const images = [...fullModels.querySelectorAll('img')].map((x, i) => {
        if (x == relatedTarget) active = i
        return { img: x.src, w: x.dataset.width, h: x.dataset.height }
    })

    const modalTitle = imagesGalleryModal.querySelector('.modal-title')
    modalTitle.textContent = fullModels.dataset.title

    const modalBody = imagesGalleryModal.querySelector('.modal-body')
    modalBody.innerHTML = ''
    modalBody.append(createCarousel(images, active))
}

function createCarousel(imgArr, index) {
    const bntPrev = CE('button', { class: 'carousel-control-prev', type: 'button', 'data-bs-target': '#carouselExample', 'data-bs-slide': 'prev' }, [CE('span', { class: 'carousel-control-prev-icon' }), CE('span', { class: 'visually-hidden' }, 'Назад')])
    const bntNext = CE('button', { class: 'carousel-control-next', type: 'button', 'data-bs-target': '#carouselExample', 'data-bs-slide': 'next' }, [CE('span', { class: 'carousel-control-next-icon' }), CE('span', { class: 'visually-hidden' }, 'Вперёд')])
    const indicator = CE('div', { class: 'carousel-indicators border-top m-0' })
    const items = CE('div', { class: 'carousel-inner', 'data-bs-interval': '1000' })
    imgArr.map((el, i) => {
        indicator.append(CE('button', { type: 'button', 'data-bs-target': '#carouselExample', 'data-bs-slide-to': i, class: `${index == i ? 'active' : ''}` }))
        items.append(CE('div', { class: `carousel-item ${index == i ? 'active' : ''}` }, CE('img', { src: replaceImageWidth(el.img, el.w), loading: 'lazy', alt:'img' })))
    })
    const carousel = CE('div', { id: 'carouselExample', class: 'carousel slide', 'data-bs-interval': 5000 }, [indicator, items, bntPrev, bntNext])
    return carousel
}

function replaceImageWidth(img, w) {
    return img.replace(/width=[0-9]+/, `width=${w}`)
}

function load() {
    const form = JSON.parse(localStorage.getItem('form'))
    for (const key in form) {
        if (key == 'page') continue
        document.getElementById(key).value = form[key]
    }
    submit.click()
}

function formChanged() {
    localStorage.setItem('form', JSON.stringify(serializeForm(form)))
}

function CE(element, attribute, inner) {
    if (typeof element === 'undefined') return false
    if (typeof inner === 'undefined') inner = ''
    const el = document.createElement(element)
    if (typeof attribute === 'object') {
        for (const key in attribute) {
            const attr = attribute[key]
            if (Object.prototype.toString.call(attr).includes('Object')) {
                const entries = Object.entries(attr)
                // prettier-ignore
                switch (key) {
                    case 'data': entries.map(([k, v]) => (el.dataset[k] = v)); break
                    case 'style': entries.map(([k, v]) => (el.style[k] = v)); break
                    case 'event': entries.map(([k, v]) => el.addEventListener(k, v)); break
                }
            } else {
                if (key === 'checked' && attr === false) continue
                el.setAttribute(key, attr)
            }
        }
    }
    if (!Array.isArray(inner)) inner = [inner]
    for (const key of inner) {
        if (key.tagName) el.appendChild(key)
        else if (key.startsWith('<')) el.innerHTML = key
        else el.appendChild(document.createTextNode(key))
    }
    return el
}

function nextPrevPageState({ currentPage, nextPage }) {
    prevPg.disabled = currentPage == 1
    nextPg.disabled = nextPage > currentPage
}

function buildModels(data) {
    content.innerHTML = ''
    document.body.scrollTop = 0
    nextPrevPageState(data.metadata)

    for (const item of data.items) {
        const el = CE('div', { class: 'col mb-3 border border-1 rounded-1 overflow-hidden full-model', 'data-title': item.name })
        const link = CE('h1', {}, CE('a', { class: 'text-decoration-none', href: `//civitai.com/models/${item.id}`, target: '_blank' }, item.name))
        const modalBtn = CE('button', { class: 'btn btn-secondary', 'data-bs-toggle': 'modal', 'data-bs-target': '#imagesGalleryModal' }, 'Смотреть')
        const all = CE('div', { class: 'px-2 border-bottom d-flex justify-content-between align-items-center' }, [link, modalBtn])
        el.append(all)
        for (const model of item.modelVersions) {
            const grid = CE('div', { class: 'card-grid' })
            el.append(CE('span', { class: 'm-0 p-0 px-2' }, 'версия: ' + model.name))
            el.append(grid)
            for (const img of model.images) {
                const card = CE('div', { class: 'card' })
                card.append(CE('img', { 'data-bs-toggle': 'modal', 'data-bs-target': '#imagesGalleryModal', 'data-width': img.width, 'data-height': img.height, src: img.url, loading: 'lazy' }))
                grid.append(card)
            }
            el.append(CE('hr', { class: 'm-2' }))
        }
        content.append(el)
    }
}

function openImage(img, w, h) {
    const image = replaceImageWidth(img, w)
    const winHtml = `<!DOCTYPE html>
    <html>
        <head>
            <title>Window with Blob</title>
        </head>
        <style>
            body {
                width: 100vw;
                height: 100vh;
                overflow: hidden;
            }
            * {
                margin: 0;
                padding: 0;
            }
            html {
                background: #222;
            }
            .obj-fit {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        </style>
        <script>
            window.onkeydown = e => (e.keyCode == 27) ? window.close() : ''
        </script>
        <body>
            <img class="obj-fit" src="${image}" alt="img" />
        </body>
    </html>`

    const winUrl = URL.createObjectURL(new Blob([winHtml], { type: 'text/html' }))
    open(winUrl)
}

function pagesChanges(e) {
    prevPg.disabled = true
    nextPg.disabled = true
    const v = Number(page.value)
    switch (e.target.id) {
        case 'nextPage':
            page.value = v + 1
            break
        case 'prevPage':
            page.value = v - 1
            break
    }
    submit.click()
}

function serializeForm(form) {
    let obj = {}
    const formData = new FormData(form)
    for (let key of formData.keys()) {
        obj[key] = formData.get(key)
    }
    return obj
}

async function getModels(e) {
    e.preventDefault()
    const url = new URL('https://civitai.com/api/v1/models')
    const form = serializeForm(e.target)
    for (const key in form) {
        url.searchParams.set(key, form[key])
    }
    // processAjaxData('', url.search)
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response)
        })
        .then(function (data) {
            buildModels(data)
        })
        .catch(function (error) {
            console.warn(error)
        })
}

function dlImage(e) {
    const image = document.querySelector('.carousel-item.active img')
    downloadImage(image.src)
}

async function downloadImage(imageSrc) {
    const image = await fetch(imageSrc)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = CE('a', { href: imageURL, download: new Date().getTime() })
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
