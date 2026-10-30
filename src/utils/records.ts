import type { IGradeRecord } from './types'

const COLUMNS = ['学号', '姓名', '学分', '成绩', '教学班级', '绩点成绩', '课程属性'] as const

/** SheetJS 保留数字单元格类型；在计算边界统一类型并拒绝不完整数据。 */
export function normalizeGradeRecords(rows: Record<string, unknown>[]): IGradeRecord[] {
  if (rows.length === 0) throw new Error('成绩册中没有成绩记录')
  return rows.map((row, index) => {
    const record = {} as IGradeRecord
    for (const column of COLUMNS) {
      if (!Object.hasOwn(row, column)) throw new Error(`成绩册缺少列：${column}`)
      record[column] = String(row[column] ?? '').trim()
    }
    if (!record['学号'] || !record['姓名'] || !record['教学班级']) {
      throw new Error(`第 ${index + 2} 行缺少学号、姓名或教学班级`)
    }
    const credit = Number(record['学分'])
    if (!record['学分'] || !Number.isFinite(credit) || credit < 0) {
      throw new Error(`第 ${index + 2} 行学分无效`)
    }
    return record
  })
}
