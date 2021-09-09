import {
  computed,
  observable,
  makeObservable,
  observe,
  runInAction,
  spy,
  toJS,
} from "mobx";
import classNames from "classnames";
class GlobalStore {
  activeBox;
  rootKey;
  activeElementId;
  activeThemeColor;
  activeTheme = {
    /* your theme name */
    primary: "#1e1f26" /* Primary color */,
    "primary-focus": "#315bff" /* Primary color - focused */,
    "primary-content":
      "#ffffff" /* Foreground content color to use on primary color */,

    secondary: "#2c303a" /* Secondary color */,
    "secondary-focus": "#f3cc30" /* Secondary color - focused */,
    "secondary-content":
      "#ADB9CA" /* Foreground content color to use on secondary color */,

    accent: "#8493A8" /* Accent color */,
    "accent-focus": "#2aa79b" /* Accent color - focused */,
    "accent-content":
      "#ffffff" /* Foreground content color to use on accent color */,

    neutral: "#c0c3d0" /* Neutral color */,
    "neutral-focus": "#2a2e37" /* Neutral color - focused */,
    "neutral-content":
      "#ADB9CA" /* Foreground content color to use on neutral color */,

    /*background color*/
    "base-100": "#ffffff" /* Base color of page, used for blank backgrounds */,
    "base-200": "#f9fafb" /* Base color, a little darker */,
    "base-300": "#d1d5db" /* Base color, even more darker */,
    /*text color*/
    "base-content":
      "#ffffff" /* Foreground content color to use on base color */,

    info: "#2094f3" /* Info */,
    success: "#22A7F0" /* Success */,
    warning: "#ff9900" /* Warning */,
    error: "#ff5724" /* Error */,
  };

  constructor() {
    makeObservable(this, {
      activeElementId: observable,
      activeTheme: observable,
      activeBox: observable,
      rootKey: observable,
      activeThemeColor: observable,
    });
  }
}

const globalStore = new GlobalStore();

export default globalStore;
