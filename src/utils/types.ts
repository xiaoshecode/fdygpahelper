/** 成绩册单行记录（仅保留计算所需的列） */
export interface IGradeRecord {
  '学号': string
  '姓名': string
  '学分': string
  '成绩': string
  '教学班级': string
  '绩点成绩': string
  '课程属性': string
}

/** 输出到 Excel 的结果行 */
export interface IRankRecord {
  '年级排名(全部)': string
  '年级排名(必限)': string
  '班级排名(全部)': string
  '班级排名(必限)': string
  '学号': string
  '姓名': string
  '班级': string
  '全部课程GPA': string
  '全部课程学分': string
  '必修限选GPA': string
  '必修限选学分': string
  '已修总学分数': string
  '已修必限学分数': string
  '备注': string
}

export interface ISumByCourseType {
  required: number
  all: number
}

export interface ICourseInfo {
  grade: number
  credit: number
  courseType: string
}

export interface IStudent {
  id: string
  name: string
  classNo: string
  courses: ICourseInfo[]
  /** 已修学分（含不参与 GPA 计算的课程，排除 W、I、星号、F 等标记） */
  totalCredits: ISumByCourseType
  /** 参与 GPA 计算的学分 */
  credits: ISumByCourseType
  gpa: ISumByCourseType
  allRank: number
  requiredRank: number
  classAllRank: number
  classRequiredRank: number
}
