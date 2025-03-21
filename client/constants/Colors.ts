const primaryColorLight = '#00529C';
const primaryColorDark = '#003060';
const secondaryColorLight = '#DC80B1';
const secondaryColorDark = '#5b1140';
const primaryContainerLight = '#d5e3ff';
const primaryContainerDark = '#004688';
const secondaryContainerLight = '#ffd8e9';
const secondaryContainerDark = '#772958';

const profileColors = {
    light: {
        middleBackground: '#ABC5DD',
        bottomBackground: '#6092C0',
        pinboard: '#E8C99B',
      },
    dark: {
        middleBackground: '#1E3A5F',
        bottomBackground: '#0E2A4F',
        pinboard: '#806039',
    }
}

export default {
  light: {
    text: '#000',
    background: '#fff',
    primary: primaryColorLight,
    secondary: secondaryColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: primaryColorLight,
    profile: profileColors.light,
  },
  dark: {
    text: '#fff',
    background: '#000',
    primary: primaryColorDark,
    secondary: secondaryColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: primaryColorDark,
    profile: profileColors.dark,
  },
};
