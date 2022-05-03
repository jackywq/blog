# 后端一次性返回 10 万条数据，如何优雅展示？

## 前言

如果后端一次性给前端返回 10 万条数据，前端如何进行优雅的展示呢？（假设后端真的能够传递 10 万条数据到前端）

## 前置工作

先把前置工作做好，后面才能进行测试。

## 后端搭建

新建一个 `server.js`文件，使用 node 起一个服务，并返回给前端`10W`条数据, 执行`node server.js`

```js
// server.js
const http = require('http');

http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,PUT,POST,GET,OPTIONS',
    });

    const list = [];

    for (let i = 0; i < 100000; i++) {
      list.push({
        title: `hello 牧游, 有${i + 1}美女喜欢你`,
      });
    }
    res.end(JSON.stringify(list));
  })
  .listen(8000, () => {
    console.log('正在监听在8000');
  });
```

## 前端页面

新建一个`index.js`文件, 并使用 ajax 请求服务数据

```js
const getList = () => {
  return new Promise((resolve) => {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open('GET', 'http://127.0.0.1:8000');
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        resolve(JSON.parse(xmlhttp.responseText));
      }
    };
  });
};
```

新建一个 `index.html`, 获取 `index.js` 请求的数据，通过挂载在 dom 节点上，然后渲染到页面；

我总结了下面几种方案的渲染时间，依次对比一下

### 1.直接渲染(非常不推荐)

通常的做法是直接遍历所有数据，一次性渲染出来，这种方式显然是不可取的，因为一次性渲染 `10w` 个节点，是非常耗时的

![直接渲染耗时](/public/images/optimize/directRenderTime.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>10万条数据渲染方案</title>
  </head>

  <body>
    <div id="container"></div>
  </body>

  <script src="./index.js"></script>
  <script>
    const getData = async () => {
      console.time('列表时间');
      const list = await getList();
      const dom = document.getElementById('container');

      const renderPage = () => {
        list.forEach((item) => {
          const div = document.createElement('div');
          div.innerHTML = `<span>${item.title}</span>`;
          dom.appendChild(div);
        });
      };

      renderPage();
      console.timeEnd('列表时间');
    };
    getData();
  </script>
</html>
```

### 2. setTimeout 分页渲染

**实现原理：** 把 `10w` 条数据按照每页 `limit` 数量，分成 `Math.ceil(total / limit)` 页，然后多次利用 setTimeout 每次只渲染一页数据，这样会大大减少数据渲染的时间

![setTimeout渲染耗时](/public/images/optimize/directRenderTime.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>10万条数据渲染方案</title>
  </head>

  <body>
    <div id="container"></div>
  </body>

  <script src="./index.js"></script>
  <script>
    const getData = async () => {
      console.time('列表时间');
      const list = await getList();

      const dom = document.getElementById('container');

      let total = list.length; // 总条数
      let limit = 200; // 一页渲染多少条
      let totalPage = Math.ceil(total / limit); // 渲染总页数
      let page = 0; // 页数

      const renderPage = (page) => {
        if (page >= totalPage) {
          return;
        }

        setTimeout(() => {
          // 每次renderPage，i 从上一次渲染的页数开始； 每次只渲染limit条
          for (let i = page * limit; i < page * limit + limit; i++) {
            const div = document.createElement('div');
            div.innerHTML = '<span>' + list[i].title + '</span>';
            dom.appendChild(div);
          }
          renderPage(page + 1);
        }, 0);
      };

      renderPage(page);
      console.timeEnd('列表时间');
    };
    getData();
  </script>
</html>
```

### 3. requestAnimationFrame 分页渲染 (推荐)

**实现原理：** 使用 requestAnimationFrame 代替 setTimeout，会把每一帧中 DOM 操作集中起来，在一次重绘或者回流中去完成，减少了重排的次数，极大提高了性能

![requestAnimationFrame渲染耗时](/public/images/optimize/requestAnmiationFrameRenderTime.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>10万条数据渲染方案</title>
  </head>

  <body>
    <div id="container"></div>
  </body>

  <script src="./index.js"></script>
  <script>
    const getData = async () => {
      console.time('列表时间');
      const list = await getList();

      const dom = document.getElementById('container');

      let total = list.length; // 总条数
      let limit = 200; // 一页渲染多少条
      let totalPage = Math.ceil(total / limit); // 渲染总页数
      let page = 0; // 页数

      const renderPage = (page) => {
        if (page >= totalPage) {
          return;
        }

        window.requestAnimationFrame(() => {
          // 每次renderPage，i 从上一次渲染的页数开始； 每次只渲染limit条
          for (let i = page * limit; i < page * limit + limit; i++) {
            const div = document.createElement('div');
            div.innerHTML = '<span>' + list[i].title + '</span>';
            dom.appendChild(div);
          }
          renderPage(page + 1);
        }, 0);
      };

      renderPage(page);
      console.timeEnd('列表时间');
    };
    getData();
  </script>
</html>
```

### 4. 懒加载（推荐）

**实现原理：** 其实就是先加载在可视区域的数据，当向上滚动时，会按需加载第二页的数据，往后以此类推；这种方式后端的接口也需要作调整，接口也要做成可分页的。 **思路：** 可以使用 `getBoundingClientRect` 方法获取 top 属性，从而计算出滚动条和底部的距离，当达到一定距离后，就可以调用接口获取下一页的数据了。

具体的实现方式这里就不做赘述了。

## 总结

以上四种的实现方式，在大多数业务场景中，`懒加载` 和 `requestAnimationFrame分页渲染` 是比较推荐的。
