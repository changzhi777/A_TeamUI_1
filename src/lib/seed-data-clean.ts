import { useProjectStore, type ProjectStatus, type ProjectType } from '@/stores/project-store'
import { useAuthStore } from '@/stores/auth-store'

const sampleMembers = [
  { id: 'member-1', name: '张导演', email: 'zhang@example.com', role: 'director', avatar: '', joinedAt: new Date().toISOString() },
  { id: 'member-2', name: '李编剧', email: 'li@example.com', role: 'screenwriter', avatar: '', joinedAt: new Date().toISOString() },
  { id: 'member-3', name: '王摄影', email: 'wang@example.com', role: 'cinematographer', avatar: '', joinedAt: new Date().toISOString() },
  { id: 'member-4', name: '赵演员', email: 'zhao@example.com', role: 'actor', avatar: '', joinedAt: new Date().toISOString() },
]

export const seedDiverseProjects = (force: boolean = false) => {
  const { user } = useAuthStore.getState()
  const { projects } = useProjectStore.getState()
  
  if (!user) {
    console.log('No user logged in, skipping seed data')
    return false
  }

  if (!force && projects.length > 0) {
    console.log('Projects already exist, skipping seed data')
    return false
  }

  const diverseProjects: Array<{
    name: string
    description: string
    type: ProjectType
    status: ProjectStatus
    episodeRange: string
    totalShots: number
    completedShots: number
    isFavorite: boolean
    isPinned: boolean
    members: any[]
    director: string
  }> = [
    {
      name: '都市甜宠剧《爱上你的微笑》',
      description: '讲述职场新人林小雨与霸道总裁顾晨曦从误会到相爱的甜宠故事，全剧共12集',
      type: 'shortDrama',
      status: 'planning',
      episodeRange: '第1-12集',
      totalShots: 156,
      completedShots: 45,
      isFavorite: true,
      isPinned: true,
      members: sampleMembers,
      director: '张导演',
    },
    {
      name: '都市情感剧《城市之光》',
      description: '现代都市青年的奋斗与爱情故事，展现都市生活的酸甜苦辣',
      type: 'realLifeDrama',
      status: 'filming',
      episodeRange: '第1-20集',
      totalShots: 180,
      completedShots: 120,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 3),
      director: '李导演',
    },
    {
      name: 'AI科技播客《未来之声》',
      description: '探讨人工智能技术发展趋势，邀请行业专家深度对话',
      type: 'aiPodcast',
      status: 'postProduction',
      episodeRange: '第1-10集',
      totalShots: 50,
      completedShots: 50,
      isFavorite: true,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
      director: '王导演',
    },
    {
      name: '品牌广告《新品发布会》',
      description: '科技产品发布会宣传片，展示产品核心功能与优势',
      type: 'advertisement',
      status: 'completed',
      episodeRange: '1集',
      totalShots: 30,
      completedShots: 30,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
      director: '赵导演',
    },
    {
      name: '音乐MV《追梦人》',
      description: '励志歌曲MV，讲述年轻人追逐梦想的故事',
      type: 'mv',
      status: 'completed',
      episodeRange: '1集',
      totalShots: 45,
      completedShots: 45,
      isFavorite: true,
      isPinned: false,
      members: sampleMembers.slice(0, 3),
      director: '刘导演',
    },
    {
      name: '人文纪录片《非遗传承》',
      description: '记录中国传统非物质文化遗产的传承与发展，展现匠人精神',
      type: 'documentary',
      status: 'filming',
      episodeRange: '第1-6集',
      totalShots: 120,
      completedShots: 80,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
      director: '陈导演',
    },
    {
      name: '综合项目《创意工坊》',
      description: '多媒体创意项目，包含视频、音频、图文等多种形式',
      type: 'other',
      status: 'planning',
      episodeRange: '多形式',
      totalShots: 60,
      completedShots: 15,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
      director: '杨导演',
    },
  ]

  const addProject = useProjectStore.getState().addProject
  const currentProjects = useProjectStore.getState().projects

  diverseProjects.forEach((project) => {
    const existingProject = currentProjects.find(p => p.name === project.name)
    if (!existingProject) {
      addProject({
        ...project,
        createdBy: user.id,
      })
    }
  })

  console.log(`Seeded ${diverseProjects.length} diverse projects (one per type)`)
  return true
}

export const clearAllProjects = () => {
  const { projects } = useProjectStore.getState()
  const deleteProject = useProjectStore.getState().deleteProject
  
  projects.forEach((project) => {
    deleteProject(project.id)
  })
  
  console.log(`Cleared all ${projects.length} projects`)
  return projects.length
}

export const getProjectTypeSummary = () => {
  const { projects } = useProjectStore.getState()
  
  const typeCounts: Record<string, number> = {
    shortDrama: 0,
    realLifeDrama: 0,
    aiPodcast: 0,
    advertisement: 0,
    mv: 0,
    documentary: 0,
    other: 0,
  }
  
  projects.forEach((project) => {
    if (typeCounts[project.type] !== undefined) {
      typeCounts[project.type]++
    }
  })
  
  return {
    total: projects.length,
    byType: typeCounts,
  }
}
