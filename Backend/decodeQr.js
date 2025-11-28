import Jimp from "jimp";
import QrCode from "qrcode-reader";

const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATPSURBVO3BQY4kRxIEQbVA/f/...";

// Convert Base64 to buffer
const buffer = Buffer.from(base64Data, "base64");

async function decodeQR() {
  try {
    // create image instance using constructor
    const image = await Jimp.read(buffer);

    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err) {
        console.error("Error decoding QR:", err);
      } else {
        console.log("Decoded QR code value:", value.result);
      }
    };

    qr.decode(image.bitmap);
  } catch (err) {
    console.error("Error reading image:", err);
  }
}

decodeQR();
