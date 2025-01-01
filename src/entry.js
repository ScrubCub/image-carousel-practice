import createCarousel from "./createCarousel";
import { images } from "./index";

const carousel1 = createCarousel('600px', '400px', 'carousel1', ...images);
const body = document.querySelector('body');
// let carousel1 = createCarousel();
body.appendChild(carousel1);