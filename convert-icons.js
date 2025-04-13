const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Sizes for the icons
const sizes = [16, 48, 128];

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, 'extension', 'icons', 'icon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a data URL from the SVG content
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Load the SVG image
    const image = await loadImage(svgDataUrl);
    
    // Convert to different sizes
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas
      ctx.drawImage(image, 0, 0, size, size);
      
      // Save the PNG
      const pngPath = path.join(__dirname, 'extension', 'icons', `icon${size}.png`);
      const pngBuffer = canvas.toBuffer('image/png');
      fs.writeFileSync(pngPath, pngBuffer);
      
      console.log(`Created icon${size}.png`);
    }
    
    console.log('Icon conversion complete!');
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

convertSvgToPng();
