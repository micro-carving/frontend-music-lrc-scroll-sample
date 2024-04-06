/**
 * dom节点对象，方便后续获取
 */
const doms = {
  audio: document.querySelector('audio'),
  ul: document.querySelector('.lrc-list'),
  container: document.querySelector('.container'),
}

/**
 * 歌词数据
 */
// const lrcData = parseLrc(data_1_lrc);
const lrcData = parseLrc(data_2_lrc);

// ************* 歌词处理相关开始 *************
/**
 * 解析歌词
 * 
 * @param {String} lrcStr 歌词字符串
 * @returns {[{startTime:String, lyric:String}]} 歌词对象列表
 */
function parseLrc(lrcStr) {
  if (!lrcStr) {
    return [];
  }

  // 去掉 "[" 并分割歌词
  const lrcArray = lrcStr.replaceAll('[', '').split('\n');
  const lrcList = [];

  for (const item of lrcArray) {
    // 通过 "]" 分割每行歌词，取出时间和显示部分歌词
    const newLrcArray = item.split(']');
    const startTime = convertLrcTime2Seconds(newLrcArray[0]);
    const lyric = newLrcArray[1].trim();

    lrcList.push({ startTime, lyric });
  }
  return lrcList;
}

/**
 * 转换歌词时间（秒）
 * 
 * @example [00:03.68] => 3.68 seconds
 * @param {String} timeStr 
 */
function convertLrcTime2Seconds(timeStr) {
  // 解析时间，格式为 "mm:ss.xx"
  if (!timeStr) {
    return 0;
  }
  const timeArray = timeStr.split(':');
  return 60 * (+timeArray[0]) + (+timeArray[1]);
}

/**
 * 获取高亮歌词下标
 * 
 * @returns {Number} 歌词下标
 */
function getHighlightLrcIndex() {
  const curTime = doms.audio.currentTime;
  for (let i = 0; i < lrcData.length; i++) {
    if (lrcData[i].startTime > curTime) {
      return i - 1;
    }
  }
  // 最后一句歌词处理，停在最后一句歌词上
  return lrcData.length - 1;
}

// ************* 歌词处理相关结束 *************


// ************* 歌词列表相关开始 *************
function createLrcElements() {
  // 文档片段存在于内存中，并不在 DOM 树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。因此，使用文档片段通常会带来更好的性能。
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < lrcData.length; i++) {
    const lrcItem = document.createElement('li');
    lrcItem.textContent = lrcData[i].lyric;
    // 需要修改 dom 树，如果用 lrcItem.innerHTML = `` 每次都要解析DOM树，性能降低
    // 采用文档片段来追加，提升性能
    fragment.appendChild(lrcItem);
  }
  doms.ul.appendChild(fragment);
}

createLrcElements();

// 容器高度
const containerHeight = doms.container.clientHeight;
// 歌词高度
const liHeight = doms.ul.children[0].clientHeight;
// 最大偏移量
const maxOffset = doms.ul.clientHeight - containerHeight;

/**
 * 设置歌词偏移量
 */
function setLrcOffset() {
  const curIdx = getHighlightLrcIndex();
  let offset = (liHeight * curIdx + liHeight / 2) - containerHeight / 2;
  // 处理边界（播放时）
  if (offset < 0) {
    offset = 0;
  }
  // 处理边界（结束时），如果想要结束歌词居中可以不处理此边界，但是为了效果，此处考虑处理边界
  if (offset > maxOffset) {
    offset = maxOffset;
  }
  doms.ul.style.transform = `translateY(${-offset}px)`;

  setLrcHighLight(curIdx);
}

/**
 * 设置歌词高亮
 * 
 * @param {Number} curLrcIndex 当前高亮歌词下标
 */
function setLrcHighLight(curLrcIndex) {
  let li = doms.ul.querySelector('.active');
  if (li) {
    li.classList.remove('active');
  }
  li = doms.ul.children[curLrcIndex];
  if (li) {
    li.classList.add('active');
  }
}

doms.audio.addEventListener('timeupdate', setLrcOffset);
// ************* 歌词列表相关结束 *************
