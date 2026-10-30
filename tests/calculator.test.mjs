import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

// Node >= 22.13; test pure domain modules without browser or Excel dependencies.
async function loadSource(name) {
  const source = await readFile(new URL(`../src/utils/${name}.ts`, import.meta.url), 'utf8')
  return import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`)
}
const { normalizeGradeRecords } = await loadSource('records')
const { calculateGpaAndRank } = await loadSource('calculator')
const row = (overrides = {}) => ({ 学号: '001', 姓名: '测试', 学分: 0.8, 成绩: 'A', 教学班级: 1, 绩点成绩: 4, 课程属性: '必修', ...overrides })

test('numeric Excel cells normalize before GPA calculation', () => {
  const result = calculateGpaAndRank(normalizeGradeRecords([row()]))[0]
  assert.equal(result['班级'], '1')
  assert.equal(result['学号'], '001')
  assert.equal(result['全部课程GPA'], '4.000000')
  assert.equal(result['全部课程学分'], '0.8')
})
test('missing columns produce an explicit validation error', () => {
  const incomplete = row(); delete incomplete['教学班级']
  assert.throws(() => normalizeGradeRecords([incomplete]), /缺少列/)
})
test('empty input and missing identity are rejected', () => {
  assert.throws(() => normalizeGradeRecords([]), /没有成绩/)
  assert.throws(() => normalizeGradeRecords([row({ 学号: '' })]), /缺少学号/)
})
test('invalid credits cannot contaminate GPA with NaN', () => {
  for (const value of ['', 'bad', Infinity, -1, '2oops']) {
    assert.throws(() => normalizeGradeRecords([row({ 学分: value })]), /学分无效/)
  }
})
test('pass grades without grade points remain valid', () => {
  const result = calculateGpaAndRank(normalizeGradeRecords([row({ 成绩: 'P', 绩点成绩: '' })]))[0]
  assert.equal(result['全部课程学分'], '0.0')
  assert.equal(result['已修总学分数'], '0.8')
})
test('equal GPA preserves competition ranking and class normalization', () => {
  const result = calculateGpaAndRank(normalizeGradeRecords([
    row(), row({ 学号: '002', 教学班级: '１' }), row({ 学号: '003', 绩点成绩: 3 }),
  ]))
  assert.deepEqual(result.map(x => x['年级排名(全部)']), ['1', '1', '3'])
  assert.deepEqual(result.map(x => x['班级排名(全部)']), ['1', '1', '3'])
})
