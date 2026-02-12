import type { StoryboardShot, ShotSize, CameraMovement } from '@/stores/storyboard-store'
import type { ProjectType } from '@/stores/project-store'

interface ShotTemplate {
  shotSize: ShotSize
  cameraMovement: CameraMovement
  duration: number
  description: string
  dialogue: string
  sound: string
}

const shotTemplates: Record<ProjectType, ShotTemplate[]> = {
  shortDrama: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 8,
      description: '城市天际线远景，夕阳西下，华灯初上',
      dialogue: '',
      sound: '轻柔的城市环境音，远处车流声'
    },
    {
      shotSize: 'long',
      cameraMovement: 'tracking',
      duration: 6,
      description: '主角从远处走来，背影，街道两旁店铺林立',
      dialogue: '',
      sound: '脚步声，街道背景音'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 4,
      description: '主角停下脚步，抬头看向前方，表情凝重',
      dialogue: '（内心独白）终于到了...',
      sound: '音乐渐强，营造紧张感'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 3,
      description: '主角特写，眼神坚定，嘴角微微上扬',
      dialogue: '（轻声）我不会放弃的',
      sound: '心跳音效'
    },
    {
      shotSize: 'extremeCloseUp',
      cameraMovement: 'static',
      duration: 2,
      description: '主角手部特写，紧握成拳',
      dialogue: '',
      sound: '拳头紧握音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 5,
      description: '镜头摇向右侧，展示一家老旧的咖啡馆招牌',
      dialogue: '',
      sound: '咖啡馆环境音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'dolly',
      duration: 4,
      description: '主角推开咖啡馆门，门铃响起',
      dialogue: '',
      sound: '门铃叮咚声'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 6,
      description: '主角走进咖啡馆，环顾四周，寻找座位',
      dialogue: '',
      sound: '轻柔的爵士乐背景音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 3,
      description: '主角发现窗边的座位，眼中闪过一丝惊讶',
      dialogue: '',
      sound: '音乐突然停止'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 8,
      description: '镜头缓缓上升，展示整个咖啡馆内景，主角走向窗边',
      dialogue: '',
      sound: '钢琴独奏渐入'
    }
  ],
  realLifeDrama: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 10,
      description: '清晨的校园全景，薄雾笼罩，学生们陆续进入',
      dialogue: '',
      sound: '鸟鸣声，校园广播背景音'
    },
    {
      shotSize: 'long',
      cameraMovement: 'tracking',
      duration: 7,
      description: '女主角背着书包走在校园小道上，阳光透过树叶洒下',
      dialogue: '',
      sound: '轻快的背景音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 5,
      description: '女主角停下，拿出手机查看消息，眉头微皱',
      dialogue: '',
      sound: '手机提示音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 3,
      description: '手机屏幕特写，显示一条未读消息',
      dialogue: '',
      sound: '消息提示音'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 4,
      description: '镜头摇向左侧，男主角从教学楼走出',
      dialogue: '',
      sound: '脚步声'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 3,
      description: '男主角看到女主角，露出微笑',
      dialogue: '早安',
      sound: '轻柔的音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 6,
      description: '两人并肩走向教室，有说有笑',
      dialogue: '（女主角）昨晚的作业你做完了吗？',
      sound: '校园环境音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'dolly',
      duration: 4,
      description: '男主角侧脸特写，自信地点头',
      dialogue: '当然，我还帮你检查了一遍',
      sound: '音乐渐强'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'handheld',
      duration: 5,
      description: '两人走进教室，同学们抬头看向他们',
      dialogue: '',
      sound: '教室嘈杂声'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 8,
      description: '镜头从教室后门缓缓推进，展示整个教室场景',
      dialogue: '',
      sound: '上课铃声响起'
    }
  ],
  aiPodcast: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 6,
      description: '抽象的数字空间背景，流动的数据流',
      dialogue: '',
      sound: '电子合成音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 4,
      description: 'AI主播形象出现，微笑着向观众打招呼',
      dialogue: '大家好，欢迎来到今天的播客',
      sound: '开场音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 5,
      description: 'AI主播面部特写，表情自然流畅',
      dialogue: '今天我们要聊的话题是人工智能的未来',
      sound: '轻柔的背景音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 6,
      description: '镜头展示虚拟演播室，科技感十足',
      dialogue: '',
      sound: '科技感音效'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 4,
      description: 'AI主播手势特写，强调重点',
      dialogue: 'AI正在改变我们的生活方式',
      sound: '音效强调'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 7,
      description: '虚拟场景切换，展示AI应用场景',
      dialogue: '',
      sound: '转场音效'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 5,
      description: 'AI主播继续讲解，表情生动',
      dialogue: '从医疗到教育，AI无处不在',
      sound: '背景音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 4,
      description: '镜头推进，展示数据可视化图表',
      dialogue: '',
      sound: '数据流动音效'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'arc',
      duration: 5,
      description: 'AI主播总结陈词，表情真诚',
      dialogue: '让我们拥抱这个AI时代',
      sound: '音乐渐强'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 6,
      description: '镜头缓缓拉远，AI主播挥手告别',
      dialogue: '感谢收看，下期再见',
      sound: '结束音乐'
    }
  ],
  advertisement: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 5,
      description: '产品在纯白背景中展示，灯光柔和',
      dialogue: '',
      sound: '轻柔的音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'dolly',
      duration: 3,
      description: '产品细节特写，展示质感',
      dialogue: '',
      sound: '细节展示音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 4,
      description: '产品旋转展示，全方位呈现',
      dialogue: '',
      sound: '旋转音效'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 3,
      description: '产品Logo特写，品牌标识清晰',
      dialogue: '',
      sound: '品牌音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 5,
      description: '模特使用产品，展示实际效果',
      dialogue: '',
      sound: '使用场景音效'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 3,
      description: '模特满意表情特写',
      dialogue: '',
      sound: '满意的音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 4,
      description: '产品与其他配件搭配展示',
      dialogue: '',
      sound: '轻快音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 3,
      description: '产品价格标签特写',
      dialogue: '',
      sound: '价格展示音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 5,
      description: '产品在多种场景中应用展示',
      dialogue: '',
      sound: '场景切换音效'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 6,
      description: '镜头拉远，产品与品牌标语同时展示',
      dialogue: '',
      sound: '品牌音乐'
    }
  ],
  mv: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 8,
      description: '夜空下的城市，霓虹灯闪烁',
      dialogue: '',
      sound: '前奏音乐'
    },
    {
      shotSize: 'long',
      cameraMovement: 'tracking',
      duration: 6,
      description: '歌手在屋顶漫步，风吹动头发',
      dialogue: '',
      sound: '主歌音乐开始'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'dolly',
      duration: 4,
      description: '歌手面部特写，深情演唱',
      dialogue: '（歌词）在这城市的夜晚',
      sound: '歌声'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 5,
      description: '镜头展示城市夜景，车流如织',
      dialogue: '',
      sound: '音乐节奏加强'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 3,
      description: '歌手手势特写，配合歌词',
      dialogue: '（歌词）寻找你的身影',
      sound: '音乐高潮'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 6,
      description: '歌手在街道上奔跑，镜头跟随',
      dialogue: '',
      sound: '动感音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 4,
      description: '歌手停下，仰望天空',
      dialogue: '（歌词）星空下的誓言',
      sound: '音乐放缓'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 5,
      description: '镜头缓缓推进，歌手微笑',
      dialogue: '',
      sound: '温暖音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'arc',
      duration: 4,
      description: '歌手挥手告别，镜头环绕',
      dialogue: '（歌词）再见我的爱人',
      sound: '音乐渐弱'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 8,
      description: '镜头拉远，歌手身影消失在夜色中',
      dialogue: '',
      sound: '音乐结束'
    }
  ],
  documentary: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 10,
      description: '古老村庄全景，晨雾缭绕',
      dialogue: '',
      sound: '自然环境音'
    },
    {
      shotSize: 'long',
      cameraMovement: 'tracking',
      duration: 8,
      description: '老人走在石板路上，步伐缓慢',
      dialogue: '',
      sound: '脚步声'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 6,
      description: '老人停下，抚摸老树',
      dialogue: '',
      sound: '轻柔音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 4,
      description: '老人面部特写，皱纹清晰可见',
      dialogue: '',
      sound: '环境音'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 5,
      description: '镜头展示村庄建筑，古朴典雅',
      dialogue: '',
      sound: '背景音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 4,
      description: '老人手中拿着旧照片',
      dialogue: '',
      sound: '照片翻动音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 7,
      description: '老人走向祠堂，镜头跟随',
      dialogue: '',
      sound: '脚步声'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 5,
      description: '祠堂牌匾特写，字迹斑驳',
      dialogue: '',
      sound: '庄重音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 6,
      description: '老人在祠堂前跪拜',
      dialogue: '',
      sound: '仪式音效'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 10,
      description: '镜头缓缓拉远，展示整个村庄和老人',
      dialogue: '',
      sound: '音乐渐强'
    }
  ],
  other: [
    {
      shotSize: 'extremeLong',
      cameraMovement: 'static',
      duration: 8,
      description: '开场远景，交代环境背景',
      dialogue: '',
      sound: '环境音'
    },
    {
      shotSize: 'long',
      cameraMovement: 'tracking',
      duration: 6,
      description: '主体人物入场，镜头跟随',
      dialogue: '',
      sound: '背景音乐'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 5,
      description: '人物停下，环顾四周',
      dialogue: '',
      sound: '环境音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 4,
      description: '人物面部特写，展示表情',
      dialogue: '',
      sound: '音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'pan',
      duration: 5,
      description: '镜头展示周围环境',
      dialogue: '',
      sound: '背景音乐'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'tilt',
      duration: 4,
      description: '人物动作特写',
      dialogue: '',
      sound: '动作音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'tracking',
      duration: 6,
      description: '人物移动，镜头跟随',
      dialogue: '',
      sound: '环境音'
    },
    {
      shotSize: 'closeUp',
      cameraMovement: 'static',
      duration: 5,
      description: '重要细节特写',
      dialogue: '',
      sound: '音效'
    },
    {
      shotSize: 'medium',
      cameraMovement: 'dolly',
      duration: 6,
      description: '镜头推进，营造紧张感',
      dialogue: '',
      sound: '音乐渐强'
    },
    {
      shotSize: 'long',
      cameraMovement: 'crane',
      duration: 8,
      description: '镜头拉远，结束场景',
      dialogue: '',
      sound: '音乐渐弱'
    }
  ]
}

export function generateMockShots(
  projectId: string,
  projectType: ProjectType = 'shortDrama'
): Omit<StoryboardShot, 'id' | 'createdAt' | 'updatedAt'>[] {
  const templates = shotTemplates[projectType] || shotTemplates.other
  const now = new Date().toISOString()

  return templates.map((template, index) => ({
    projectId,
    shotNumber: index + 1,
    sceneNumber: `SC${String(index + 1).padStart(2, '0')}`,
    shotSize: template.shotSize,
    cameraMovement: template.cameraMovement,
    duration: template.duration,
    description: template.description,
    dialogue: template.dialogue,
    sound: template.sound,
    createdBy: 'system',
    aiGenerated: true
  }))
}

export function getShotSizeLabel(size: ShotSize): string {
  const labels: Record<ShotSize, string> = {
    extremeLong: '远景',
    long: '全景',
    medium: '中景',
    closeUp: '近景',
    extremeCloseUp: '特写'
  }
  return labels[size]
}

export function getCameraMovementLabel(movement: CameraMovement): string {
  const labels: Record<CameraMovement, string> = {
    static: '固定',
    pan: '摇',
    tilt: '俯仰',
    dolly: '推拉',
    truck: '平移',
    pedestral: '升降',
    crane: '吊臂',
    handheld: '手持',
    steadicam: '斯坦尼康',
    tracking: '跟拍',
    arc: '弧形'
  }
  return labels[movement]
}
