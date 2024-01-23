# YMA Scrollbar

自定义滚动条样式

## Install

```sh
npm install yma-scrollbar
```

## Usage

```js
import 'yma-scrollbar/index.scss';
import Scrollbar from 'yma-scrollbar';

const container = document.getElementById('container');

const scrollbar = new Scrollbar(container);
scrollbar.update(); // 更新
scrollbar.destory(); // 销毁;
```

## Warning

-   1. container css 属性只能存在 width & height
-   2. 如果存在 resize ，请调用 `scrollbar.update()`
