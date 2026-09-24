import * as XLSX from 'xlsx'
import { IGradeRecord, IRankRecord } from './types'

/** 读取成绩册文件（xls/xlsx），解析为按表头键名的 JSON 行列表 */
export async function readExcelFile(file: File): Promise<IGradeRecord[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(worksheet)
}

/** 将结果行写入 Excel 并触发浏览器下载 */
export function generateExcel(data: IRankRecord[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}
