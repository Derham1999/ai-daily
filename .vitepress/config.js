import { defineConfig } from 'vitepress'
import fs from 'fs'

function getDailyReports() {
  try {
    return fs.readdirSync('.')
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort((a, b) => b.localeCompare(a))
      .map(f => ({
        text: f.replace('.md', ''),
        link: '/' + f.replace('.md', ''),
      }))
  } catch {
    return []
  }
}

export default defineConfig({
  title: 'AI资讯日报',
  description: '每日 AI 行业动态聚合 · 新闻 · 论文 · 开源 · 社区',
  lang: 'zh-CN',
  cleanUrls: true,

  themeConfig: {
    logo: '🤖',
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/Derham1999/ai-daily' },
    ],
    sidebar: getDailyReports(),
    outline: {
      label: '本期内容',
      level: [2, 3],
    },
    lastUpdated: {
      text: '更新于',
    },
    docFooter: {
      prev: '上一期',
      next: '下一期',
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索日报' },
              modal: { noResultsText: '未找到相关内容' },
            },
          },
        },
      },
    },
  },

  markdown: {
    image: {
      lazyLoading: true,
    },
  },
})
