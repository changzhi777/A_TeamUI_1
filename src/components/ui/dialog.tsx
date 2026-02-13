/**
 * Dialog 对话框组件
 *
 * 基于 Radix UI Dialog 封装的模态对话框组件
 * 用于显示需要用户关注或交互的内容，如确认框、表单、向导等
 *
 * ## 组件结构
 * ```
 * <Dialog>                          // 根容器，管理打开/关闭状态
 *   <DialogTrigger>                 // 触发器，点击打开对话框
 *     打开对话框
 *   </DialogTrigger>
 *   <DialogContent>                 // 对话框内容
 *     <DialogHeader>                // 头部区域
 *       <DialogTitle>标题</DialogTitle>
 *       <DialogDescription>描述</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>                // 底部区域，通常放按钮
 *       <Button>确认</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * ## 使用示例
 * ```tsx
 * // 受控模式（推荐）
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent className="max-w-4xl">
 *     <DialogTitle>导入向导</DialogTitle>
 *     <div>内容...</div>
 *   </DialogContent>
 * </Dialog>
 *
 * // 非受控模式
 * <Dialog defaultOpen={false}>
 *   <DialogTrigger asChild>
 *     <Button>打开</Button>
 *   </DialogTrigger>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 * ```
 *
 * ## DialogContent 样式参数（通过 className 传入）
 * | 参数 | 说明 | 示例 |
 * |------|------|------|
 * | w-[Xvw] | 宽度为视口的X% | w-[90vw] |
 * | max-w-[Xpx] | 最大宽度（像素） | max-w-[1800px] |
 * | max-w-[Xvw] | 最大宽度（视口百分比） | max-w-[80vw] |
 * | max-h-[Xvh] | 最大高度 | max-h-[90vh] |
 * | min-w-[Xpx] | 最小宽度 | min-w-[600px] |
 * | min-h-[Xpx] | 最小高度 | min-h-[400px] |
 * | p-X | 内边距 | p-6 (24px) |
 * | overflow-y-auto | 内容溢出时显示垂直滚动条 | overflow-y-auto |
 * | overflow-auto | 内容溢出时显示滚动条 | overflow-auto |
 *
 * ## 默认启用的功能
 * - 横版显示：默认 1000×600 像素（16:9 比例）
 * - 可拖拽调整大小：通过 8 个方向的拖拽手柄（边角和边缘中点）
 * - 无滚动条：内容自适应窗口大小
 *
 * ## 横版默认参数
 * | 参数 | 默认值 | 说明 |
 * |------|--------|------|
 * | defaultWidth | 1000px | 默认宽度 |
 * | defaultHeight | 600px | 默认高度 |
 * | minWidth | 600px | 最小宽度 |
 * | minHeight | 400px | 最小高度 |
 * | max-w | 90vw | 最大宽度为视口 90% |
 *
 * @see https://www.radix-ui.com/primitives/docs/components/dialog
 */

'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// 拖拽调整大小相关类型和常量
// ============================================================================

/** 拖拽方向类型 */
type ResizeDirection =
  | 'n'   // 北（上边）
  | 's'   // 南（下边）
  | 'e'   // 东（右边）
  | 'w'   // 西（左边）
  | 'ne'  // 东北（右上角）
  | 'nw'  // 西北（左上角）
  | 'se'  // 东南（右下角）
  | 'sw'  // 西南（左下角）

/** 拖拽手柄配置 */
interface ResizeHandle {
  direction: ResizeDirection
  className: string
  cursor: string
}

/** 8 个方向的拖拽手柄配置 */
const RESIZE_HANDLES: ResizeHandle[] = [
  // 边角手柄
  { direction: 'nw', className: '-top-1 -start-1 cursor-nw-resize', cursor: 'nwse-resize' },
  { direction: 'ne', className: '-top-1 -end-1 cursor-ne-resize', cursor: 'nesw-resize' },
  { direction: 'sw', className: '-bottom-1 -start-1 cursor-sw-resize', cursor: 'nesw-resize' },
  { direction: 'se', className: '-bottom-1 -end-1 cursor-se-resize', cursor: 'nwse-resize' },
  // 边缘手柄
  { direction: 'n', className: '-top-1 start-1/2 -translate-x-1/2 cursor-n-resize', cursor: 'ns-resize' },
  { direction: 's', className: '-bottom-1 start-1/2 -translate-x-1/2 cursor-s-resize', cursor: 'ns-resize' },
  { direction: 'w', className: 'top-1/2 -start-1 -translate-y-1/2 cursor-w-resize', cursor: 'ew-resize' },
  { direction: 'e', className: 'top-1/2 -end-1 -translate-y-1/2 cursor-e-resize', cursor: 'ew-resize' },
]

/** 默认最小尺寸 */
const DEFAULT_MIN_SIZE = { width: 600, height: 400 }

/** 默认横版尺寸（16:9 比例） */
const DEFAULT_LANDSCAPE_SIZE = { width: 1000, height: 600 }

// ============================================================================
// 拖拽调整大小 Hook
// ============================================================================

/**
 * useResizable - 可拖拽调整大小的 Hook
 *
 * @param options - 配置选项
 * @param options.minWidth - 最小宽度，默认 300px
 * @param options.minHeight - 最小高度，默认 200px
 * @param options.maxWidth - 最大宽度
 * @param options.maxHeight - 最大高度
 *
 * @returns 包含尺寸、拖拽事件处理和拖拽手柄组件的对象
 */
function useResizable(options: {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
} = {}) {
  const {
    minWidth = DEFAULT_MIN_SIZE.width,
    minHeight = DEFAULT_MIN_SIZE.height,
    maxWidth,
    maxHeight,
    defaultWidth = DEFAULT_LANDSCAPE_SIZE.width,
    defaultHeight = DEFAULT_LANDSCAPE_SIZE.height,
  } = options

  // 当前尺寸状态（默认为横版尺寸）
  const [size, setSize] = React.useState<{ width: number | null; height: number | null }>({
    width: defaultWidth,
    height: defaultHeight,
  })

  // 拖拽状态
  const [isResizing, setIsResizing] = React.useState(false)
  const [activeDirection, setActiveDirection] = React.useState<ResizeDirection | null>(null)

  // 拖拽起始位置和初始尺寸
  const startPos = React.useRef({ x: 0, y: 0 })
  const startSize = React.useRef({ width: 0, height: 0 })

  // 开始拖拽
  const handleResizeStart = React.useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsResizing(true)
      setActiveDirection(direction)

      // 记录起始位置
      startPos.current = { x: e.clientX, y: e.clientY }

      // 获取当前元素尺寸
      const target = e.currentTarget.parentElement
      if (target) {
        const rect = target.getBoundingClientRect()
        startSize.current = { width: rect.width, height: rect.height }
        // 初始化尺寸状态
        setSize({ width: rect.width, height: rect.height })
      }
    },
    []
  )

  // 拖拽中
  React.useEffect(() => {
    if (!isResizing || !activeDirection) return

    const handleMouseMove = (e: MouseEvent) => {
      // 计算位移
      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y

      // 根据方向计算新尺寸
      let newWidth = startSize.current.width
      let newHeight = startSize.current.height

      // 水平方向
      if (activeDirection.includes('e')) {
        newWidth = startSize.current.width + deltaX
      } else if (activeDirection.includes('w')) {
        newWidth = startSize.current.width - deltaX
      }

      // 垂直方向
      if (activeDirection.includes('s')) {
        newHeight = startSize.current.height + deltaY
      } else if (activeDirection.includes('n')) {
        newHeight = startSize.current.height - deltaY
      }

      // 应用最小/最大尺寸限制
      newWidth = Math.max(minWidth, maxWidth ? Math.min(maxWidth, newWidth) : newWidth)
      newHeight = Math.max(minHeight, maxHeight ? Math.min(maxHeight, newHeight) : newHeight)

      setSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setActiveDirection(null)
    }

    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // 拖拽时禁用选择文本
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isResizing, activeDirection, minWidth, minHeight, maxWidth, maxHeight, defaultWidth, defaultHeight])

  // 生成拖拽样式
  const resizeStyle = React.useMemo(() => {
    if (size.width === null && size.height === null) {
      return {}
    }
    return {
      width: size.width !== null ? `${size.width}px` : undefined,
      height: size.height !== null ? `${size.height}px` : undefined,
    }
  }, [size.width, size.height])

  // 拖拽手柄组件
  const ResizeHandles = React.useMemo(() => {
    return RESIZE_HANDLES.map((handle) => (
      <div
        key={handle.direction}
        data-resize-handle={handle.direction}
        className={cn(
          'absolute z-10',
          // 基础样式
          'transition-colors',
          // 尺寸：边角 12px，边缘 8px
          handle.direction.length === 2 ? 'size-3' : '',
          handle.direction === 'n' || handle.direction === 's' ? 'w-[calc(100%-1rem)] h-2' : '',
          handle.direction === 'e' || handle.direction === 'w' ? 'h-[calc(100%-1rem)] w-2' : '',
          // 位置
          handle.className
        )}
        onMouseDown={handleResizeStart(handle.direction)}
      />
    ))
  }, [handleResizeStart])

  return {
    size,
    isResizing,
    resizeStyle,
    ResizeHandles,
  }
}

// ============================================================================
// Dialog 组件
// ============================================================================

/**
 * Dialog 根组件
 *
 * 管理对话框的打开/关闭状态，提供上下文给子组件
 *
 * @param open - (可选) 控制对话框是否打开（受控模式）
 * @param defaultOpen - (可选) 默认是否打开（非受控模式），默认 false
 * @param onOpenChange - (可选) 对话框状态变化时的回调函数
 * @param modal - (可选) 是否为模态对话框，默认 true
 *                    模态：打开时禁止与页面其他部分交互
 *                    非模态：允许与页面其他部分交互
 *
 * @example
 * // 受控模式
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent>内容</DialogContent>
 * </Dialog>
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />
}

/**
 * DialogTrigger 触发器组件
 *
 * 点击时打开对话框的按钮或元素
 * 通常用于非受控模式，受控模式可直接使用普通按钮 + setState
 *
 * @param asChild - (可选) 是否将事件委托给子元素，默认 false
 *                  设为 true 时，子元素会接收点击事件
 *
 * @example
 * <DialogTrigger asChild>
 *   <Button>打开对话框</Button>
 * </DialogTrigger>
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
}

/**
 * DialogPortal 传送门组件
 *
 * 将对话框内容渲染到 DOM 树的指定位置（默认 body 末尾）
 * 避免被父元素的 overflow: hidden 或 z-index 影响
 *
 * @param container - (可选) 指定渲染的容器元素
 * @param forceMount - (可选) 强制挂载，用于动画控制
 *
 * 通常不需要直接使用，DialogContent 内部会自动使用
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />
}

/**
 * DialogClose 关闭按钮组件
 *
 * 点击时关闭对话框的按钮
 *
 * @param asChild - (可选) 是否将事件委托给子元素
 *
 * @example
 * <DialogClose asChild>
 *   <Button variant="outline">取消</Button>
 * </DialogClose>
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

/**
 * DialogOverlay 遮罩层组件
 *
 * 对话框背后的半透明黑色背景
 * - 阻止用户与页面其他部分交互（模态模式）
 * - 点击遮罩层可关闭对话框
 *
 * 样式说明：
 * - fixed inset-0: 固定定位，覆盖整个视口
 * - z-50: 层级为50，在普通内容之上
 * - bg-black/50: 50%透明度的黑色背景
 * - 动画效果：淡入淡出
 *
 * 通常不需要直接使用，DialogContent 内部会自动渲染
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      className={cn(
        // 固定定位，覆盖整个视口
        'fixed inset-0 z-50',
        // 半透明黑色背景
        'bg-black/50',
        // 关闭动画：淡出
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        // 打开动画：淡入
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

/**
 * DialogContent 内容组件
 *
 * 对话框的主要内容容器，包含：
 * - 遮罩层（自动渲染）
 * - 内容区域（居中显示）
 * - 关闭按钮（可选显示）
 * - 8 个方向的拖拽调整大小手柄
 *
 * @param className - 自定义样式类
 * @param children - 子元素（对话框内容）
 * @param showCloseButton - (可选) 是否显示右上角关闭按钮，默认 true
 * @param resizable - (可选) 是否启用拖拽调整大小，默认 true
 * @param minWidth - (可选) 最小宽度，默认 600px
 * @param minHeight - (可选) 最小高度，默认 400px
 * @param maxWidth - (可选) 最大宽度
 * @param maxHeight - (可选) 最大高度
 * @param defaultWidth - (可选) 默认宽度，默认 1000px（横版）
 * @param defaultHeight - (可选) 默认高度，默认 600px（横版）
 *
 * DialogContent 还支持以下 Radix UI 原生属性：
 * @param onCloseAutoFocus - 关闭后焦点自动聚焦的回调
 * @param onEscapeKeyDown - 按下 ESC 键的回调
 * @param onPointerDownOutside - 点击对话框外部的回调
 * @param onInteractOutside - 与对话框外部交互的回调
 * @param forceMount - 强制挂载，用于动画控制
 *
 * @example
 * // 基础用法（默认横版 1000×600，可拖拽调整大小）
 * <DialogContent>
 *   <DialogTitle>标题</DialogTitle>
 *   <p>内容</p>
 * </DialogContent>
 *
 * // 自定义尺寸
 * <DialogContent defaultWidth={1200} defaultHeight={700}>
 *   ...
 * </DialogContent>
 *
 * // 禁用拖拽调整大小
 * <DialogContent resizable={false}>
 *   ...
 * </DialogContent>
 *
 * // 自定义最小/最大尺寸
 * <DialogContent minWidth={800} minHeight={500} maxWidth={1600} maxHeight={900}>
 *   ...
 * </DialogContent>
 *
 * // 隐藏关闭按钮
 * <DialogContent showCloseButton={false}>
 *   ...
 * </DialogContent>
 *
 * // 禁止点击外部关闭
 * <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
 *   ...
 * </DialogContent>
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  resizable = true,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  defaultWidth,
  defaultHeight,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** 是否显示右上角关闭按钮 */
  showCloseButton?: boolean
  /** 是否启用拖拽调整大小 */
  resizable?: boolean
  /** 最小宽度（像素） */
  minWidth?: number
  /** 最小高度（像素） */
  minHeight?: number
  /** 最大宽度（像素） */
  maxWidth?: number
  /** 最大高度（像素） */
  maxHeight?: number
  /** 默认宽度（像素） */
  defaultWidth?: number
  /** 默认高度（像素） */
  defaultHeight?: number
}) {
  // 使用拖拽调整大小 Hook
  const { isResizing, resizeStyle, ResizeHandles } = useResizable({
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    defaultWidth,
    defaultHeight,
  })

  return (
    <DialogPortal data-slot='dialog-portal'>
      {/* 遮罩层 */}
      <DialogOverlay />
      {/* 内容容器 */}
      <DialogPrimitive.Content
        data-slot='dialog-content'
        className={cn(
          // === 定位 ===
          'fixed top-[50%] left-[50%]',      // 固定定位到视口中心
          'translate-x-[-50%] translate-y-[-50%]',  // 向左上偏移实现居中
          'z-50',                             // 层级

          // === 布局（横版） ===
          'flex flex-col',                    // 弹性布局，垂直排列
          'max-w-[90vw]',                     // 最大宽度：90% 视口宽度
          'gap-4',                            // 子元素间距16px

          // === 外观 ===
          'rounded-lg',                       // 圆角
          'border',                           // 边框
          'bg-background',                    // 背景色（跟随主题）
          'p-6',                              // 内边距24px
          'shadow-lg',                        // 大阴影

          // === 动画 ===
          'duration-200',                     // 动画时长200ms
          'data-[state=closed]:animate-out',  // 关闭动画
          'data-[state=closed]:fade-out-0',   // 淡出
          'data-[state=closed]:zoom-out-95',  // 缩小到95%
          'data-[state=open]:animate-in',     // 打开动画
          'data-[state=open]:fade-in-0',      // 淡入
          'data-[state=open]:zoom-in-95',     // 从95%放大

          // 拖拽时不应用过渡动画
          isResizing && 'transition-none',

          // 用户自定义样式（会覆盖上述默认样式）
          className
        )}
        style={resizable ? { ...resizeStyle, ...props.style } : props.style}
        {...props}
      >
        {/* 子元素（对话框内容） */}
        {children}

        {/* 拖拽调整大小手柄（8 个方向） */}
        {resizable && ResizeHandles}

        {/* 右上角关闭按钮 */}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot='dialog-close'
            className={cn(
              // === 定位 ===
              'absolute',          // 绝对定位
              'end-4',             // 右边距16px（RTL支持）
              'top-4',             // 上边距16px

              // === 外观 ===
              'rounded-xs',        // 小圆角
              'opacity-70',        // 70%透明度
              'ring-offset-background',  // focus ring 偏移

              // === 交互 ===
              'transition-opacity',           // 透明度过渡动画
              'hover:opacity-100',            // 悬停时100%不透明
              'focus:ring-2',                 // focus时显示ring
              'focus:ring-ring',              // ring颜色
              'focus:ring-offset-2',          // ring偏移
              'focus:outline-hidden',         // 隐藏默认outline
              'disabled:pointer-events-none', // 禁用时禁用点击

              // === 状态样式 ===
              'data-[state=open]:bg-accent',              // 打开时背景色
              'data-[state=open]:text-muted-foreground',  // 打开时文字颜色

              // === 图标样式 ===
              '[&_svg]:pointer-events-none',               // SVG禁用点击
              '[&_svg]:shrink-0',                          // SVG不收缩
              '[&_svg:not([class*="size-"])]:size-4',     // SVG默认尺寸16px
            )}
          >
            <XIcon />
            {/* 屏幕阅读器文本 */}
            <span className='sr-only'>关闭</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * DialogHeader 头部组件
 *
 * 用于包装对话框的标题和描述区域
 * 默认样式：
 * - flex flex-col: 弹性布局，垂直排列
 * - gap-2: 子元素间距8px
 * - text-center: 文字居中
 * - sm:text-start: 小屏幕左对齐
 *
 * @example
 * <DialogHeader>
 *   <DialogTitle>标题</DialogTitle>
 *   <DialogDescription>描述文字</DialogDescription>
 * </DialogHeader>
 */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn(
        'flex flex-col gap-2 text-center sm:text-start',
        className
      )}
      {...props}
    />
  )
}

/**
 * DialogFooter 底部组件
 *
 * 用于包装对话框底部的按钮区域
 * 默认样式：
 * - 移动端：垂直排列，按钮反向排列（确认按钮在底部）
 * - 桌面端：水平排列，按钮靠右对齐
 *
 * @example
 * <DialogFooter>
 *   <Button variant="outline">取消</Button>
 *   <Button>确认</Button>
 * </DialogFooter>
 */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

/**
 * DialogTitle 标题组件
 *
 * 对话框的标题，用于告诉用户对话框的目的
 * - 语义化：会被屏幕阅读器识别并朗读
 * - 样式：较大字体、粗体
 *
 * @example
 * <DialogTitle>导入分镜头向导</DialogTitle>
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn(
        'text-lg',           // 字体大小18px
        'leading-none',      // 行高1
        'font-semibold',     // 粗体
        className
      )}
      {...props}
    />
  )
}

/**
 * DialogDescription 描述组件
 *
 * 对话框的描述文字，用于补充说明标题
 * - 语义化：会被屏幕阅读器识别
 * - 样式：较小字体、灰色文字
 *
 * @example
 * <DialogDescription>
 *   请选择要导入的文件，支持 CSV、JSON 格式
 * </DialogDescription>
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn(
        'text-sm',               // 字体大小14px
        'text-muted-foreground', // 灰色文字
        className
      )}
      {...props}
    />
  )
}

// 导出所有组件
export {
  Dialog,           // 根组件
  DialogClose,      // 关闭按钮
  DialogContent,    // 内容容器
  DialogDescription,// 描述文字
  DialogFooter,     // 底部区域
  DialogHeader,     // 头部区域
  DialogOverlay,    // 遮罩层
  DialogPortal,     // 传送门
  DialogTitle,      // 标题
  DialogTrigger,    // 触发器
}
