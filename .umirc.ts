import { defineConfig } from 'dumi';

export default defineConfig({
  title: '牧游博客',
  favicon: '/images/muyou.png',
  logo: '/images/muyou.png',
  outputPath: 'docs-dist',
  mode: 'site',
  navs: [
    // null, // null 值代表保留约定式生成的导航，只做增量配置
    {
      title: '首页',
      path: '/home',
    },
    {
        title: '其他网站',
        // 可通过如下形式嵌套二级导航菜单，目前暂不支持更多层级嵌套：
        children: [
          { title: 'github', path: 'https://github.com/jackywq' },
          { title: '稀土掘金', path: 'https://juejin.cn/user/747323636066125/posts' },
        ],
      },
  ],

  menus: {
    '/home': [

      {
        title: '技术family',
        children: [
            {
                title: '工作学习',
                path: '/home/work'
            },
            {
                title: 'Linux技术大全',
                path: '/home/linux'
            }
        ],
      },

      {
        title: '工程化',
        children: [
            {
                title: 'CICD',
                path: '/home/cicd'
            },
            {
                title: 'Docker部署',
                path: '/home/docker'
            }
        ],
      },


      {
        title: '算法',
        children: [
            {
                title: 'leetcode',
                path: '/home/leetcode'
            },
        ],
      },

      {
        title: '进阶',
        children: [
            // {
            //     title: 'leetcode',
            //     path: '/home/leetcode'
            // },
        ],
      },
    ],
  },
});
