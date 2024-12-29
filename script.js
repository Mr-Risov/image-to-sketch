document.getElementById('upload').addEventListener('change', handleImageUpload);
document.getElementById('download').addEventListener('click', downloadSketch);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        applySketchEffect(ctx, img.width, img.height);
    };
}

function applySketchEffect(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }

    // Invert colors
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    // Apply Gaussian blur
    const blurredData = gaussianBlur(imageData, width, height);

    // Merge original and blurred to create the sketch effect
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(data[i] * 256 / (255 - blurredData[i]), 255);
        data[i + 1] = Math.min(data[i + 1] * 256 / (255 - blurredData[i + 1]), 255);
        data[i + 2] = Math.min(data[i + 2] * 256 / (255 - blurredData[i + 2]), 255);
    }

    ctx.putImageData(imageData, 0, 0);
}

function gaussianBlur(imageData, width, height) {
    const kernel = [1, 4, 7, 4, 1, 4, 16, 26, 16, 4, 7, 26, 41, 26, 7, 4, 16, 26, 16, 4, 1, 4, 7, 4, 1];
    const kernelSize = 5;
    const kernelSum = 273;
    const halfKernel = Math.floor(kernelSize / 2);
    const data = imageData.data;
    const blurredData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const xk = x + kx;
                    const yk = y + ky;
                    if (xk >= 0 && xk < width && yk >= 0 && yk < height) {
                        const weight = kernel[(ky + halfKernel) * kernelSize + (kx + halfKernel)];
                        const offset = (yk * width + xk) * 4;
                        r += data[offset] * weight;
                        g += data[offset + 1] * weight;
                        b += data[offset + 2] * weight;
                    }
                }
            }
            const offset = (y * width + x) * 4;
            blurredData[offset] = r / kernelSum;
            blurredData[offset + 1] = g / kernelSum;
            blurredData[offset + 2] = b / kernelSum;
            blurredData[offset + 3] = data[offset + 3];
        }
    }

    return blurredData;
}

function downloadSketch() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = 'pencil_sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
                          }
