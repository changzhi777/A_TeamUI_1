import { useProjectStore, type ProjectStatus, type ProjectType } from '@/stores/project-store'
import { useAuthStore } from '@/stores/auth-store'

export const seedProjects = (force: boolean = false) => {
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

  const sampleMembers = [
    { id: 'member-1', name: '张导演', role: 'director', avatar: '' },
    { id: 'member-2', name: '李编剧', role: 'writer', avatar: '' },
    { id: 'member-3', name: '王摄影', role: 'cinematographer', avatar: '' },
    { id: 'member-4', name: '赵演员', role: 'actor', avatar: '' },
  ]

  const sampleProjects: Array<{
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
            },
    {
      name: '古装穿越剧《梦回大清》',
      description: '现代女孩意外穿越到清朝，卷入宫廷斗争，历经波折最终找到真爱',
      type: 'shortDrama',
      status: 'filming',
      episodeRange: '全50集',
      totalShots: 240,
      completedShots: 180,
      isFavorite: true,
      isPinned: false,
      members: sampleMembers.slice(0, 3),
    },
    {
              name: '悬疑推理剧《迷雾追踪》',
              description: '连环杀人案引发的城市恐慌，刑警队长带领团队抽丝剥茧，揭开真相',
              type: 'shortDrama',
              status: 'postProduction',
              episodeRange: '第1-30集',
              totalShots: 198,
              completedShots: 198,
              isFavorite: false,
              isPinned: false,
              members: sampleMembers.slice(0, 2),
            },
    {
      name: '青春校园剧《那年夏天》',
      description: '高考前的夏天，一群少年经历友情、爱情、亲情的考验，共同成长',
      type: 'shortDrama',
      status: 'completed',
      episodeRange: '第1-24集',
      totalShots: 168,
      completedShots: 168,
      isFavorite: true,
      isPinned: false,
      members: sampleMembers,
    },
    {
      name: '家庭伦理剧《温暖的家》',
      description: '三代同堂的家庭故事，展现传统与现代观念的碰撞与融合',
      type: 'shortDrama',
      status: 'planning',
      episodeRange: '第1-40集',
      totalShots: 210,
      completedShots: 20,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
    },
    {
      name: '奇幻冒险剧《魔法世界》',
      description: '普通人获得魔法能力，进入魔法世界，开始惊险刺激的冒险旅程',
      type: 'shortDrama',
      status: 'filming',
      episodeRange: '1-60集',
      totalShots: 285,
      completedShots: 95,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 3),
    },
    {
      name: '励志职场剧《追梦人》',
      description: '一群年轻人在大城市打拼，追逐梦想，经历挫折后最终实现自我价值',
      type: 'shortDrama',
      status: 'planning',
      episodeRange: '',
      totalShots: 175,
      completedShots: 60,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
    },
    {
      name: '爱情喜剧片《婚礼策划师》',
      description: '婚礼策划师在工作中见证各种爱情故事，同时也在寻找属于自己的真爱',
      type: 'shortDrama',
      status: 'completed',
      episodeRange: '第1-8集',
      totalShots: 132,
      completedShots: 132,
      isFavorite: false,
      isPinned: false,
      members: sampleMembers.slice(0, 2),
    },
  ]

  const addProject = useProjectStore.getState().addProject

  sampleProjects.forEach((project, index) => {
    addProject({
      ...project,
      createdBy: user.id,
    })
  })

  console.log(`Seeded ${sampleProjects.length} sample projects`)
  return true
}

export const clearSeedData = () => {
  const { projects } = useProjectStore.getState()
  const deleteProject = useProjectStore.getState().deleteProject
  
  projects.forEach((project) => {
    deleteProject(project.id)
  })
  
  console.log('Cleared all seed projects')
}
