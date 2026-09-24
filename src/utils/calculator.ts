import { IGradeRecord, IRankRecord, IStudent } from './types'

/** 成绩为这些标记时不计入“已修学分” */
const EXCLUDED_GRADES = ['W', 'I', '*', 'F']
/** 计入“必修限选”统计的课程属性 */
const REQUIRED_TYPES = ['必修', '限选']
/** GPA 在结果表中保留的小数位数 */
const DISPLAY_DECIMALS = 6

/** 全角数字转半角（教学班级字段中可能出现全角数字） */
function fullWidthConvert(s: string): string {
  return s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
}

/**
 * 按未四舍五入的精确 GPA 降序排名：
 * - 精确值完全相等者并列同一名次（标准竞赛排名，如 1、2、2、4）
 * - 仅显示值（保留 6 位小数）相同但精确值不同者，名次不同，单独返回以便在备注中说明
 * @returns exactTied：精确值并列的学号集合；roundTied：仅显示值并列的学号集合
 */
function rankByGpa(
  students: IStudent[],
  gpaOf: (s: IStudent) => number,
  setRank: (s: IStudent, rank: number) => void,
): { exactTied: Set<string>; roundTied: Set<string> } {
  const sorted = [...students].sort((a, b) => gpaOf(b) - gpaOf(a))
  const exactTied = new Set<string>()
  const rankOf = new Map<string, number>()
  let rank = 0
  for (let i = 0; i < sorted.length; i++) {
    const sameAsPrev = i > 0 && gpaOf(sorted[i]) === gpaOf(sorted[i - 1])
    if (!sameAsPrev) rank = i + 1
    setRank(sorted[i], rank)
    rankOf.set(sorted[i].id, rank)
    if (sameAsPrev) {
      exactTied.add(sorted[i - 1].id)
      exactTied.add(sorted[i].id)
    }
  }

  // 按显示值分组：组内存在不同名次时，拥有唯一名次的成员属于“四舍五入并列”
  const roundTied = new Set<string>()
  const byDisplay = new Map<string, IStudent[]>()
  for (const s of sorted) {
    const key = gpaOf(s).toFixed(DISPLAY_DECIMALS)
    const group = byDisplay.get(key) ?? []
    group.push(s)
    byDisplay.set(key, group)
  }
  for (const group of byDisplay.values()) {
    if (group.length < 2) continue
    const rankCount = new Map<number, number>()
    for (const s of group) {
      const r = rankOf.get(s.id)!
      rankCount.set(r, (rankCount.get(r) ?? 0) + 1)
    }
    for (const s of group) {
      if (rankCount.get(rankOf.get(s.id)!) === 1) roundTied.add(s.id)
    }
  }
  return { exactTied, roundTied }
}

/**
 * 计算每位学生的 GPA 与年级/班级排名
 * @param records 成绩册中的全部记录
 * @returns 可写入 Excel 的结果行，按年级排名(全部)升序排列
 */
export function calculateGpaAndRank(records: IGradeRecord[]): IRankRecord[] {
  const students = new Map<string, IStudent>()

  for (const row of records) {
    let student = students.get(row['学号'])
    if (!student) {
      student = {
        id: row['学号'],
        name: row['姓名'],
        classNo: fullWidthConvert(row['教学班级']),
        courses: [],
        totalCredits: { required: 0, all: 0 },
        credits: { required: 0, all: 0 },
        gpa: { required: 0, all: 0 },
        allRank: 0,
        requiredRank: 0,
        classAllRank: 0,
        classRequiredRank: 0,
      }
      students.set(student.id, student)
    }

    const credit = parseFloat(row['学分'])
    const courseType = row['课程属性']

    if (!EXCLUDED_GRADES.includes(row['成绩'])) {
      student.totalCredits.all += credit
      if (REQUIRED_TYPES.includes(courseType)) student.totalCredits.required += credit
    }

    const grade = parseFloat(row['绩点成绩'])
    if (Number.isNaN(grade)) continue
    student.courses.push({ grade, credit, courseType })
  }

  for (const student of students.values()) {
    let allSum = 0
    let allCredits = 0
    let requiredSum = 0
    let requiredCredits = 0
    for (const course of student.courses) {
      allSum += course.grade * course.credit
      allCredits += course.credit
      if (REQUIRED_TYPES.includes(course.courseType)) {
        requiredSum += course.grade * course.credit
        requiredCredits += course.credit
      }
    }
    student.gpa.all = allCredits > 0 ? allSum / allCredits : 0
    student.gpa.required = requiredCredits > 0 ? requiredSum / requiredCredits : 0
    student.credits = { required: requiredCredits, all: allCredits }
  }

  const all = [...students.values()]
  const tiedAll = rankByGpa(all, (s) => s.gpa.all, (s, r) => (s.allRank = r))
  const tiedRequired = rankByGpa(all, (s) => s.gpa.required, (s, r) => (s.requiredRank = r))

  // 按班级分组，每个班级只排序一次
  const tiedClassAll = { exactTied: new Set<string>(), roundTied: new Set<string>() }
  const tiedClassRequired = { exactTied: new Set<string>(), roundTied: new Set<string>() }
  const byClass = new Map<string, IStudent[]>()
  for (const student of all) {
    const list = byClass.get(student.classNo) ?? []
    list.push(student)
    byClass.set(student.classNo, list)
  }
  for (const classStudents of byClass.values()) {
    const r1 = rankByGpa(classStudents, (s) => s.gpa.all, (s, r) => (s.classAllRank = r))
    r1.exactTied.forEach((id) => tiedClassAll.exactTied.add(id))
    r1.roundTied.forEach((id) => tiedClassAll.roundTied.add(id))
    const r2 = rankByGpa(classStudents, (s) => s.gpa.required, (s, r) => (s.classRequiredRank = r))
    r2.exactTied.forEach((id) => tiedClassRequired.exactTied.add(id))
    r2.roundTied.forEach((id) => tiedClassRequired.roundTied.add(id))
  }

  const dimensions: Array<[{ exactTied: Set<string>; roundTied: Set<string> }, string]> = [
    [tiedAll, '年级排名(全部)'],
    [tiedRequired, '年级排名(必限)'],
    [tiedClassAll, '班级排名(全部)'],
    [tiedClassRequired, '班级排名(必限)'],
  ]

  return all
    .sort((a, b) => a.allRank - b.allRank)
    .map((s) => {
      const exactLabels = dimensions.filter(([t]) => t.exactTied.has(s.id)).map(([, label]) => label)
      const roundLabels = dimensions.filter(([t]) => t.roundTied.has(s.id)).map(([, label]) => label)
      const remarks: string[] = []
      if (exactLabels.length > 0) remarks.push(`GPA 完全相同，并列同一名次：${exactLabels.join('、')}`)
      if (roundLabels.length > 0) {
        remarks.push(`GPA 保留 ${DISPLAY_DECIMALS} 位小数后与他人相同，按未四舍五入的精确成绩排名：${roundLabels.join('、')}`)
      }

      return {
        '年级排名(全部)': String(s.allRank),
        '年级排名(必限)': String(s.requiredRank),
        '班级排名(全部)': String(s.classAllRank),
        '班级排名(必限)': String(s.classRequiredRank),
        '学号': s.id,
        '姓名': s.name,
        '班级': s.classNo,
        '全部课程GPA': s.gpa.all.toFixed(DISPLAY_DECIMALS),
        '全部课程学分': s.credits.all.toFixed(1),
        '必修限选GPA': s.gpa.required.toFixed(DISPLAY_DECIMALS),
        '必修限选学分': s.credits.required.toFixed(1),
        '已修总学分数': s.totalCredits.all.toFixed(1),
        '已修必限学分数': s.totalCredits.required.toFixed(1),
        '备注': remarks.join('；'),
      }
    })
}
