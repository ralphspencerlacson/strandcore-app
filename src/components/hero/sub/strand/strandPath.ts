import { strands } from './strand.data'

export function strandPath(index: number) {
  const { startX, y } = strands[index]
  const outer = index === 0 || index === 3
  const flatX = outer ? 180 : 175
  const bendX = outer ? 335 : 330
  const coreX = outer ? 298 : 350
  return `M${startX} ${y} H${flatX} C${bendX} ${y} ${coreX} 200 520 200`
}
