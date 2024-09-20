import { el, mount, setStyle } from 'redom';
import Cropper from 'cropperjs';

// DOM елементы
const uploadInput = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-button');
const croppBtn = document.getElementById('crop-button');
const downloadBtn = document.getElementById('download-button');
const imageWrapper = document.querySelector('.image-wrapper');
const imageDisplay = document.getElementById('displayed-image');
const croppImage = document.getElementById('image-cropped');
const croppedContainer = document.querySelector('.cropped-container');

// переменные для работы приложения
let downloadLink = null;
let imageName = '';
let imageType = '';
let isUpload = false;
let isCropped = false;
let cropper = null;

//создание сообщения об ошибке
const errorMessage = el('span.error-message');
mount(imageWrapper, errorMessage);

// клик по скрытому инпуту при нажатии на кнопку загрузка изображения
uploadBtn.addEventListener('click', () => {
  uploadInput.click();
});

// обработчик события на скрытом инпуте
uploadInput.addEventListener('change', (e) => {
  try {
    if (cropper) {
      cropper.destroy();
    }
    // загрузка изображения
    const reader = new FileReader();
    const isValid = /\.(jpe?g|svg|png|webp)$/i.test(e.target.value);
    // если выбранный файл не является изображением - ошибка
    if (!isValid) {
      imageDisplay.src = '';
      throw new Error('Выберите изображение для загрузки');
    }
    if (isCropped) {
      setStyle(croppedContainer, { display: 'none' });
    }

    errorMessage.textContent = '';
    reader.onload = (e) => {
      imageDisplay.onload = () => {};
      imageDisplay.src = e.target.result;
      cropper = new Cropper(imageDisplay, {
        viewMode: 2,
      });
    };

    reader.readAsDataURL(e.target.files[0]);
    // получение имени и типа загруженног изображения для передачи в ссылку для скачивания
    imageName = e.target.files[0].name.replace(/\.(jpe?g|svg|png|webp)$/i, '');
    imageType = e.target.files[0].type;

    isUpload = true;
  } catch (error) {
    // обработка ошибки
    errorMessage.textContent = error.message;
    isUpload = false;
  }
});

// обработчик клика на кнопке cropp image
croppBtn.addEventListener('click', () => {
  if (!isUpload) {
    isCropped = false;
    return;
  }

  // получение данных из Cropper
  const croppedImage = cropper.getCroppedCanvas().toDataURL(imageType);
  const containerData = cropper.getImageData();
  const data = cropper.getCropBoxData();

  // установка размеров для контейнера обрезанного изображения
  setStyle(croppedContainer, { width: `${containerData.width}px` });
  setStyle(croppedContainer, { height: `${containerData.height}px` });
  // отрисовка и размеры обрезанного изображения
  croppImage.src = croppedImage;
  setStyle(croppImage, { width: `${data.width}px` });
  setStyle(croppImage, { height: `${data.height}px` });
  setStyle(croppedContainer, { display: 'block' });
  isCropped = true;
});

// скачивание результата
downloadBtn.addEventListener('click', () => {
  if (!isCropped) {
    return;
  }
  if (!downloadLink) {
    downloadLink = el('a.hidden-link', {});
  }
  downloadLink.download = imageName;
  downloadLink.href = croppImage.src;
  mount(croppedContainer, downloadLink);
  downloadLink.click();
});
