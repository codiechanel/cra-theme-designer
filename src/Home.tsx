import React, { useRef, useEffect, useState } from "react";

import useSWR, { useSWRConfig } from "swr";

import { get, set, observable, values, remove, runInAction } from "mobx";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import globalStore from "./components/GlobalStore";
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore/lite";

import "react-toastify/dist/ReactToastify.css";
import { observer } from "mobx-react-lite";
import { configure } from "mobx";
import { HSLToRGB, RGBToHSL } from "./components/util";
import BGComponent from "./BGComponent";

configure({
  enforceActions: "never",
});

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoBlbte06-Hf93DQW6FYMO7Yorc4gRwI0",
  authDomain: "next-project-af99d.firebaseapp.com",
  projectId: "next-project-af99d",
  storageBucket: "next-project-af99d.appspot.com",
  messagingSenderId: "431366800703",
  appId: "1:431366800703:web:a0d6ee7cde38793b40ff8a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteItem(key) {
  try {
    await deleteDoc(doc(db, "next-shortcuts", key));
    return true;
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

async function getItems() {
  const citiesCol = collection(db, "next-shortcuts");
  // return getDocs(citiesCol);
  const citySnapshot = await getDocs(citiesCol);
  /*citySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data()}`);
  });*/

  // const cityList = citySnapshot.docs.map((doc) => doc.data());

  return citySnapshot.docs;
}

async function getAppGroups() {
  const citiesCol = collection(db, "next-app-group");
  // return getDocs(citiesCol)
  const citySnapshot = await getDocs(citiesCol);
  /*citySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data()}`);
  });*/

  /*  const cityList = citySnapshot.docs.map((doc) => doc.data());
  console.log(cityList);*/
  return citySnapshot.docs;
}

async function getItemsAndGroups() {
  const citiesCol1 = collection(db, "next-shortcuts");

  const citiesCol = collection(db, "next-app-group");
  // return getDocs(citiesCol)

  let result = await Promise.all([getDocs(citiesCol1), getDocs(citiesCol)]);
  /*const data = result.map((res) => res());
  console.log(data);*/
  return result.map((res) => res.docs);
}

function CoolUI() {
  const { data, error } = useSWR("cool", getItemsAndGroups);
  // const { data, error } = useSWR("getItems", getItemsAndGroups);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return <div>CoolUI</div>;
}

export interface SourceElement {
  key?: string;
  updatedAt?: number;
}
export interface LinkedAsset {
  key: string;
  entityType: string;
  classes?: string;
  updatedAt?: number;
}
interface BoxProp {
  key: string;
  name: string;
  type: string;
  subType?: string;
  child?: string | null;
  parent: string | null;
  entityType: string;
  classes: object;
  children?: Array<string>;
  style: object;
  attrs: any;
  extends: string | null;
  sourceElement?: SourceElement;
  component: boolean;
  hasLinkedAsset?: boolean;
  linkedAsset?: LinkedAsset;
  updatedAt?: number;
}
function generateString(length: number = 40) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let text = "";
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return text;
}

export function createBox(type, classes = {}, parent = null): BoxProp {
  let key = generateString(8);
  return {
    key,
    name: key,
    type,
    child: null,
    parent: parent,
    entityType: "box",
    classes: classes,
    children: [],
    style: {},
    attrs: {},
    extends: null,
    sourceElement: {},
    component: false,
  };
}

function createSpan(text) {
  const newBox: any = createBox("span");
  newBox.classes["inline-flex"] = true;
  newBox.child = text;
  return newBox;
}

export function replaceAllLineBreaks(str, replaceWith) {
  return str.replace(/[\n\r]+/g, replaceWith);
}

let supportedAttr = `accept acceptCharset accessKey action allowFullScreen alt async autoComplete
autoFocus autoPlay capture cellPadding cellSpacing challenge charSet checked
cite classID className colSpan cols content contentEditable contextMenu controls
controlsList coords crossOrigin data dateTime default defer dir disabled
download draggable encType form formAction formEncType formMethod formNoValidate
formTarget frameBorder headers height hidden high href hrefLang htmlFor
httpEquiv icon id inputMode integrity is keyParams keyType kind label lang list
loop low manifest marginHeight marginWidth max maxLength media mediaGroup method
min minLength multiple muted name noValidate nonce open optimum pattern
placeholder poster preload profile radioGroup readOnly rel required reversed
role rowSpan rows sandbox scope scoped scrolling seamless selected shape size
sizes span spellCheck src srcDoc srcLang srcSet start step style summary tabIndex target title type useMap value width wmode wrap`;
// supportedAttr = supportedAttr.replace(/[\n\r]+/g, " ");
supportedAttr = replaceAllLineBreaks(supportedAttr, " ");

let supportedAttrArr = supportedAttr.split(" ");

export function looper(doc, parent, boxes) {
  for (let x of doc.childNodes) {
    /* these are the child of svg like path, etc..
     * ignore it */
    if (x?.parentNode?.localName === "svg") {
      continue;
    }
    /* filter our empty strings */
    if (x.nodeType === 3) {
      if (!(x.wholeText.trim().length > 0)) {
        continue;
      }
    }

    let classes = {};
    /* let's filter out svg from classes */
    // if (x.localName !== "svg") {
    if (x.classList && x.classList.length > 0) {
      for (let className of x.classList) {
        classes[className] = true;
      }
    }

    let box;
    if (x.localName === "option") {
      box = createBox(x.localName, classes);
      box.child = x.firstChild?.wholeText;
      // console.log(box);
    } else if (
      x.localName === "span" &&
      x.childNodes &&
      x.childNodes.length === 1
    ) {
      box = createBox(x.localName, classes);
      box.child = x.firstChild?.wholeText.trim();
      // box = createSpan(x.firstChild?.wholeText);
      // console.log("cool", x.firstChild?.wholeText);
    } else if (x.nodeType === 3) {
      if (x?.parentNode?.localName === "span") {
        continue;
      } else if (x?.parentNode?.localName === "option") {
        continue;
      } else {
        // console.log(x.wholeText);
        box = createSpan(x.wholeText.trim());
      }
    } else {
      box = createBox(x.localName, classes);
    }
    /* lets not touch svg styles */
    if (x.localName !== "svg") {
      if (x.attributes && x.attributes["style"]) {
        let val = x.attributes["style"].value;
        // console.log('style value', val)
        // box.style = parse(val);
      }
    }

    if (x.localName === "svg") {
      x.removeAttribute("class");
      box.child = x.outerHTML;
      // console.log(x.outerHTML);
    }
    // tagName: "IMG"
    else if (x.localName === "img") {
      box.attrs.src = x.src;
    } else if (x.localName === "input") {
      // box.attrs.tabindex = 10;
      if (x.attributes) {
        // console.log("x.attributes", x.attributes);
        /* wait ... placeholder works even if not camelcase
         * does it mean theres no need for conversion ? */
        for (let attr of x.attributes) {
          // let [key, value] = attr;
          if (attr.name === "class" || attr.name === "style") continue;
          let attrName = attr.name;

          let res = supportedAttrArr.find(
            (element) => element.toLowerCase() === attr.name
          );
          if (res) {
            attrName = res;
          }
          box.attrs[attrName] = attr.value;
          // console.log("attr", attr);
        }
      }

      /*  if (x.attributes && x.attributes["type"]) {
              let val = x.attributes["type"].value;
              box.attrs.type = val;
            }
            if (x.attributes && x.attributes["placeholder"]) {
              let val = x.attributes["placeholder"].value;
              box.attrs.placeholder = val;
            }*/
      // placeholder
    }

    box.parent = parent.key;
    parent.children.push(box.key);
    boxes[box.key] = box;
    if (x.childNodes && x.childNodes.length > 0) {
      looper(x, box, boxes);
    }
  }
}

let boxes = {};

function importHtml(content) {
  content = content.replace(/<\!--.*?-->/g, "");
  let parser = new DOMParser();
  let doc = parser.parseFromString(content, "text/html");
  let html = doc.childNodes[0];
  let body = html.childNodes[1];

  let root = createBox("div");
  // root.key = "root";

  looper(body, root, boxes);

  boxes[root.key] = root;

  console.log(boxes);

  globalStore.activeBox = boxes;

  globalStore.rootKey = root.key;

  return root;

  /*let newProject = {
    name: "coolness max",
    entityType: "project",
    collection: globalStore.selectedCollection._id,
    rootKey: root.key,
    boxes,
  };
  console.log(body.childNodes, newProject);*/
  /* runInAction(() => {
    globalStore.activeElementId = root.key;
    globalStore.selectedProject = newProject;
  });*/
}

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

const TimerView = observer(() => (
  <div>
    activeElementId: {globalStore.activeElementId}
    <div>activeTheme: {globalStore.activeTheme.primary}</div>
  </div>
));

function MyTheme() {
  var result = new Array();
  for (var key in globalStore.activeTheme) {
    if (globalStore.activeTheme.hasOwnProperty(key)) {
      result.push([key, globalStore.activeTheme[key]]);
      // console.log(key + " -> " + globalStore.activeTheme[key]);
    }
  }
  return (
    <div>
      MyTheme
      {result.map((x) => {
        let [key, val] = x;
        let newKey = "bg-" + key;
        return (
          <div
            className={newKey + " p-4"}
            key={key}
            onClick={() => {
              if (globalStore.activeElementId) {
                let item = globalStore.activeBox[globalStore.activeElementId];
                // console.log(item.classes);

                let p = Object.keys(item.classes);
                runInAction(() => {
                  p.forEach((x) => {
                    if (x.startsWith("bg-")) {
                      // console.log("found", x);
                      // delete item.classes["bg-" + key];
                      remove(item.classes, x);
                    }
                  });
                });

                /* console.log("getting", newKey);
                console.log(
                  "hmmm",

                  document.documentElement.style.getPropertyValue("--p")
                );*/
                // item.classes[newKey] = true;

                runInAction(() => {
                  item.bgThemeColor = key;
                  globalStore.activeThemeColor = key;
                });
              }
            }}
          >
            {key}
          </div>
        );
      })}
    </div>
  );
}

function Demo() {
  let html = `
    <div class="bg-primary"><p class="p-8">hello</p></div>
    `;

  /*let item: any = {};*/

  /*item =*/
  importHtml(html);

  return (
    <div>
      demo
      <TimerView />
      <button
        onClick={() => {
          globalStore.activeTheme.primary = "yeah";
        }}
      >
        set active theme
      </button>
      <BGComponent />
      {/*   <SafeHydrate>
        {process.browser && <ElementWrapper key={item.key} item={item} />}
      </SafeHydrate>*/}
    </div>
  );
}

let colorMap = {
  /* your theme name */
  primary: "--p" /* Primary color */,
  "primary-focus": "--pf" /* Primary color - focused */,
  "primary-content":
    "--pc" /* Foreground content color to use on primary color */,

  secondary: "--s" /* Secondary color */,
  "secondary-focus": "--sf" /* Secondary color - focused */,
  "secondary-content":
    "--sc" /* Foreground content color to use on secondary color */,

  accent: "--a" /* Accent color */,
  "accent-focus": "--af" /* Accent color - focused */,
  "accent-content":
    "--ac" /* Foreground content color to use on accent color */,

  neutral: "--n" /* Neutral color */,
  "neutral-focus": "--nf" /* Neutral color - focused */,
  "neutral-content":
    "--nc" /* Foreground content color to use on neutral color */,

  /*background color*/
  "base-100": "--b1" /* Base color of page, used for blank backgrounds */,
  "base-200": "--b2" /* Base color, a little darker */,
  "base-300": "--b3" /* Base color, even more darker */,
  /*text color*/
  "base-content": "--bc" /* Foreground content color to use on base color */,

  info: "--in" /* Info */,
  success: "--su" /* Success */,
  warning: "--wa" /* Warning */,
  error: "--er" /* Error */,
};

const MySlider = observer(({ item = null }: any) => {
  const sliderRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      {globalStore.activeThemeColor}
      <div className="p-8 flex gap-4">
        <div>hue</div>
        <input
          ref={(el) => {
            sliderRef.current = el;
          }}
          type="range"
          max="360"
          className="range range-primary bg-gray-600"
          onChange={(e) => {
            /* console.log(e.currentTarget.value);
            console.log(document.documentElement.style.getPropertyValue("--p"));*/
            let style = getComputedStyle(document.body);

            let cssColor = colorMap[globalStore.activeThemeColor];
            console.log("cssColor", cssColor);

            // console.log(style);
            let s = style.getPropertyValue(cssColor);
            let arr = s.split(" ");
            console.log(arr);
            arr[0] = e.currentTarget.value;
            let newHsl = `${arr[0]} ${arr[1]} ${arr[2]}`;
            document.documentElement.style.setProperty(cssColor, newHsl);

            /*document.documentElement.style.setProperty(
              "--p",
              RGBToHSL(0, 255, 0)
          );*/
            // selectRef?.current.value
          }}
        />
      </div>
    </div>
  );
});

export default function Home() {
  return (
    <div id="mine" className="text-black p-4 bg-red-400 ">
      <div className="prose-2xl font-bold">Keyboard Shortcuts</div>
      {/*<Profile />*/}
      <Demo />

      <div className="flex ">
        <div
          className="w-[300px]"
          onClick={() => {
            // document.documentElement.style.setProperty("--cool", "#ff0000");
            /*document.styleSheets[0].cssRules[0].style;*/
            // console.log(document.styleSheets);
            let style = getComputedStyle(document.body);

            console.log(style);
            console.log(style.getPropertyValue("--p"));
            let p = style.getPropertyValue("--p");
            let arr = p.split(" ");
            let [a, b, c] = arr;
            b = b.replace("%", "");
            c = c.replace("%", "");
            console.log(b);
            let res = HSLToRGB(a, b, c);
            console.log(res);
            // console.log(RGBToHSL(0, 255, 0));
            // style.setProperty("--p", RGBToHSL(255, 0, 0));
            document.documentElement.style.setProperty(
              "--p",
              RGBToHSL(0, 255, 0)
            );
            console.log(
              document.documentElement.style.getPropertyValue("--cool")
            );
          }}
        >
          click
        </div>

        <div className="flex">
          <MyTheme />
          <MySlider />
        </div>
      </div>
    </div>
  );
}
