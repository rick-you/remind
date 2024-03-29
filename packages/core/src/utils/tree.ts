import { hierarchy } from 'd3-hierarchy'
import { HierarchyTopic, TopicData } from '../interface/topic'
import { uuid } from './uuid'

export class TopicWalker {
  static from(root: TopicData) {
    return new TopicWalker(root)
  }

  root: HierarchyTopic
  constructor(root: TopicData) {
    this.root = hierarchy<TopicData>(root)
  }

  getNodeById(targetId: string) {
    return this.root.descendants().find((node) => node.data.id === targetId)
  }

  getParentNode(targetId: string) {
    return this.getNodeById(targetId)?.parent?.data
  }

  getPreviousSibling(id: string) {
    const parent = this.getParentNode(id)
    const children = parent?.children
    if (parent && children) {
      const index = children.findIndex((node) => node.id === id)
      return children[index - 1]
    }
  }

  getNextSibling(id: string) {
    const parent = this.getParentNode(id)
    const children = parent?.children
    if (parent && children) {
      const index = children.findIndex((node) => node.id === id)
      return children[index + 1]
    }
  }

  getNodeJustify(id: string): TopicData['justify'] {
    const justifyStart = this.getNodeById(id)
      ?.ancestors()
      .some((node) => node.data.justify === 'start')
    return justifyStart ? 'start' : 'end'
  }
}

export function createTopic(title: string, options: Partial<TopicData> = {}) {
  const topic: TopicData = {
    id: uuid(),
    title,
    ...options,
  }
  return topic
}

export function eachDF(
  root: HierarchyTopic,
  callback: (node: HierarchyTopic) => void,
) {
  let nodes = [root]
  let current
  while ((current = nodes.shift())) {
    callback(current)
    const children = current.children ?? []
    nodes = [...children, ...nodes]
  }
}
