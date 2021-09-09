import { observer } from "mobx-react-lite";
import globalStore from "./components/GlobalStore";
import React from "react";
import classNames from "classnames";

export const textElementTypes = [
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "label",
  "a",
  "button",
  "aside",
  "article",
  "main",
  "option",
];

function clickHandler(item, globalStore) {
  return (e) => {
    e.stopPropagation();
    /* let's select regardless of multiselect */
    globalStore.activeElementId = item.key;
  };
}

const ElementWrapper = observer(({ item }: any) => {
  console.log("ElementWrapper");
  let newClasses: any = [];
  Object.entries(item.classes).forEach((x) => {
    let [key, val] = x;
    // console.log({ [key]: val });
    newClasses.push({ [key]: val });
  });

  // console.log(newClasses);

  let elementClass;
  if (item.bgThemeColor) {
    elementClass = classNames(newClasses, "bg-" + item.bgThemeColor);
  } else {
    elementClass = classNames(newClasses);
  }

  // console.log(elementClass);

  let eleProps: any = {
    onClick: clickHandler(item, globalStore),
    className: " " + elementClass,
  };

  let child = null;
  if (item.child) {
    if (textElementTypes.includes(item.type)) {
      child = item.child;
    } else {
      console.log("why are we here, child is a react component?");
      return null;
      // child = <ElementWrapper key={item.child.key} item={item.child} />;
    }
  }

  // console.log(process.browser, item);

  let children = item?.children?.map((key, i) => {
    // let x = boxes[key];
    let x = globalStore.activeBox[key];

    // @ts-ignore
    return <ElementWrapper key={x.key} item={x} />;
  });

  return React.createElement(item.type, eleProps, [child, ...children]);
});

function BGComponent({ className = null }) {
  let item = globalStore.activeBox[globalStore.rootKey];
  return <ElementWrapper key={item.key} item={item} />;
}

export default observer(BGComponent);
