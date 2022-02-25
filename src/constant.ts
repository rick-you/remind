const TopicStyle = {
  fontSize: 22,
  fontFamily: '微软雅黑,-apple-system',
  radius: 5,
  padding: 5,
  maxWidth: 240,
  minHeight: 30,
  defaultSize: [150, 40],
}

const canvasContext = document.createElement('canvas').getContext('2d')!

enum EDITOR_MODE {
  none,
  drag,
  edit,
}

export { canvasContext, EDITOR_MODE, TopicStyle }
