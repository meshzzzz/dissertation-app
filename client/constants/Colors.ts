const primaryColorLight = '#00529C';
const primaryColorDark = '#003060';
const secondaryColorLight = '#DC80B1';
const secondaryColorDark = '#5b1140';

export default {
  overlay: 'rgba(0, 0, 0, 0.2)',
  light: {
    text: '#000',
    background: '#fff',
    primary: primaryColorLight,
    secondary: secondaryColorLight,
    error: '#de5b5b',
    profile: {
        middleBackground: '#ABC5DD',
        bottomBackground: '#6092C0',
        pinboard: '#E8C99B',
    }
  },
  dark: {
    text: '#fff',
    background: '#000',
    primary: primaryColorDark,
    secondary: secondaryColorDark,
    error: '#c24444',
    profile: {
        middleBackground: '#1E3A5F',
        bottomBackground: '#0E2A4F',
        pinboard: '#806039',
    }
  },
};
