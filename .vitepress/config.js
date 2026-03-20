import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

function getDailyReports() {
  try {
    const sidebar = []
    // 扫描所有月份目录（格式 YYYY-MM）
    const months = fs.readdirSync('.')
      .filter(f => /^\d{4}-\d{2}$/.test(f) && fs.statSync(f).isDirectory())
      .sort((a, b) => b.localeCompare(a)) // 最新月份在前

    for (const month of months) {
      const files = fs.readdirSync(month)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort((a, b) => b.localeCompare(a)) // 最新日期在前

      if (files.length === 0) continue

      const [year, mon] = month.split('-')
      sidebar.push({
        text: `${year}年${mon}月`,
        collapsed: false,
        items: files.map(f => ({
          text: f.replace('.md', ''),
          link: `/${month}/${f.replace('.md', '')}`,
        })),
      })
    }
    return sidebar
  } catch {
    return []
  }
}

export default defineConfig({
  title: 'AI资讯日报',
  description: '每日 AI 行业动态聚合 · 新闻 · 论文 · 开源 · 社区',
  lang: 'zh-CN',
  base: '/ai-daily/',
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
