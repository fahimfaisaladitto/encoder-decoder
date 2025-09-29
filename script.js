// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const toggleBall = document.getElementById('toggleBall');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(isDark) {
    htmlElement.classList.toggle('dark', isDark);
    if (isDark) {
        toggleBall.style.transform = 'translateX(24px)';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        toggleBall.style.transform = 'translateX(0)';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialThemeIsDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
setTheme(initialThemeIsDark);
if(darkModeToggle) darkModeToggle.checked = initialThemeIsDark;

darkModeToggle.addEventListener('change', () => {
    setTheme(darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});


// --- Converter Logic ---
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const encodingType = document.getElementById('encodingType');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const encodeModeBtn = document.getElementById('encodeModeBtn');
const decodeModeBtn = document.getElementById('decodeModeBtn');
const sliderIndicator = document.getElementById('sliderIndicator');
const actionBtn = document.getElementById('actionBtn');
const textInputContainer = document.getElementById('textInputContainer');
const imageUploadContainer = document.getElementById('imageUploadContainer');
const imageInput = document.getElementById('imageInput');
const fileDropArea = document.getElementById('fileDropArea');
const fileDropText = document.getElementById('fileDropText');
const textOutputContainer = document.getElementById('textOutputContainer');
const imageOutputContainer = document.getElementById('imageOutputContainer');
const decodedImage = document.getElementById('decodedImage');
const downloadBtn = document.getElementById('downloadBtn');
const controlsContainer = document.getElementById('controlsContainer');


let currentOperation = 'encode'; // Default operation

const conversionOptions = {
    "Text to Base64": "base64",
    "Image to Base64": "image-base64",
    "Base64 to Image": "base64-image",
    "URL (Percent-Encoding)": "url",
    "Hex": "hex",
    "ROT13": "rot13"
};

function populateOptions() {
    encodingType.innerHTML = '';
    for (const key in conversionOptions) {
        if (currentOperation === 'decode' && key === 'Image to Base64') continue;
        if (currentOperation === 'encode' && key === 'Base64 to Image') continue;

        const option = document.createElement('option');
        option.value = conversionOptions[key];
        option.textContent = key;
        encodingType.appendChild(option);
    }
}

const updateIOVisibility = () => {
     const type = encodingType.value;
      // Handle Inputs
     if (currentOperation === 'encode' && type === 'image-base64') {
         textInputContainer.classList.add('hidden');
         imageUploadContainer.classList.remove('hidden');
     } else {
         textInputContainer.classList.remove('hidden');
         imageUploadContainer.classList.add('hidden');
     }
      // Handle Outputs
     if (currentOperation === 'decode' && type === 'base64-image') {
         textOutputContainer.classList.add('hidden');
         imageOutputContainer.classList.remove('hidden');
         controlsContainer.classList.add('hidden');
     } else {
         textOutputContainer.classList.remove('hidden');
         imageOutputContainer.classList.add('hidden');
         controlsContainer.classList.remove('hidden');
     }
}

const rot13 = (str) => {
    return str.replace(/[a-zA-Z]/g, (c) => {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
};

const handleEncode = () => {
    statusMessage.textContent = '';
    const type = encodingType.value;

    if (type === 'image-base64') {
        const file = imageInput.files[0];
        if (!file) {
            statusMessage.textContent = 'Please select an image file.';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            outputText.value = e.target.result;
        };
        reader.onerror = () => {
            statusMessage.textContent = 'Error reading file.';
        };
        reader.readAsDataURL(file);
        return;
    }

    const rawText = inputText.value;
    if (!rawText) {
        statusMessage.textContent = 'Input is empty.';
        outputText.value = '';
        return;
    }
    
    let result = '';
    try {
        switch (type) {
            case 'base64':
                result = btoa(unescape(encodeURIComponent(rawText)));
                break;
            case 'url':
                result = encodeURIComponent(rawText);
                break;
            case 'hex':
                result = Array.from(rawText).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
                break;
            case 'rot13':
                result = rot13(rawText);
                break;
        }
        outputText.value = result;
    } catch (error) {
        console.error("Encoding error:", error);
        statusMessage.textContent = 'Error during encoding.';
        outputText.value = '';
    }
};

const handleDecode = () => {
    statusMessage.textContent = '';
    const encodedText = inputText.value;
    const type = encodingType.value;

    if (type === 'base64-image') {
         if (!encodedText) {
             statusMessage.textContent = 'Input is empty.';
             return;
         }
         try {
             decodedImage.src = encodedText.startsWith('data:image') ? encodedText : "data:image/png;base64," + encodedText;
             decodedImage.onerror = () => {
                 statusMessage.textContent = 'Invalid Base64 string for an image.';
                 decodedImage.src = '';
             };
         } catch (e) {
             statusMessage.textContent = 'Invalid Base64 string for an image.';
             decodedImage.src = '';
         }
         return;
    }

    if (!encodedText) {
        statusMessage.textContent = 'Input is empty.';
        outputText.value = '';
        return;
    }

    let result = '';
    try {
        switch (type) {
            case 'base64':
                result = decodeURIComponent(escape(atob(encodedText)));
                break;
            case 'url':
                result = decodeURIComponent(encodedText);
                break;
            case 'hex':
                const hexString = encodedText.replace(/\s/g, '');
                if (/[^0-9a-fA-F]/i.test(hexString) || hexString.length % 2 !== 0) {
                     throw new Error("Invalid hex string.");
                }
                for (let i = 0; i < hexString.length; i += 2) {
                    result += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
                }
                break;
            case 'rot13':
                result = rot13(encodedText);
                break;
        }
        outputText.value = result;
    } catch (error) {
        console.error("Decoding error:", error);
        statusMessage.textContent = `Invalid ${type.toUpperCase()} string.`;
        outputText.value = '';
    }
};

const performConversion = () => {
    if (currentOperation === 'encode') {
        handleEncode();
    } else {
        handleDecode();
    }
};

const handleCopy = () => {
    if (!outputText.value) {
        statusMessage.textContent = 'Output is empty.';
        return;
    }

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = outputText.value;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
        document.execCommand('copy');
        statusMessage.textContent = 'Copied to clipboard!';
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        setTimeout(() => {
            statusMessage.textContent = '';
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        statusMessage.textContent = 'Failed to copy text.';
    }

    document.body.removeChild(tempTextArea);
};

const handleClear = () => {
    inputText.value = '';
    outputText.value = '';
    statusMessage.textContent = '';
    imageInput.value = '';
    decodedImage.src = '';
    fileDropText.innerHTML = `Drag & drop an image, or <span class="font-semibold accent-text">browse</span>`;
};

// --- Event Listeners ---
encodeModeBtn.addEventListener('click', () => {
    currentOperation = 'encode';
    sliderIndicator.style.transform = 'translateX(0)';
    encodeModeBtn.classList.add('active');
    decodeModeBtn.classList.remove('active');
    actionBtn.textContent = "Encode";
    handleClear();
    populateOptions();
    updateIOVisibility();
});

decodeModeBtn.addEventListener('click', () => {
    currentOperation = 'decode';
    sliderIndicator.style.transform = 'translateX(100%)';
    decodeModeBtn.classList.add('active');
    encodeModeBtn.classList.remove('active');
    actionBtn.textContent = "Decode";
    handleClear();
    populateOptions();
    updateIOVisibility();
});

encodingType.addEventListener('change', () => {
    handleClear();
    updateIOVisibility();
});

actionBtn.addEventListener('click', performConversion);
copyBtn.addEventListener('click', handleCopy);
clearBtn.addEventListener('click', handleClear);
downloadBtn.addEventListener('click', () => {
    if (!decodedImage.src || decodedImage.src === window.location.href) { // Check if src is empty or points to the page
        statusMessage.textContent = 'No image to download.';
        return;
    }
    const link = document.createElement('a');
    link.href = decodedImage.src;
    link.download = 'decoded-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- File Upload Listeners ---
fileDropArea.addEventListener('click', () => imageInput.click());
fileDropArea.addEventListener('dragover', (e) => { e.preventDefault(); fileDropArea.classList.add('dragover'); });
fileDropArea.addEventListener('dragleave', () => fileDropArea.classList.remove('dragover'));
fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if(file && file.type.startsWith('image/')){
        imageInput.files = e.dataTransfer.files;
        fileDropText.textContent = file.name;
    }
});
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { fileDropText.textContent = file.name; }
});


document.addEventListener('DOMContentLoaded', () => {
    populateOptions();
    updateIOVisibility();
});
