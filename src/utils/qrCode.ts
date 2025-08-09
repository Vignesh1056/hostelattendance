import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateAttendanceQR = (): string => {
  const timestamp = Date.now();
  const date = new Date().toDateString();
  return JSON.stringify({
    type: 'attendance',
    timestamp,
    date
  });
};
