import { IGradeRecord, IRankRecord, IStudent } from './types'

/** 成绩为这些标记时不计入“已修学分” */
const EXCLUDED_GRADES = ['W', 'I', '*', 'F']
/** 计入“必修限选”统计的课程属性 */
const REQUIRED_TYPES = ['必修', '限选']

const floatEqual = (a: number, b: number) => Math.abs(a - b) < 1e-6

/** 全角数字转半角（教学班级字段中可能出现全角数字） */
function fullWidthConvert(s: string): string {
  return s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
}

/**
 * 按 GPA 降序赋名次：GPA 相同（1e-6 容差）者并列同一名次，
 * 采用标准竞赛排名（如 1、2、2、4）。
 * @returns 存在并列情况的学生学号集合
 */
function rankByGpa(
  students: IStudent[],
  gpaOf: (s: IStudent) => number,
  setRank: (s: IStudent, rank: number) => void,
): Set<string> {
  const sorted = [...students].sort((a, b) => gpaOf(b) - gpaOf(a))
  const tied = new Set<string>()
  let rank = 0
  for (let i = 0; i < sorted.length; i++) {
    const sameAsPrev = i > 0 && floatEqual(gpaOf(sorted[i]), gpaOf(sorted[i - 1]))
    if (!sameAsPrev) rank = i + 1
    setRank(sorted[i], rank)
    if (sameAsPrev) {
      tied.add(sorted[i - 1].id)
      tied.add(sorted[i].id)
    }
  }
  return tied
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
  const tiedClassAll = new Set<string>()
  const tiedClassRequired = new Set<string>()
  const byClass = new Map<string, IStudent[]>()
  for (const student of all) {
    const list = byClass.get(student.classNo) ?? []
    list.push(student)
    byClass.set(student.classNo, list)
  }
  for (const classStudents of byClass.values()) {
    rankByGpa(classStudents, (s) => s.gpa.all, (s, r) => (s.classAllRank = r))
      .forEach((id) => tiedClassAll.add(id))
    rankByGpa(classStudents, (s) => s.gpa.required, (s, r) => (s.classRequiredRank = r))
      .forEach((id) => tiedClassRequired.add(id))
  }

  return all
    .sort((a, b) => a.allRank - b.allRank)
    .map((s) => {
      const tiedLabels = [
        [tiedAll, '年级排名(全部)'],
        [tiedRequired, '年级排名(必限)'],
        [tiedClassAll, '班级排名(全部)'],
        [tiedClassRequired, '班级排名(必限)'],
      ]
        .filter(([set]) => (set as Set<string>).has(s.id))
        .map(([, label]) => label as string)

      return {
        '年级排名(全部)': String(s.allRank),
        '年级排名(必限)': String(s.requiredRank),
        '班级排名(全部)': String(s.classAllRank),
        '班级排名(必限)': String(s.classRequiredRank),
        '学号': s.id,
        '姓名': s.name,
        '班级': s.classNo,
        '全部课程GPA': s.gpa.all.toFixed(6),
        '全部课程学分': s.credits.all.toFixed(1),
        '必修限选GPA': s.gpa.required.toFixed(6),
        '必修限选学分': s.credits.required.toFixed(1),
        '已修总学分数': s.totalCredits.all.toFixed(1),
        '已修必限学分数': s.totalCredits.required.toFixed(1),
        '备注': tiedLabels.length > 0 ? `存在相同 GPA 并列同一名次：${tiedLabels.join('、')}` : '',
      }
    })
}
