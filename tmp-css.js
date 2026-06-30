const fs = require('fs');
const p = 'E:/ClaudeCode/AI-Client/apps/desktop/src/styles/globals.css';
let s = fs.readFileSync(p, 'utf8');

// 把原本的 .light 块里" :root, .light {" 改成 ":root {"
// 再插入三个新主题块 .sakura / .mint / .sunset 在 .light 之后
// 简化：把 ":root," 替换为 ":root,"，给 :root 留默认；然后在 .light 块后插入三块。

// 1) 去掉 .light 的合并声明，只让 :root 拥有默认主题；让 .default 也能用
const oldRoot = `  /* 娴呰壊涓婚 - 榛樿锛圓esop/鏃犲嵃鑹搧 脳 鑻规灉瀹樼綉 椋庢牸锛?*/
  :root,
  .light {`;

const newRoot = `  /* 榛樿涓婚 鈥? Aesop/鏃犲嵃鑹搧 脳 鑻规灉瀹樼綉 椋庢牸锛堟棫绮夋３鑹诧級 */
  :root,
  .default {`;

// 注：这里注释里的中文是 mojibake，但文件实际存的是真中文，下面我们直接用文件里的真中文做匹配
console.log('root found:', s.includes(oldRoot));
s = s.replace(oldRoot, newRoot);

fs.writeFileSync(p, s, 'utf8');
console.log('step 1 done');
