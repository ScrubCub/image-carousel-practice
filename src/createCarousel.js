import "./stylesheet.css";
import nextButtonIcon from "./icons/nextArrow.svg";
import previousButtonIcon from "./icons/previousArrow.svg";
import dotIcon from "./icons/circle-outline.svg";
import fullDotIcon from "./icons/circle.svg";

const stylesheet = document.styleSheets[0];

const setupImg = function setupImages(imageHeight, imageWidth, className, imageSources) {
    const images = [];

    imageSources.forEach((image) => {
        let img = document.createElement('img');
        img.src = image;
        images.push(img);
        img.className = `${className}_images`;
    });

    stylesheet.insertRule(`.${className}_images {
        height: ${imageHeight};
        width: ${imageWidth};
        }`
    );
    
    return images;
}

const setupFrame = function setupFrame(frameHeight, frameWidth, className, frame) {
    frame.className = className;
    
    stylesheet.insertRule(`.${className} {
        display: flex;
        flex-direction: row;
        max-height: ${frameHeight};
        max-width: ${frameWidth};
        overflow: hidden;
        border: 5px solid black;
        position: relative;
        }`
    );
}

const setCarouselStyle = function setCarouselStyle(className) {
    stylesheet.insertRule(`.${className} > div {
        display: flex;
        flex-direction: row;
        right: 0px;
        position: relative;
        transition: right 0.5s;
        }`
    );
}

const setButtonStyle = function setButtonStyle(className, frameHeightPx) {
    // Button height is 10% of frame height
    let height = Number(frameHeightPx.slice(0, -2)) * (0.05);
    stylesheet.insertRule(`.${className}_buttons {
        height: ${height}px;
        aspect-ratio: 1;
        position: absolute;
        cursor: pointer;
        top: calc(50% - ${height * 0.5}px);
        }`
    );
}

const posButtons = function positionButtons(className, direction) {
    let selector = `#${className}_${direction}_button`;
    stylesheet.insertRule(`${selector} {}`);
    let declaration = [...stylesheet.cssRules].find((e) => e.selectorText === selector);
    
    if (direction === 'next') {
        declaration.style.setProperty('right', '0');
    }
}

const dotListener = function attachDotListener(className, currentAnchorWidth, dot, dots) {
    const selector = `.${className} > div`;
    const declaration = [...stylesheet.cssRules].find((r) => r.selectorText === selector);
    dot.addEventListener('click', () => {
        declaration.style.setProperty('right', `${currentAnchorWidth}px`);
        dots.forEach((dot) => dot.classList.remove('in_focus'));
        dot.classList.toggle('in_focus');
    });
    
}

const dotStyle = function addDotStyle(className) {
    const selector = `.${className}_dots`;
    stylesheet.insertRule(`${selector} {
        height: 15px;
        aspect-ratio: 1;
        cursor: pointer;
        content: url(${dotIcon})
        }`
    );

    stylesheet.insertRule(`${selector}.in_focus {
        content: url(${fullDotIcon});
        }`
    )
}

const setupDots = function setupCarouselDots(className, frameWidthPx, numberOfImages) {
    const dotsDiv = document.createElement('div');
    const dots = []
    let frameWidth = Number(frameWidthPx.slice(0, -2));
    let currentAnchorWidth = 0;

    for (let i = 0; i < numberOfImages; i++) {
        let dot = document.createElement('img');
        dot.className = `${className}_dots`;
        dot.classList.toggle(`dot_${currentAnchorWidth}`);
        dotListener(className, currentAnchorWidth, dot, dots);
        currentAnchorWidth += frameWidth;
        dotsDiv.appendChild(dot);
        dots.push(dot)
    }

    dotStyle(className);
    dots[0].classList.toggle('in_focus');

    return [dotsDiv, dots];
};

const posDots = function positionDots(className, numberOfImages) {
    const selector = `.${className} > div:last-child`;
    stylesheet.insertRule(`${selector} {
        position: absolute;
        bottom: 0;
        right: calc(50% - ${7.5 * numberOfImages}px);
        }`
    )
}

const navigate = function navigateToNextFrame(className, frameWidthPx, carouselWidth, direction, dots) {
    let declaration = [...stylesheet.cssRules].find((header) => header.selectorText === `.${className} > div`);
    let frameWidth = Number(frameWidthPx.slice(0, -2));
    // We slice the returned string of getPropertyValue to get the current right offset value
    let currentRightOffset = Number(declaration.style.getPropertyValue("right").slice(0, -2));
    
    
    if (direction === 'next') {
        currentRightOffset += Number(frameWidth);
        if (currentRightOffset === carouselWidth) {
            currentRightOffset = 0; // we set the right offset back to the start to show first photo
        }

    }

    if (direction === 'back') {
        currentRightOffset -= Number(frameWidth);

        if (currentRightOffset < 0) {
            currentRightOffset = carouselWidth - frameWidth // similar to above but to show last photo
        }
    }

    dots.forEach((dot) => {
        dot.classList.remove(`in_focus`);
    });

    const currentDot = document.querySelector(`.dot_${currentRightOffset}`);
    currentDot.classList.toggle('in_focus');
    declaration.style.setProperty('right', `${currentRightOffset}px`);
}

const auto = function autoNavigate(className, frameWidthPx, carouselDiv, dots) {
    setTimeout(() => {
        navigate(className, frameWidthPx, carouselDiv.offsetWidth, 'next', dots);
        auto(className, frameWidthPx, carouselDiv, dots);
    }, 5000);
}

const createCarousel = function createCarouselFunction(frameHeight, frameWidth, className, ...imageSources) {
    const frameDiv = document.createElement('div');
    const carouselDiv = document.createElement('div');
    const nextButton = document.createElement('img');
    const previousButton = document.createElement('img');
    const images = setupImg(frameHeight, frameWidth, className, imageSources);
    setCarouselStyle(className);

    const [dotsDiv, dots] = setupDots(className, frameWidth, images.length);

    images.forEach((img) => carouselDiv.appendChild(img));
    [carouselDiv, previousButton, nextButton, dotsDiv].forEach((e) => frameDiv.appendChild(e));
    previousButton.src = previousButtonIcon;
    previousButton.id = `${className}_back_button`;
    nextButton.src = nextButtonIcon;
    nextButton.id = `${className}_next_button`;
    [previousButton, nextButton].forEach((e) => e.className = `${className}_buttons`);
    setButtonStyle(className, frameHeight);
    posButtons(className, 'next');
    posButtons(className);
    posDots(className, images.length);
    setupFrame(frameHeight, frameWidth, className, frameDiv);
    nextButton.addEventListener('click', () => navigate(className, frameWidth, carouselDiv.offsetWidth, 'next', dots));
    previousButton.addEventListener('click', () => navigate(className, frameWidth, carouselDiv.offsetWidth, 'back', dots));
    auto(className, frameWidth, carouselDiv, dots);
    return frameDiv;
}

export default createCarousel;