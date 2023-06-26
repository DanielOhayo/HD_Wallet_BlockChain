import { useEffect, useRef } from "preact/hooks";
import QRCode from "qrcode";
import { styles } from "../utils/styles";
import { showPopup } from "../utils/utils";

function QRCodeDisplay({ address }) {
  const qrCodeRef = useRef(null);

  const copyQRCodeToClipboard = (e) => {
    const canvas = qrCodeRef.current;
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      const buttonRect = e.target.getBoundingClientRect();
      showPopup("QR code copied to clipboard", buttonRect.top - 40);
    });
  };

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const canvas = qrCodeRef.current;
        await QRCode.toCanvas(canvas, address, {
          width: canvas.offsetWidth,
          height: canvas.offsetWidth,
          margin: 0,
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [address]);

  return (
    <>
      <div class="flex justify-center">
        <div class="inline-block border-4 border-transparent hover:border-gray-300 p-2 m-4 cursor-pointer">
          <canvas
            ref={qrCodeRef}
            style={{
              width: "200px",
              height: "auto",
              padding: "0px",
              margin: "0px",
            }}
            onClick={(e) => copyQRCodeToClipboard(e)}
            title="click to copy"
          />
        </div>
      </div>
      <div class="text-center">
        <button class={styles.link} onClick={(e) => copyQRCodeToClipboard(e)}>
          copy QR code
        </button>
      </div>
    </>
  );
}

export default QRCodeDisplay;
